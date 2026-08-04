// queues/interaction.queue.ts
import { Queue } from "bullmq";
import redisConnection from "../libs/redis"; // your ioredis connection config

export const interactionQueue = new Queue("interaction-events", {
  connection: redisConnection,
});

export const logInteraction = async (
  userId: string,
  listingId: string,
  type: "VIEW" | "SAVE" | "INQUIRY" | "APPLY" | "RENT" | "SALE",
) => {
  // fire-and-forget — never await this inline in a hot request path
  await interactionQueue.add(
    "log",
    { userId, listingId, type },
    { removeOnComplete: true, removeOnFail: 100 },
  );
};