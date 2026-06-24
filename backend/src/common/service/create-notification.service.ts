import { prisma } from "../../shared/db";
import { buildNotificationFlow } from "../../jobs/flows/notification-flow.builder";

type Recipient = {
  externalId?: string;
  email?: string;
  phone?: string;
  nutifarToken?: string;
  name?: string;
  metadata?: any;
};

type CreateNotificationInput = {
  tenantId: string;
  appId: string;
  type: string;
  source?: "SYSTEM" | "INTERNAL" | "API" | "CAMPAIGN";
  templateId?: string | null;
  templateName?: string | null;
  payload?: any;
  metadata?: any;
  recipients: Recipient[];
};

export async function createNotificationService(
  input: CreateNotificationInput,
) {
  const {
    tenantId,
    appId,
    type,
    source = "API",
    templateId,
    templateName,
    payload = {},
    metadata = {},
    recipients,
  } = input;

  if (!tenantId || !type) {
    throw new Error("tenantId and type are required");
  }

  if (!recipients?.length) {
    throw new Error("Recipients required");
  }

  let resolvedTemplateId: string | null = null;

  if (templateName) {
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        appId,
        name: templateName,
      },
    });

    resolvedTemplateId = template?.id ?? null;
  }

  if (templateId) {
    resolvedTemplateId = templateId;
  }

  // create event
  const event = await prisma.notificationEvent.create({
    data: {
      tenantId,
      appId,
      type,
      source,
      templateId: resolvedTemplateId,
      payload,
      metadata,
    },
  });

  // create targets
  await prisma.notificationTarget.createMany({
    data: recipients.map((recipient) => ({
      eventId: event.id,
      externalId: recipient.externalId,
      email: recipient.email,
      phone: recipient.phone,
      nutifarToken: recipient.nutifarToken,
      name: recipient.name,
      metadata: recipient.metadata ?? {},
    })),
  });

  // enqueue workflow
  await buildNotificationFlow(event?.id);

  return {
    success: true,
    eventId: event?.id,
  };
}
