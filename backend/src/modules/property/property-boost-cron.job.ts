import cron from "node-cron";
import prisma from "../../libs/prisma";

export const deactivateExpiredBoosts = async () => {
  try {
    const now = new Date();

    await prisma.propertyBoosts.updateMany({
      where: {
        status: "ACTIVE",
        endTime: { lt: now },
      },
      data: { status: "EXPIRED" },
    });

    console.log("✅ Expired boosts deactivated:", now.toISOString());
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("0 * * * *", deactivateExpiredBoosts); // every hour
