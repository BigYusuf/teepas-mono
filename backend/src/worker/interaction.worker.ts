// workers/interaction.worker.ts
import { Worker } from "bullmq";
import redisConnection from "../libs/redis";
import prisma from "../libs/prisma";

const WEIGHTS: Record<string, number> = {
  SALE: 1.0,
  RENT: 1.0,
  APPLY: 0.7,
  INQUIRY: 0.5,
  SAVE: 0.3,
  VIEW: 0.1,
};

new Worker(
  "interaction-events",
  async (job) => {
    const { userId, listingId, type } = job.data;
    await prisma.userInteractions.create({
      data: { userId, listingId, type, weight: WEIGHTS[type] ?? 0.1 },
    });
  },
  { connection: redisConnection },
);