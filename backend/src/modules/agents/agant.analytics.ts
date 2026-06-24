import prisma from "../../libs/prisma";

export const updateAgencyAnalytics = async (event: any) => {
  try {
    if (!event.agencyId) return;

    const now = new Date();

    // Fetch existing analytics
    const existing = await prisma.agencyAnalytics.findFirst({
      where: { agencies: { some: { id: event.agencyId } } },
    });

    let countryStats: any = existing?.countryStats || {};
    let cityStats: any = existing?.cityStats || {};
    let deviceStats: any = existing?.deviceStats || {};

    // Increment counts
    if (event.country) {
      countryStats[event.country] = (countryStats[event.country] || 0) + 1;
    }
    if (event.city) {
      cityStats[event.city] = (cityStats[event.city] || 0) + 1;
    }
    if (event.device) {
      deviceStats[event.device] = (deviceStats[event.device] || 0) + 1;
    }

    if (existing) {
      await prisma.agencyAnalytics.update({
        where: { id: existing.id },
        data: {
          totalVisitors: { increment: 1 },
          countryStats,
          cityStats,
          deviceStats,
          lastVisitedAt: now,
        },
      });
    } else {
      await prisma.agencyAnalytics.create({
        data: {
          totalVisitors: 1,
          countryStats,
          cityStats,
          deviceStats,
          lastVisitedAt: now,
          agencies: { connect: { id: event.agencyId } },
        },
      });
    }

    // Track unique visitors
    if (event.userId) {
      await prisma.uniqueAgencyVisitors.upsert({
        where: {
          agencyId_userId: { agencyId: event.agencyId, userId: event.userId },
        },
        update: { visitedAt: now },
        create: { agencyId: event.agencyId, userId: event.userId },
      });
    }
  } catch (err) {
    console.log("Error updating agency analytics:", err);
  }
};
