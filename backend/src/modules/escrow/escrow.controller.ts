// controllers/escrow.controller.ts
import { Response, NextFunction } from "express";

import prisma from "../../libs/prisma";
import { NotFoundError, AuthError, ValidationError } from "../../error-handler";
import {
  initiateEscrowPayment,
  verifyTransaction,
  releaseEscrowFunds,
  refundTransaction,
} from "../../services/flutterwave.service";

const AUTO_RELEASE_DAYS = 7;

// ── CREATE — request an escrow payment (e.g. inspection fee) ──────────────
export const createEscrowRequest = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return next(new AuthError("Only users can initiate escrow payments."));

    const {
      purpose,
      amount,
      currencyId = "NGN",
      agencyId,
      listingId,
      inspectionId,
      leaseId,
    } = req.body;

    if (!purpose || !amount || !agencyId) {
      return next(
        new ValidationError("purpose, amount, and agencyId are required."),
      );
    }

    const escrow = await prisma.escrowPayments.create({
      data: {
        purpose,
        amount,
        currencyId,
        payerId: userId,
        agencyId,
        listingId,
        inspectionId,
        leaseId,
        status: "PENDING_PAYMENT",
      },
    });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    const txRef = `ESC-${escrow.id}`;

    const { checkoutUrl } = await initiateEscrowPayment({
      amount: Number(amount),
      currency: currencyId,
      email: user!.email,
      txRef,
      redirectUrl: `${process.env.APP_URL}/payments/callback`,
      narration: `${purpose} escrow payment`,
    });

    await prisma.escrowPayments.update({
      where: { id: escrow.id },
      data: { paymentRef: txRef },
    });

    res.status(201).json({ success: true, escrow, checkoutUrl });
  } catch (error) {
    next(error);
  }
};

// ── WEBHOOK — Flutterwave payment confirmation ─────────────────────────────
export const flutterwaveWebhook = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Verify the webhook actually came from Flutterwave before trusting it
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Invalid webhook signature." });
    }

    const { data } = req.body;
    if (data?.status !== "successful") {
      return res.status(200).json({ received: true }); // ack, nothing to do
    }

    // Re-verify against Flutterwave's API directly — never trust the
    // webhook payload alone, since it could be spoofed even with a
    // matching header if the secret ever leaks.
    const verified = await verifyTransaction(data.id);
    if (verified.status !== "successful") {
      return res.status(200).json({ received: true });
    }

    const escrow = await prisma.escrowPayments.findUnique({
      where: { paymentRef: verified.tx_ref },
    });
    if (!escrow) {
      console.error(
        `Webhook received for unknown paymentRef: ${verified.tx_ref}`,
      );
      return res.status(200).json({ received: true });
    }

    // Idempotency — webhooks can fire more than once for the same event
    if (escrow.status !== "PENDING_PAYMENT") {
      return res.status(200).json({ received: true });
    }

    // Sanity check amount/currency match what we expect before marking HELD
    if (
      Number(escrow.amount) !== verified.amount ||
      escrow.currencyId !== verified.currency
    ) {
      console.error(`Amount/currency mismatch on escrow ${escrow.id}`);
      return res.status(200).json({ received: true });
    }

    await prisma.escrowPayments.update({
      where: { id: escrow.id },
      data: {
        status: "HELD",
        flwTransactionId: String(verified.id),
        paidAt: new Date(),
        autoReleaseAt: new Date(
          Date.now() + AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(200).json({ received: true }); // ack anyway — Flutterwave retries on non-200
  }
};

// ── CONFIRM — either party confirms satisfaction ───────────────────────────
export const confirmEscrow = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const isUser = !!req.user?.id;
    const isAgency = !!req.agency?.id;

    const escrow = await prisma.escrowPayments.findUnique({ where: { id } });
    if (!escrow) return next(new NotFoundError("Escrow payment not found."));
    if (escrow.status !== "HELD") {
      return next(
        new ValidationError(
          `Cannot confirm an escrow payment with status ${escrow.status}.`,
        ),
      );
    }

    let updateData: any = {};
    if (isUser && escrow.payerId === req.user.id) {
      updateData.payerConfirmedAt = new Date();
    } else if (isAgency && escrow.agencyId === req.agency.id) {
      updateData.agencyConfirmedAt = new Date();
    } else {
      return next(
        new AuthError("Not authorized to confirm this escrow payment."),
      );
    }

    const updated = await prisma.escrowPayments.update({
      where: { id },
      data: updateData,
    });

    // Both sides confirmed — release now, don't wait for auto-release
    if (updated.payerConfirmedAt && updated.agencyConfirmedAt) {
      await releaseEscrow(updated.id);
      const released = await prisma.escrowPayments.findUnique({
        where: { id },
      });
      return res
        .status(200)
        .json({ success: true, escrow: released, released: true });
    }

    res.status(200).json({ success: true, escrow: updated, released: false });
  } catch (error) {
    next(error);
  }
};

