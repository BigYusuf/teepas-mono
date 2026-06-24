import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import { getUserActivity } from "./fetch-user-activity";
import { preProcessData } from "./pre-process-data";

// Set CPU backend for lightweight operation
tf.setBackend("cpu");

const EMBEDDING_DIM = 50;

interface UserAction {
  userId: string;
  propertyId: string;
  actionType:
    | "property_view"
    | "save_property"
    | "inquiry"
    | "sale"
    | "rent"
    | "apply";
}

interface Interaction {
  userId: string;
  propertyId: string;
  actionType: UserAction["actionType"];
}

interface RecommendedProperty {
  propertyId: string;
  score: number;
}

async function fetchUserActivity(userId: string): Promise<UserAction[]> {
  const userActions = await getUserActivity(userId);
  return Array.isArray(userActions)
    ? (userActions as unknown as UserAction[])
    : [];
}

export const recommendProperties = async (
  userId: string,
  allProperties: any,
): Promise<string[]> => {
  const userActions: UserAction[] = await fetchUserActivity(userId);
  if (userActions.length === 0) return [];

  const processedData = preProcessData(userActions, allProperties);
  if (
    !processedData ||
    !processedData.interactions ||
    !processedData.properties
  )
    return [];

  const { interactions } = processedData as {
    interactions: Interaction[];
  };

  const userMap: Record<string, number> = {};
  const propertyMap: Record<string, number> = {};
  let userCount = 0;
  let propertyCount = 0;

  interactions.forEach(({ userId, propertyId }) => {
    if (!(userId in userMap)) userMap[userId] = userCount++;
    if (!(propertyId in propertyMap)) propertyMap[propertyId] = propertyCount++;
  });

  // define model input layers
  const userInput = tf.input({
    shape: [1],
    dtype: "int32",
  }) as tf.SymbolicTensor;

  const propertyInput = tf.input({
    shape: [1],
    dtype: "int32",
  }) as tf.SymbolicTensor;

  // create embedding layer (like lookup tables) to learn the relationships
  const userEmbedding = tf.layers
    .embedding({
      inputDim: userCount,
      outputDim: EMBEDDING_DIM,
    })
    .apply(userInput) as tf.SymbolicTensor;

  const propertyEmbedding = tf.layers
    .embedding({
      inputDim: propertyCount,
      outputDim: EMBEDDING_DIM,
    })
    .apply(propertyInput) as tf.SymbolicTensor;

  // Flatten the 2D embeddings into 1D feature vectors
  const userVector = tf.layers
    .flatten()
    .apply(userEmbedding) as tf.SymbolicTensor;

  const propertyVector = tf.layers
    .flatten()
    .apply(propertyEmbedding) as tf.SymbolicTensor;

  // Dot property combines user and property vectors (user-property affinity)
  const merged = tf.layers
    .dot({ axes: 1 })
    .apply([userVector, propertyVector]) as tf.SymbolicTensor;

  // Final layer: outputs probability of interaction
  const output = tf.layers
    .dense({ units: 1, activation: "sigmoid" })
    .apply(merged) as tf.SymbolicTensor;

  // compile the recommendation model
  const model = tf.model({
    inputs: [userInput, propertyInput],
    outputs: output,
  });

  model.compile({
    optimizer: tf.train.adam(),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  // convert user and property  interactions into tensors for training
  const userTensor = tf.tensor1d(
    interactions.map((d) => userMap[d.userId] ?? 0),
    "int32",
  );

  const propertyTensor = tf.tensor1d(
    interactions.map((d) => propertyMap[d.propertyId] ?? 0),
    "int32",
  );

  const weightLabels = tf.tensor2d(
    interactions.map((d) => {
      switch (d.actionType) {
        case "sale":
          return [1.0];
        case "rent":
          return [1.0];
        case "apply":
          return [0.7];
        case "inquiry":
          return [0.5];
        case "save_property":
          return [0.3];
        case "property_view":
          return [0.1];

        default:
          return [0];
      }
    }),
    [interactions.length, 1],
  );

  await model.fit([userTensor, propertyTensor], weightLabels, {
    epochs: 5,
    batchSize: 32,
  });

  const propertyTensorAll = tf.tensor1d(Object.values(propertyMap), "int32");

  const predictions = model.predict([
    tf.tensor1d([userMap[userId] ?? 0], "int32"),
    propertyTensorAll,
  ]) as tf.Tensor;

  const scores = (await predictions.array()) as number[];

  // sort and select top 10 recommended properties based on score
  const recommendProperties: RecommendedProperty[] = Object.keys(propertyMap)
    .map((propertyId, index) => ({
      propertyId,
      score: scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendProperties.map((p) => p.propertyId);
};
