import { sendEmail, sendSms, sendPush } from "./senders.service";
import { logger } from "../utils/logger";
import { prisma } from "../../shared/db";

export const deliveryProcessorService = {
  async process(deliveryId: string) {
    const record = await prisma.channelDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        target: {
          include: {
            event: {
              include: {
                template: true,
              },
            },
          },
        },
      },
    });

    if (!record) return;

    try {
      const result: any = await this.sendByChannel(record);

      await prisma.$transaction([
        prisma.channelDelivery.update({
          where: { id: record.id },
          data: {
            status: "SENT",
            providerMessageId: result?.messageId || result?.MessageId || null,
            sentAt: new Date(),
            attempts: { increment: 1 },
          },
        }),
//not needed for now, can be used later for analytics
        // prisma.analytics.create({
        //   data: {
        //     // deliveryId: record.id,
        //     // status: "SENT",
        //     channel: record.channel,
        //     // providerId: record.providerId,
        //     // eventId: record.target.eventId,
        //   },
        // }),
      ]);

      logger.info(`Delivery sent: ${record.id}`);
    } catch (err: any) {
      await prisma.channelDelivery.update({
        where: { id: record.id },
        data: {
          status: "FAILED",
          errorMessage: err.message,
          attempts: { increment: 1 },
        },
      });

      logger.error(`Delivery failed ${record.id}`, err);

      // IMPORTANT: BullMQ retry replaces Kafka retry topic
      throw err; // let BullMQ handle retry
    }
  },

  async sendByChannel(record: any) {
    switch (record.channel) {
      case "EMAIL":
        return sendEmail(record);

      case "SMS":
        return sendSms(record);

      case "PUSH":
        return sendPush(record);

      case "IN_APP":
        return this.handleInApp(record);

      default:
        throw new Error(`Unsupported channel ${record.channel}`);
    }
  },

  async handleInApp(record: any) {
    const externalId = record.target.externalId;

    if (!externalId) {
      throw new Error("IN_APP requires externalId");
    }

    await prisma.inAppNotification.create({
      data: {
        deliveryId: record.id,
        externalId,
        title: record.renderedContent?.subject,
        body: record.renderedContent?.body,
        data: record.renderedContent,
      },
    });

    return {
      messageId: `inapp_${record.id}`,
    };
  },
};
