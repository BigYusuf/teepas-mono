import prisma from "../../libs/prisma";
import cron from "node-cron";

// Runs hourly — handles both soft-deleted properties and abandoned drafts.
cron.schedule("0 * * * *", async () => {
  const now = new Date();

  // ── Hard-delete properties soft-deleted 24h+ ago ──
  try {
    await prisma.properties.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });
  } catch (error) {
    console.error("❌ Failed to purge soft-deleted properties:", error);
  }

  // ── Expire abandoned listing drafts (30+ days untouched) ──
  try {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.listingDrafts.updateMany({
      where: {
        status: { in: ["IN_PROGRESS", "READY"] },
        updatedAt: { lte: thirtyDaysAgo },
      },
      data: { status: "DISCARDED" },
    });

    if (result.count > 0) {
      console.log(`🗑️  Expired ${result.count} abandoned listing draft(s).`);
    }
  } catch (error) {
    console.error("❌ Failed to expire abandoned drafts:", error);
  }
});