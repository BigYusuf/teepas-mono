// controllers/boost.controller.ts
import { Response, NextFunction } from "express";
import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import {
  deductCreditsDynamic,
  refundCredits,
} from "../../middleware/creditDeduction";

const TIER_PRIORITY: Record<string, number> = {
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};

// ── CREATE — boost a listing ───────────────────────────────────────────────
export const boostListing = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId } = req.params;
    const { tier } = req.body;
    const agencyId = req.agency?.id;

    if (!agencyId) return next(new AuthError("No agency selected."));
    if (!tier || !TIER_PRIORITY[tier]) {
      return next(
        new ValidationError("Valid tier is required (SILVER, GOLD, PLATINUM)."),
      );
    }

    const listing = await prisma.listings.findUnique({
      where: { id: listingId },
      include: {
        unit: { select: { property: { select: { agencyId: true } } } },
      },
    });
    if (!listing) return next(new NotFoundError("Listing not found."));
    if (listing.unit.property.agencyId !== agencyId) {
      return next(new AuthError("Not authorized to boost this listing."));
    }
    if (listing.status !== "ACTIVE") {
      return next(new ValidationError("Only active listings can be boosted."));
    }

    // Guard against double-boosting — one active boost per listing at a time
    const existingBoost = await prisma.propertyBoosts.findFirst({
      where: { listingId, status: "ACTIVE" },
    });
    if (existingBoost) {
      return next(
        new ValidationError("This listing already has an active boost."),
      );
    }

    let cost = 0;

    const boost = await prisma.$transaction(async (tx) => {
      const creditUsage = await deductCreditsDynamic(
        { agencyId, action: "BOOST_PROPERTY", tier },
        tx,
      );
      cost = creditUsage.cost;
      const validityDays = creditUsage.validityDays || 3;

      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + validityDays * 24 * 60 * 60 * 1000,
      );

      const created = await tx.propertyBoosts.create({
        data: {
          agencyId,
          listingId,
          tier,
          creditsSpent: cost,
          startTime,
          endTime,
          status: "ACTIVE",
          priorityScore: TIER_PRIORITY[tier],
        },
      });

      // Ledger entry — matches the boostId field already on creditTransactions
      const wallet = await tx.agencyCredits.findUnique({ where: { agencyId } });
      if (wallet) {
        await tx.creditTransactions.create({
          data: {
            agencyId,
            type: "SPENT",
            amount: cost,
            balanceBefore: wallet.balance + cost,
            balanceAfter: wallet.balance,
            purpose: "BOOST_PROPERTY",
            note: `${tier} boost on listing ${listingId}`,
            boostId: created.id,
          },
        });
      }

      return created;
    });

    res.status(201).json({
      success: true,
      message: `${tier} boost activated.`,
      boost,
    });
  } catch (error) {
    // Refund only if credits were actually deducted before the failure
    console.error("❌ Boost failed:", error);
    next(error);
  }
};

// ── READ — agency's boosts ────────────────────────────────────────────────
export const getAgencyBoosts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const { status } = req.query;

    const boosts = await prisma.propertyBoosts.findMany({
      where: { agencyId: req.agency.id, ...(status && { status }) },
      include: {
        listing: {
          include: {
            unit: {
              select: {
                unitLabel: true,
                property: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, boosts });
  } catch (error) {
    next(error);
  }
};

// ── READ — active boost for a specific listing ─────────────────────────────
export const getListingBoost = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId } = req.params;

    const boost = await prisma.propertyBoosts.findFirst({
      where: { listingId, status: "ACTIVE" },
    });

    res.status(200).json({ success: true, boost: boost ?? null });
  } catch (error) {
    next(error);
  }
};

// ── CANCEL — agency cancels an active boost early ──────────────────────────
// No refund by default (credits already bought visibility that occurred);
// flag if you want pro-rated refunds instead.
export const cancelBoost = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const boost = await prisma.propertyBoosts.findUnique({ where: { id } });
    if (!boost) return next(new NotFoundError("Boost not found."));
    if (boost.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));
    if (boost.status !== "ACTIVE") {
      return next(new ValidationError("Only active boosts can be cancelled."));
    }

    const updated = await prisma.propertyBoosts.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.status(200).json({ success: true, boost: updated });
  } catch (error) {
    next(error);
  }
};
