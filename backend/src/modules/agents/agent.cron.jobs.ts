
import cron from "node-cron";
import prisma from "../../libs/prisma";

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // Find all agents marked deleted and past the deletedAt date
    const expiredAgents = await prisma.agents.findMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
      include: { agency: true },
    });

    for (const agent of expiredAgents) {
      // Delete agency if exists
      if (agent.agency) {
        await prisma.agencies.delete({
          where: { id: agent.agency.id },
        });
      }

      // Delete agent
      await prisma.agents.delete({
        where: { id: agent.id },
      });
    }
  } catch (error) {
    console.error("Error deleting expired agents and agencies:", error);
  }
});
