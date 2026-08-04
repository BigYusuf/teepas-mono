// workers/recommendation-train.worker.ts
import { Worker, Queue } from "bullmq";
import redisConnection from "../libs/redis";
import prisma from "../libs/prisma";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";

tf.setBackend("cpu");
const EMBEDDING_DIM = 50;

export const trainQueue = new Queue("recommendation-train", {
  connection: redisConnection,
});

// Schedule nightly at 2am — repeatable job, no need for a separate cron file
export const scheduleTraining = async () => {
  await trainQueue.add("nightly-train", {}, {
    repeat: { cron: "0 2 * * *" },
    removeOnComplete: true,
  } as any);
};

new Worker(
  "recommendation-train",
  async () => {
    const interactions = await prisma.userInteractions.findMany({
      select: { userId: true, listingId: true, weight: true },
    });

    if (interactions.length < 100) {
      console.log("Not enough interactions yet — skipping training run.");
      return;
    }

    const userMap: Record<string, number> = {};
    const listingMap: Record<string, number> = {};
    let uc = 0,
      lc = 0;

    interactions.forEach(
      ({ userId, listingId }: { userId: string; listingId: string }) => {
        if (!(userId in userMap)) userMap[userId] = uc++;
        if (!(listingId in listingMap)) listingMap[listingId] = lc++;
      },
    );

    const userInput = tf.input({ shape: [1], dtype: "int32" });
    const listingInput = tf.input({ shape: [1], dtype: "int32" });

    const userEmbedding = tf.layers
      .embedding({ inputDim: uc, outputDim: EMBEDDING_DIM })
      .apply(userInput) as tf.SymbolicTensor;
    const listingEmbedding = tf.layers
      .embedding({ inputDim: lc, outputDim: EMBEDDING_DIM })
      .apply(listingInput) as tf.SymbolicTensor;

    const userVector = tf.layers
      .flatten()
      .apply(userEmbedding) as tf.SymbolicTensor;
    const listingVector = tf.layers
      .flatten()
      .apply(listingEmbedding) as tf.SymbolicTensor;
    const merged = tf.layers
      .dot({ axes: 1 })
      .apply([userVector, listingVector]) as tf.SymbolicTensor;
    const output = tf.layers
      .dense({ units: 1, activation: "sigmoid" })
      .apply(merged) as tf.SymbolicTensor;

    const model = tf.model({
      inputs: [userInput, listingInput],
      outputs: output,
    });
    model.compile({ optimizer: tf.train.adam(), loss: "binaryCrossentropy" });

    const userTensor = tf.tensor1d(
      interactions.map((d: { userId: string | number }) => userMap[d.userId]),
      "int32",
    );
    const listingTensor = tf.tensor1d(
      interactions.map(
        (d: { listingId: string | number }) => listingMap[d.listingId],
      ),
      "int32",
    );
    const labels = tf.tensor2d(
      interactions.map((d: { weight: any }) => [d.weight]),
      [interactions.length, 1],
    );

    // Trained ONCE across ALL users' interactions — this is the fix that
    // makes the collaborative-filtering approach actually work
    await model.fit([userTensor, listingTensor], labels, {
      epochs: 5,
      batchSize: 64,
    });

    const listingIds = Object.keys(listingMap);
    const listingIndices = tf.tensor1d(Object.values(listingMap), "int32");

    // Generate + store top-N recommendations per user
    for (const userId of Object.keys(userMap)) {
      const userIdx = tf.tensor1d(
        Array(listingIds.length).fill(userMap[userId]),
        "int32",
      );
      const preds = model.predict([userIdx, listingIndices]) as tf.Tensor;
      const scores = (await preds.array()) as number[];

      const top = listingIds
        .map((listingId, i) => ({ listingId, score: scores[i] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      await prisma.listingRecommendations.deleteMany({ where: { userId } });
      await prisma.listingRecommendations.createMany({
        data: top.map((t) => ({
          userId,
          listingId: t.listingId,
          score: t.score,
        })),
      });

      preds.dispose();
      userIdx.dispose();
    }

    console.log(
      `✅ Trained recommendations for ${Object.keys(userMap).length} users.`,
    );
  },
  { connection: redisConnection },
);
