// controllers/credit.controller.ts
import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { NextFunction, Request, Response } from "express";
import { initiateEscrowPayment as initiateFlutterwaveCharge, verifyTransaction } from "../../services/flutterwave.service";
import { refundCreditsAdmin } from "./refund-credit-admin";

// ------------------------------------------------------------------
// INITIATE CREDIT/POINT PURCHASE
// ------------------------------------------------------------------
export const initiateFunding = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount } = req.body;

    const agency = req?.agency;
    if (!agency) return next(new ValidationError("Agency not found"));
    if (!amount || amount <= 0) return next(new ValidationError("A valid amount is required"));

    // ✅ Fetch or create agency credit record
    let agencyCredit = await prisma.agencyCredits.findUnique({
      where: { agencyId: agency.id },
    });

    if (!agencyCredit) {
      agencyCredit = await prisma.agencyCredits.create({
        data: { agencyId: agency.id, balance: 0 },
      });
    }

    const reference = `CREDIT-${agency.id}-${Date.now()}`;

    // ✅ Initialize Flutterwave transaction — amount sent as-is, main
    // currency unit, NOT multiplied by 100 (that's Paystack's convention)
    const { checkoutUrl } = await initiateFlutterwaveCharge({
      amount: Number(amount),
      currency: "NGN", // TODO: derive from agency's preferred currency once multi-currency credit purchase is needed
      email: agency.email,
      txRef: reference,
      redirectUrl: `${process.env.APP_URL}/wallet/funding/callback`,
      narration: "Agency credit top-up",
    });

    // ✅ Record initial transaction with correct balanceBefore
    await prisma.creditTransactions.create({
      data: {
        agencyId: agency.id,
        type: "PURCHASED",
        amount,
        balanceBefore: agencyCredit.balance,
        balanceAfter: agencyCredit.balance, // updated after webhook confirms
        purpose: "FUND_WALLET_PENDING",
        reference,
      },
    });

    res.status(200).json({
      success: true,
      payment_url: checkoutUrl,
      reference,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// FLUTTERWAVE WEBHOOK HANDLER — credit funding
// ------------------------------------------------------------------
export const flutterwaveCreditWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const { data } = req.body as any;
    if (data?.status !== "successful") {
      return res.sendStatus(200);
    }

    // Re-verify directly against Flutterwave — never trust the webhook
    // payload alone
    const verified = await verifyTransaction(data.id);
    if (verified.status !== "successful") {
      return res.sendStatus(200);
    }

    const reference = verified.tx_ref;
    const amount = verified.amount; // already in main currency unit, no /100 needed

    const pendingTx = await prisma.creditTransactions.findFirst({
      where: { reference, purpose: "FUND_WALLET_PENDING" },
    });

    // Idempotency — webhook can fire more than once for the same event
    if (!pendingTx) {
      return res.sendStatus(200);
    }

    const agencyId = pendingTx.agencyId;

    let agencyCredit = await prisma.agencyCredits.findUnique({
      where: { agencyId },
    });

    if (!agencyCredit) {
      agencyCredit = await prisma.agencyCredits.create({
        data: { agencyId, balance: 0 },
      });
    }

    const balanceBefore = agencyCredit.balance;
    const balanceAfter = balanceBefore + amount;

    await prisma.$transaction([
      prisma.agencyCredits.update({
        where: { agencyId },
        data: { balance: balanceAfter, lastUpdated: new Date() },
      }),
      prisma.creditTransactions.update({
        where: { id: pendingTx.id },
        data: {
          balanceBefore,
          balanceAfter,
          purpose: "FUND_WALLET_SUCCESS",
          note: "Flutterwave wallet funding successful",
        },
      }),
    ]);

    console.log(`✅ Credit funded for Agency ${agencyId}: ${amount}`);

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
};

// ------------------------------------------------------------------
// GET AGENCY BALANCE
// ------------------------------------------------------------------
export const getAgencyBalance = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req?.agency.id;
    const agencyCredit = await prisma.agencyCredits.findUnique({
      where: { agencyId },
    });

    if (!agencyCredit)
      return res
        .status(404)
        .json({ success: false, message: "No credit record found" });

    res.status(200).json({
      success: true,
      balance: agencyCredit.balance,
      lastUpdated: agencyCredit.lastUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// GET CREDIT TRANSACTIONS (Agency)
// ------------------------------------------------------------------
export const getCreditTransactions = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req?.agency.id;

    const transactions = await prisma.creditTransactions.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};

export const refundCreditsPoint = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId, amount, reason } = req.body;

    const agencyCredit = await prisma.agencyCredits.findUnique({
      where: { agencyId },
    });

    if (!agencyCredit) {
      return next(new ValidationError("Agency wallet not found."));
    }

    const balanceBefore = agencyCredit.balance;
    const balanceAfter = balanceBefore + amount;

    await prisma.agencyCredits.update({
      where: { agencyId },
      data: {
        balance: balanceAfter,
        lastUpdated: new Date(),
      },
    });

    await prisma.creditTransactions.create({
      data: {
        agencyId,
        type: "REFUNDED",
        amount,
        balanceBefore,
        balanceAfter,
        purpose: "ADMIN_REFUND",
        note: reason || "Manual refund issued by admin",
      },
    });

    res.status(200).json({
      success: true,
      message: "Credits refunded successfully",
      newBalance: balanceAfter,
    });
  } catch (error) {
    next(error);
  }
};

