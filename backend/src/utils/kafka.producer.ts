import { kafka } from "@packages/utils/kafka";

const producer = kafka.producer();

export const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka Producer connected (auth-service)");
};
