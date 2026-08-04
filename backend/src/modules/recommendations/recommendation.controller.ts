// controllers/recommendation.controller.ts
import { Response, NextFunction } from "express";

import prisma from "../../libs/prisma";
import { getContentBasedRecommendations } from "../../services/content-based-recommendation.service";

const NEURAL_MODEL_MIN_INTERACTIONS = 1000; // platform-wide, not per-user — tune once you see real volume

export const getRecommendedListings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const totalInteractions = await prisma.userInteractions.count();
    const useNeuralModel = totalInteractions >= NEURAL_MODEL_MIN_INTERACTIONS;

    let listingIds: string[] = [];

    if (useNeuralModel) {
      // v2: read precomputed neural recommendations (from the nightly
      // BullMQ training job)
      const stored = await prisma.listingRecommendations.findMany({
        where: { userId },
        orderBy: { score: "desc" },
        take: 10,
      });
      listingIds = stored.map((r: any) => r.listingId);
    }

    if (listingIds.length === 0) {
      // v1 fallback: content-based, works immediately, also catches users
      // with no neural recommendations yet even after the model exists
      listingIds = await getContentBasedRecommendations(userId, 10);
    }

    if (listingIds.length === 0) {
      // Cold start: brand new user, no interactions at all — show recent listings
      const fallback = await prisma.listings.findMany({
        where: { status: "ACTIVE" },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: { id: true },
      });
      listingIds = fallback.map((l) => l.id);
    }

    const listings = await prisma.listings.findMany({
      where: { id: { in: listingIds } },
      include: {
        pricing: true,
        unit: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            property: { select: { title: true, city: true } },
          },
        },
      },
    });

    // Prisma's findMany doesn't preserve the `in` array's order — re-sort
    // to match the scored/ranked order from whichever strategy ran
    const ordered = listingIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is (typeof listings)[number] => !!l);

    res.status(200).json({
      success: true,
      strategy: useNeuralModel ? "neural" : "content-based",
      recommendations: ordered,
    });
  } catch (error) {
    next(error);
  }
};
