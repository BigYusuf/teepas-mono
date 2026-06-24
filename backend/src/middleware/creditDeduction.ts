
import { NextFunction, Response } from "express";
import { ValidationError } from "../error-handler";
import prisma from "../libs/prisma";

/**
 * Deduct credits dynamically based on a DB-configured action.
 * If the next middleware/controller throws, credits are automatically refunded.
 */
export const deductCredits = (action: string, tier?: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const agencyId = req.agent?.agency?.id;
      if (!agencyId)
        return next(new ValidationError("Unauthorized or invalid agency."));

      const setting = await prisma.creditSettings.findUnique({
        where: {
          action_tier: {
            action,
            tier: tier || "DEFAULT",
          },
        },
      });

      if (!setting || !setting.isActive) {
        return next(
          new ValidationError(
            "Credit setting for this action not found or inactive."
          )
        );
      }

      const agencyCredit = await prisma.agencyCredits.findUnique({
        where: { agencyId },
      });

      if (!agencyCredit) {
        return next(new ValidationError("Agency wallet not found."));
      }

      if (agencyCredit.balance < setting.cost) {
        return next(new ValidationError("Insufficient credit balance."));
      }

      const balanceBefore = agencyCredit.balance;
      const balanceAfter = balanceBefore - setting.cost;

      // Deduct balance
      await prisma.agencyCredits.update({
        where: { agencyId },
        data: {
          balance: balanceAfter,
          lastUpdated: new Date(),
        },
      });

      // Log transaction
      await prisma.creditTransactions.create({
        data: {
          agencyId,
          type: "SPENT",
          amount: setting.cost,
          balanceBefore,
          balanceAfter,
          purpose: `ACTION_${action}`,
          note: `Deducted ${setting.cost} credits for ${action}${
            tier ? ` (${tier})` : ""
          }`,
        },
      });

      req.credit = {
        action,
        tier: tier || "DEFAULT",
        cost: setting.cost,
        balanceBefore,
        balanceAfter,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

interface DeductCreditsOptions {
  agencyId: string;
  action: string;
  tier?: string;
  tx?: typeof prisma; // allow transaction usage
}

// ✅ Deduct credits safely
export const deductCreditsDynamic = async ({
  agencyId,
  action,
  tier,
}: DeductCreditsOptions) => {
  const setting = await prisma.creditSettings.findFirst({
    where: { action, tier, isActive: true },
  });

  if (!setting) {
    throw new ValidationError(
      `Credit setting not found for ${action}${tier ? ` (${tier})` : ""}`
    );
  }

  const { cost, validityDays } = setting as any;

  const creditRecord = await prisma.agencyCredits.findUnique({
    where: { agencyId },
  });

  if (!creditRecord || creditRecord.balance < cost) {
    throw new ValidationError(
      `Insufficient credits. Required: ${cost}, Available: ${
        creditRecord?.balance || 0
      }`
    );
  }

  const balanceBefore = creditRecord.balance;
  const balanceAfter = balanceBefore - cost;

  await prisma.agencyCredits.update({
    where: { agencyId },
    data: { balance: balanceAfter },
  });

  await prisma.creditTransactions.create({
    data: {
      agencyId,
      type: "SPENT",
      amount: cost,
      balanceBefore,
      balanceAfter,
      purpose: action,
      note: `Deducted ${cost} credits for ${action}${tier ? ` (${tier})` : ""}`,
    },
  });

  return {
    cost,
    validityDays: validityDays || 3,
    tier: tier || "BRONZE",
  };
};

// ✅ Refund helper (if something fails later)
export const refundCredits = async (
  agencyId: string,
  cost: number,
  action: string,
  tier?: string
) => {
  const creditRecord = await prisma.agencyCredits.findUnique({
    where: { agencyId },
  });
  if (!creditRecord) return;

  const balanceBefore = creditRecord.balance;
  const balanceAfter = balanceBefore + cost;

  await prisma.agencyCredits.update({
    where: { agencyId },
    data: { balance: balanceAfter },
  });

  await prisma.creditTransactions.create({
    data: {
      agencyId,
      type: "REFUNDED",
      amount: cost,
      balanceBefore,
      balanceAfter,
      purpose: `${action}_REFUND`,
      note: `Refunded ${cost} credits for failed ${action}${
        tier ? ` (${tier})` : ""
      }`,
    },
  });
};
