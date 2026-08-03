// controllers/withdrawal.controller.ts
import { Response, NextFunction } from "express";
import prisma from "../../libs/prisma";
import { NotFoundError, AuthError, ValidationError } from "../../error-handler";
import { initiateTransfer } from "../../services/flutterwave.service";

const MIN_WITHDRAWAL_AMOUNT = 1000; // adjust per currency later if needed

// ── REQUEST WITHDRAWAL ─────────────────────────────────────────────────────
export const requestWithdrawal = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const { bankAccountId, amount, currencyId = "NGN" } = req.body;

    if (!bankAccountId || !amount) {
      return next(new ValidationError("bankAccountId and amount are required."));
    }
    if (Number(amount) < MIN_WITHDRAWAL_AMOUNT) {
      return next(new ValidationError(`Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT}.`));
    }

    const bankAccount = await prisma.agencyBankAccounts.findUnique({ where: { id: bankAccountId } });
    if (!bankAccount || bankAccount.agencyId !== req.agency.id) {
      return next(new ValidationError("Bank account not found for this agency."));
    }

    const wallet = await prisma.agencyWallets.findUnique({
      where: { agencyId_currencyId: { agencyId: req.agency.id, currencyId } },
    });
    if (!wallet || wallet.balance.lessThan(amount)) {
      return next(new ValidationError("Insufficient wallet balance."));
    }

    // Debit immediately (PENDING withdrawal), reverse on failure — prevents
    // double-withdrawal from the same balance while a transfer is in flight
    const withdrawal = await prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore.minus(amount);

      await tx.agencyWallets.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });

      const created = await tx.withdrawals.create({
        data: {
          agencyId: req.agency.id,
          walletId: wallet.id,
          bankAccountId,
          amount,
          currencyId,
          status: "PENDING",
        },
      });

      await tx.walletTransactions.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT",
          status: "PENDING",
          amount,
          balanceBefore,
          balanceAfter,
          purpose: "WITHDRAWAL",
          withdrawalId: created.id,
        },
      });

      return created;
    });

    try {
      const transfer = await initiateTransfer({
        amount: Number(amount),
        currency: currencyId,
        accountBank: bankAccount.bankName, // NOTE: must be Flutterwave's bank code, not free-text name — see flag below
        accountNumber: bankAccount.accountNumber,
        narration: `Withdrawal - ${req.agency.id}`,
        reference: withdrawal.id,
      });

      await prisma.withdrawals.update({
        where: { id: withdrawal.id },
        data: { status: "PROCESSING", flwTransferId: String(transfer.id) },
      });
    } catch (transferError) {
      // Transfer call itself failed — reverse the debit immediately
      await reverseWithdrawal(withdrawal.id, "Transfer initiation failed");
      return next(new ValidationError("Withdrawal could not be initiated. Please try again."));
    }

    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    next(error);
  }
};

async function reverseWithdrawal(withdrawalId: string, reason: string) {
  const withdrawal = await prisma.withdrawals.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) return;

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.agencyWallets.findUniqueOrThrow({ where: { id: withdrawal.walletId } });
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore.add(withdrawal.amount);

    await tx.agencyWallets.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });

    await tx.walletTransactions.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        status: "REVERSED",
        amount: withdrawal.amount,
        balanceBefore,
        balanceAfter,
        purpose: "WITHDRAWAL_REVERSAL",
        withdrawalId: withdrawal.id,
        note: reason,
      },
    });

    await tx.withdrawals.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED", failureReason: reason, processedAt: new Date() },
    });
  });
}

// ── WEBHOOK: transfer status callback ──────────────────────────────────────
export const transferWebhook = async (req: any, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Invalid webhook signature." });
    }

    const { data, event } = req.body;
    if (event !== "transfer.completed") return res.status(200).json({ received: true });

    const withdrawal = await prisma.withdrawals.findUnique({
      where: { flwTransferId: String(data.id) },
    });
    if (!withdrawal || withdrawal.status !== "PROCESSING") {
      return res.status(200).json({ received: true }); // already handled or unknown
    }

    if (data.status === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        await tx.withdrawals.update({
          where: { id: withdrawal.id },
          data: { status: "COMPLETED", processedAt: new Date() },
        });
        await tx.walletTransactions.updateMany({
          where: { withdrawalId: withdrawal.id },
          data: { status: "COMPLETED" },
        });
      });
    } else if (data.status === "FAILED") {
      await reverseWithdrawal(withdrawal.id, "Flutterwave transfer failed");
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Transfer webhook failed:", error);
    res.status(200).json({ received: true });
  }
};

// ── READ ────────────────────────────────────────────────────────────────
export const getWallet = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const wallets = await prisma.agencyWallets.findMany({
      where: { agencyId: req.agency.id },
      include: { currency: true },
    });
    res.status(200).json({ success: true, wallets });
  } catch (error) {
    next(error);
  }
};

export const getWalletTransactions = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const { currencyId = "NGN" } = req.query;

    const wallet = await prisma.agencyWallets.findUnique({
      where: { agencyId_currencyId: { agencyId: req.agency.id, currencyId } },
    });
    if (!wallet) return res.status(200).json({ success: true, transactions: [] });

    const transactions = await prisma.walletTransactions.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

export const getMyWithdrawals = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const withdrawals = await prisma.withdrawals.findMany({
      where: { agencyId: req.agency.id },
      include: { bankAccount: { select: { bankName: true, accountNumber: true } } },
      orderBy: { requestedAt: "desc" },
    });
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    next(error);
  }
};