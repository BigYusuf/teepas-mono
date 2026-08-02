import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import crypto from "crypto";
import prisma from "../../libs/prisma";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { refundCreditsAdmin } from "./refund-credit-admin";

// initiate point/credit buy
export const initiateFunding = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount } = req.body;

    const agency = req?.agency;
    if (!agency) return next(new ValidationError("Agency not found"));

    const paystackSecretKey =
      process.env.PAYSTACK_ENV === "live"
        ? process.env.PAYSTACK_LIVE_KEY
        : process.env.PAYSTACK_TEST_KEY;

    // ✅ Fetch or create agency credit record
    let agencyCredit = await prisma.agencyCredits.findUnique({
      where: { agencyId: agency.id },
    });

    if (!agencyCredit) {
      agencyCredit = await prisma.agencyCredits.create({
        data: { agencyId: agency.id, balance: 0 },
      });
    }

    // ✅ Initialize Paystack transaction
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: agency.email,
        amount: amount * 100, // convert to kobo
        metadata: {
          agencyId: agency.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );

    const reference = paystackRes.data.data.reference;

    // ✅ Record initial transaction with correct balanceBefore
    await prisma.creditTransactions.create({
      data: {
        agencyId: agency.id,
        type: "PURCHASED",
        amount,
        balanceBefore: agencyCredit.balance,
        balanceAfter: agencyCredit.balance, // will update after webhook
        purpose: "FUND_WALLET_PENDING",
        reference,
      },
    });

    res.status(200).json({
      success: true,
      payment_url: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// PAYSTACK WEBHOOK HANDLER
// ------------------------------------------------------------------
export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const secret: any =
      process.env.PAYSTACK_ENV === "live"
        ? process.env.PAYSTACK_LIVE_KEY
        : process.env.PAYSTACK_TEST_KEY;

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const data = req.body.data;

    if (event === "charge.success") {
      const reference = data.reference;
      const amount = data.amount / 100; // convert from kobo
      const agencyId = data.metadata.agencyId;

      const agency = await prisma.agencies.findUnique({
        where: { id: agencyId },
        include: { agencyCredits: true },
      });

      if (!agency) return res.status(404).json({ message: "Agency not found" });

      // get or create agencyCredits
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

      // update balance
      await prisma.agencyCredits.update({
        where: { agencyId },
        data: {
          balance: balanceAfter,
          lastUpdated: new Date(),
        },
      });

      // update transaction record
      await prisma.creditTransactions.updateMany({
        where: { reference },
        data: {
          balanceBefore,
          balanceAfter,
          purpose: "FUND_WALLET_SUCCESS",
          note: "Paystack wallet funding successful",
        },
      });

      console.log(`✅ Credit funded for Agency ${agencyId}: ₦${amount}`);
    }

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

    // Refund credits
    await refundCreditsAdmin({
      agencyId,
      credits,
      reason: reason || "Manual admin refund",
    });

    // // Optionally log admin action
    // await prisma.adminAuditLog.create({
    //   data: {
    //     adminId: req.user?.id, // requires adminAuth middleware
    //     agencyId,
    //     action: "REFUND_CREDITS",
    //     details: `Refunded ${credits} credits. Reason: ${reason || "Manual"}`,
    //     createdAt: new Date(),
    //   },
    // });

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

    const setting = await prisma.creditSettings.upsert({
      where: {
        action_tier: {
          action,
          tier: tier || "DEFAULT",
        },
      },
      update: {
        cost,
        currencyValue,
        description,
      },
      create: {
        action,
        tier: tier || "DEFAULT",
        cost,
        currencyValue,
        description,
      },
    });

    res.status(200).json({
      success: true,
      setting,
    });
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

    res.status(200).json({
      success: true,
      count: settings.length,
      settings,
    });
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

    res.status(200).json({
      success: true,
      message: "Credit setting deleted successfully",
    });
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