// ── Internal release helper — shared by confirm, auto-release cron, admin ──
// controllers/escrow.controller.ts — replace the earlier releaseEscrow helper
async function releaseEscrow(escrowId: string) {
  const escrow = await prisma.escrowPayments.findUnique({ where: { id: escrowId } });
  if (!escrow || escrow.status !== "HELD" || !escrow.flwTransactionId) return;

  await releaseEscrowFunds(escrow.flwTransactionId);

  await prisma.$transaction(async (tx) => {
    await tx.escrowPayments.update({
      where: { id: escrowId },
      data: { status: "RELEASED", releasedAt: new Date() },
    });

    const wallet = await tx.agencyWallets.upsert({
      where: { agencyId_currencyId: { agencyId: escrow.agencyId, currencyId: escrow.currencyId } },
      update: {},
      create: { agencyId: escrow.agencyId, currencyId: escrow.currencyId, balance: 0 },
    });

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore.add(escrow.amount);

    await tx.agencyWallets.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    });

    await tx.walletTransactions.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        status: "COMPLETED",
        amount: escrow.amount,
        balanceBefore,
        balanceAfter,
        purpose: "ESCROW_RELEASE",
        escrowPaymentId: escrow.id,
        reference: escrow.paymentRef,
      },
    });
  });
}

// resolveFlwTransactionId becomes a real lookup, no longer a stub
async function resolveFlwTransactionId(paymentRef: string): Promise<string> {
  const escrow = await prisma.escrowPayments.findUnique({ where: { paymentRef } });
  if (!escrow?.flwTransactionId) {
    throw new Error(`No Flutterwave transaction id found for ${paymentRef}`);
  }
  return escrow.flwTransactionId;
}

// ── DISPUTE ──────────────────────────────────────────────────────────────
export const disputeEscrow = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const isUser = !!req.user?.id;
    const isAgency = !!req.agency?.id;

    const escrow = await prisma.escrowPayments.findUnique({ where: { id } });
    if (!escrow) return next(new NotFoundError("Escrow payment not found."));
    if (escrow.status !== "HELD") {
      return next(new ValidationError("Only held payments can be disputed."));
    }

    const isParty =
      (isUser && escrow.payerId === req.user.id) ||
      (isAgency && escrow.agencyId === req.agency.id);
    if (!isParty) return next(new AuthError("Not authorized."));

    const updated = await prisma.escrowPayments.update({
      where: { id },
      data: {
        status: "DISPUTED",
        disputeReason: reason,
        disputedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, escrow: updated });
  } catch (error) {
    next(error);
  }
};

// ── ADMIN: resolve dispute ─────────────────────────────────────────────────
export const resolveDispute = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // "RELEASE" | "REFUND"
    if (!req.admin?.id)
      return next(new AuthError("Only admins can resolve disputes."));

    const escrow = await prisma.escrowPayments.findUnique({ where: { id } });
    if (!escrow) return next(new NotFoundError("Escrow payment not found."));
    if (escrow.status !== "DISPUTED") {
      return next(
        new ValidationError("Only disputed payments can be resolved."),
      );
    }

    if (resolution === "RELEASE") {
      await releaseEscrow(id);
    } else if (resolution === "REFUND") {
      const flwTransactionId = await resolveFlwTransactionId(
        escrow.paymentRef!,
      );
      await refundTransaction(flwTransactionId);
      await prisma.escrowPayments.update({
        where: { id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });
    } else {
      return next(new ValidationError("resolution must be RELEASE or REFUND."));
    }

    await prisma.escrowPayments.update({
      where: { id },
      data: { resolvedBy: req.admin.id },
    });

    const resolved = await prisma.escrowPayments.findUnique({ where: { id } });
    res.status(200).json({ success: true, escrow: resolved });
  } catch (error) {
    next(error);
  }
};

// ── READ ────────────────────────────────────────────────────────────────
export const getEscrowById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const escrow = await prisma.escrowPayments.findUnique({
      where: { id },
      include: {
        payer: { select: { name: true, email: true } },
        agency: { select: { name: true } },
      },
    });
    if (!escrow) return next(new NotFoundError("Escrow payment not found."));

    const isOwner = escrow.payerId === req.user?.id;
    const isAgency = escrow.agencyId === req.agency?.id;
    if (!isOwner && !isAgency && !req.admin)
      return next(new AuthError("Not authorized."));

    res.status(200).json({ success: true, escrow });
  } catch (error) {
    next(error);
  }
};

export const getMyEscrowPayments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id)
      return next(new AuthError("Only users can view their escrow payments."));
    const { status } = req.query;

    const payments = await prisma.escrowPayments.findMany({
      where: { payerId: req.user.id, ...(status && { status }) },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

export const getAgencyEscrowPayments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const { status } = req.query;

    const payments = await prisma.escrowPayments.findMany({
      where: { agencyId: req.agency.id, ...(status && { status }) },
      include: { payer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};
