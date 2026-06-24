import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import {
  renderSafe,
  shouldUseEjs,
} from "../../shared/utils/interpolate-template";
import { prisma } from "../../shared/db";
import { ProviderPolicy } from "../../shared/providers";
import { processorQueue } from "../../jobs/queues/processor.queue";

type BuildInput = {
  targetId: string;
};

export const deliveryBuilderService = {
  async build({ targetId }: BuildInput) {
    const target = await this.getTarget(targetId);
    if (!target) return [];

    const channels = this.resolveChannels(target);

    if (!channels.length) {
      logger.warn(`No valid channels for target ${targetId}`);
      return [];
    }

    const deliveries = await Promise.all(
      channels.map((channel) =>
        this.createDelivery({
          target,
          channel,
        }),
      ),
    );

    const validDeliveries = deliveries.filter(Boolean);

    logger.info(`validDeliveries ${validDeliveries}`);

    if (!validDeliveries.length) return [];

    const created = await prisma.$transaction(
      validDeliveries.map((delivery) =>
        prisma.channelDelivery.create({
          data: delivery as any,
        }),
      ),
    );
    await Promise.all(
      created.map((delivery) =>
        processorQueue.add("processor", {
          deliveryId: delivery.id,
          stage: "processor",
        }),
      ),
    );

    logger.info(`Queued ${validDeliveries.length} deliveries for ${targetId}`);

    return validDeliveries;
  },

  async getTarget(targetId: string) {
    if (!targetId) return null;

    return prisma.notificationTarget.findUnique({
      where: { id: targetId },
      include: {
        event: {
          include: {
            template: true,
            app: true,
            tenant: true,
          },
        },
      },
    });
  },

  resolveChannels(target: any): string[] {
    const channels: string[] = [];

    if (target.email) channels.push("EMAIL");
    if (target.phone) channels.push("SMS");
    if (target.nutifarToken) channels.push("PUSH");
    if (target.externalId) channels.push("IN_APP");

    return [...new Set(channels)];
  },

  async createDelivery({ target, channel }: { target: any; channel: string }) {
    const { event } = target;

    const provider = await this.resolveProvider({
      tenantId: event.tenantId,
      appId: event.appId,
      channel,
      source: event.source,
    });

    const rendered = await this.renderMessage({
      event,
      target,
      channel,
    });

    return {
      id: uuidv4(),
      targetId: target.id,
      channel,
      provider: provider?.provider || null,
      providerId: provider?.id || null,
      renderedContent: rendered,
      status: "PENDING",
    };
  },

  async resolveProvider({
    tenantId,
    appId,
    channel,
    source,
  }: {
    tenantId: string;
    appId?: string | null;
    channel: string;
    source?: string | null;
  }) {
    return ProviderPolicy.resolve({
      tenantId,
      appId: appId || undefined,
      channel: channel as any,
      source: source || undefined,
    });
  },

  async renderMessage({
    event,
    target,
    channel,
  }: {
    event: any;
    target: any;
    channel: string;
  }) {
    const template = event.template;
    console.log("event", event);
    const variables = {
      ...(event.payload || {}),
      target,
    };

    if (!template) {
      return {
        subject:
          event?.payload?.title ??
          event?.payload?.subject ??
          `No ${channel == "EMAIL" ? "subject" : "title"}`,
        body: event.payload?.body,
        data: event.payload || {},
        channel,
      };
    }

    const useEjs = shouldUseEjs(channel, template);

    return {
      subject: template.subject
        ? renderSafe(template.subject, variables, useEjs)
        : undefined,
      body: renderSafe(template.body || "", variables, useEjs),
      data: {
        ...(template.data || {}),
        ...(event.payload || {}),
      },
      channel,
    };
  },
};
