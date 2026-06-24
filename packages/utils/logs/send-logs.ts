import { kafkaProducer } from "../kafka";


export async function sendLog({
  type = "info", message, source = "unknown-service",
}: {
  type?: "info" | "error" | "warning" | "success" | "debug";
  message: string;
  source?: string;
}) {
  const logPayload = {
    type,
    message,
    timestamp: new Date().toISOString(),
    source,
  };

  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic: "logs",
    messages: [{ value: JSON.stringify(logPayload) }],
  });
  await kafkaProducer.disconnect();
}
