import prisma from "../../libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    // Delete properties where `deletedAt` is older than 24 hours
    await prisma.properties.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });
  } catch (error) {
    console.log(error);
  }
});