export const adminRefundCredits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId, credits, reason } = req.body;

    if (!agencyId || !credits) {
      throw new ValidationError("agencyId and credits are required");
    }

    if (credits <= 0) {
      throw new ValidationError("credits must be greater than zero");
    }

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    await refundCreditsAdmin({
      agencyId,
      credits,
      reason: reason || "Manual admin refund",
    });

    res.status(200).json({
      success: true,
      message: "Credits refunded successfully",
    });
  } catch (err) {
    next(err);
  }
};

// 🟢 Create or update credit setting ADMIN
export const upsertCreditSetting = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { action, tier, cost, currencyValue, description } = req.body;

    const tierValue = tier || "DEFAULT";
    let setting = await prisma.creditSettings.findFirst({
      where: { action, tier: tierValue },
    });

    if (setting) {
      setting = await prisma.creditSettings.update({
        where: { id: setting.id },
        data: { cost, currencyValue, description },
      });
    } else {
      setting = await prisma.creditSettings.create({
        data: { action, tier: tierValue, cost, currencyValue, description },
      });
    }

    res.status(200).json({ success: true, setting });
  } catch (error) {
    next(error);
  }
};

// 🟡 Get all settings ADMIN
export const getCreditSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await prisma.creditSettings.findMany({
      orderBy: [{ action: "asc" }, { tier: "asc" }],
    });

    res.status(200).json({ success: true, count: settings.length, settings });
  } catch (error) {
    next(error);
  }
};

// 🔵 Get single setting ADMIN
export const getCreditSettingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const setting = await prisma.creditSettings.findUnique({ where: { id } });

    if (!setting) throw new NotFoundError("Credit setting not found");

    res.status(200).json({ success: true, setting });
  } catch (error) {
    next(error);
  }
};

// 🔴 Delete credit setting ADMIN
export const deleteCreditSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const existing = await prisma.creditSettings.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Credit setting not found");

    await prisma.creditSettings.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Credit setting deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// 🟠 Toggle activation ADMIN
export const toggleCreditSettingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const setting = await prisma.creditSettings.findUnique({ where: { id } });
    if (!setting) throw new NotFoundError("Credit setting not found");

    const updated = await prisma.creditSettings.update({
      where: { id },
      data: { isActive: !setting.isActive },
    });

    res.status(200).json({
      success: true,
      message: `Credit setting ${updated.isActive ? "activated" : "deactivated"}`,
      updated,
    });
  } catch (error) {
    next(error);
  }
};