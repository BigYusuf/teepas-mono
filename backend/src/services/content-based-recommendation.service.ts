// services/contentBasedRecommendation.service.ts
import prisma from "../libs/prisma";

interface ListingSignal {
  city: string | null;
  purpose: string;
  bedrooms: number | null;
  basePrice: number | null;
}

export const getContentBasedRecommendations = async (
  userId: string,
  limit = 10,
): Promise<string[]> => {
  // Pull the user's recent interactions (any weight — view counts too,
  // just less strongly, since we're not doing gradient-based training here)
  const interactions = await prisma.userInteractions.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      listingId: true,
      listing: {
        select: {
          purpose: true,
          pricing: { select: { basePrice: true } },
          unit: {
            select: {
              structure: { select: { bedrooms: true } },
              property: { select: { city: true } },
            },
          },
        },
      },
    },
  });

  if (interactions.length === 0) return [];

  // Build a "preference profile" from what they've interacted with
  const signals: ListingSignal[] = interactions.map((i: any) => ({
    city: i.listing.unit.property.city,
    purpose: i.listing.purpose,
    bedrooms: i.listing.unit.structure?.bedrooms ?? null,
    basePrice: i.listing.pricing?.basePrice
      ? Number(i.listing.pricing.basePrice)
      : null,
  }));

  const cityFreq = frequencyMap(signals.map((s) => s.city));
  const purposeFreq = frequencyMap(signals.map((s) => s.purpose));
  const bedroomFreq = frequencyMap(signals.map((s) => s.bedrooms));

  const prices = signals
    .map((s) => s.basePrice)
    .filter((p): p is number => p !== null);
  const avgPrice = prices.length
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : null;
  const priceStdDev = avgPrice ? stdDev(prices, avgPrice) : null;

  const interactedListingIds = new Set(
    interactions.map((i: any) => i.listingId),
  );

  // Score every other active listing against the preference profile
  const candidates = await prisma.listings.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: Array.from(interactedListingIds) as string[] },
    },
    select: {
      id: true,
      purpose: true,
      pricing: { select: { basePrice: true } },
      unit: {
        select: {
          structure: { select: { bedrooms: true } },
          property: { select: { city: true } },
        },
      },
    },
    take: 500, // cap candidate pool for performance on a single VPS
  });

  const scored = candidates.map((listing) => {
    let score = 0;

    const city = listing.unit.property.city;
    const bedrooms = listing.unit.structure?.bedrooms ?? null;
    const price = listing.pricing?.basePrice
      ? Number(listing.pricing.basePrice)
      : null;

    if (city && cityFreq[city]) score += cityFreq[city] * 3; // city match weighted highest
    if (purposeFreq[listing.purpose]) score += purposeFreq[listing.purpose] * 2;
    if (bedrooms !== null && bedroomFreq[bedrooms])
      score += bedroomFreq[bedrooms] * 1.5;

    if (
      price !== null &&
      avgPrice !== null &&
      priceStdDev !== null &&
      priceStdDev > 0
    ) {
      // Closer to the user's typical price range = higher score, using a
      // simple Gaussian-like falloff rather than a hard bucket cutoff
      const distance = Math.abs(price - avgPrice) / priceStdDev;
      score += Math.max(0, 2 - distance);
    }

    return { listingId: listing.id, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.listingId);
};

function frequencyMap<T extends string | number | null>(
  values: T[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const v of values) {
    if (v === null) continue;
    map[String(v)] = (map[String(v)] ?? 0) + 1;
  }
  return map;
}

function stdDev(values: number[], mean: number): number {
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
