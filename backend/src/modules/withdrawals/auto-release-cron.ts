// crons/autoReleaseEscrow.cron.ts
import prisma from "../../libs/prisma";
import cron from "node-cron";
import { releaseEscrowFunds } from "../../services/flutterwave.service";

cron.schedule("0 * * * *", async () => {
  try {
    const dueForRelease = await prisma.escrowPayments.findMany({
      where: { status: "HELD", autoReleaseAt: { lte: new Date() } },
    });

    for (const escrow of dueForRelease) {
      try {
        // same release path as manual confirm — reuse resolveFlwTransactionId
        // once implemented
        await prisma.escrowPayments.update({
          where: { id: escrow.id },
          data: { status: "RELEASED", releasedAt: new Date() },
        });
        console.log(`⏳ Auto-released escrow ${escrow.id}`);
      } catch (err) {
        console.error(`Failed to auto-release escrow ${escrow.id}:`, err);
      }
    }
  } catch (error) {
    console.error("❌ Auto-release cron failed:", error);
  }
});