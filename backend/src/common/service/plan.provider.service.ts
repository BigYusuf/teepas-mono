import { prisma, redis } from "../../shared/db";

export interface CachedPlanProvider {
  id?: string;
  provider: string;
  config: any;
}

export class RedisPlanProviderService {
  private static readonly CACHE_PREFIX = "plan-provider";

  /**
   * Warm all plan defaults on app startup
   */
  static async cachePlanProviders(): Promise<void> {
    try {
      const configs = await prisma.planProviderConfig.findMany({
        orderBy: [
          { planId: "asc" },
          { channel: "asc" },
          { isDefault: "desc" },
          { priority: "asc" },
        ],
      });

      const grouped = new Map<string, CachedPlanProvider>();

      for (const config of configs) {
        const key = `${config.planId}:${config.channel}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            provider: config.provider,
            config: config.config,
          });
        }
      }

      const pipeline = redis.multi();

      for (const [key, value] of grouped.entries()) {
        pipeline.set(`${this.CACHE_PREFIX}:${key}`, JSON.stringify(value));
      }

      await pipeline.exec();

      console.log(`Cached ${grouped.size} plan provider configs`);
    } catch (error) {
      console.error("Failed to cache plan providers", error);
      throw error;
    }
  }

  /**
   * Get cached provider by providerId. If not cached, cache all providers for the plan and return the requested one.
   */
  static async getProvider(
    id: string,
    channel: string,
  ): Promise<CachedPlanProvider | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}:${channel}`;

      const cached = await redis.get(cacheKey);
      if (!cached) {
        await this.cacheOnePlanProvider(id, channel);
        return this.getProvider(id, channel);
      }
      return JSON.parse(cached);
    } catch (error) {
      console.error("Failed to get cached provider", error);
      throw error;
    }
  }

  /**
   * Get cached provider by planId and channel. If not cached, cache it and return.
   */
  static async getPlanProvider(
    planId: string,
    channel: string,
  ): Promise<CachedPlanProvider | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${planId}:${channel}`;

      const cached = await redis.get(cacheKey);

      if (!cached) {
        await this.cacheSinglePlanProvider(planId, channel);
        return this.getPlanProvider(planId, channel);
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error("Failed to get cached plan provider", error);
      throw error;
    }
  }

  /**
   * Cache one provider only (by planid and channel). It will select the provider based on the priority and default flag.
   */
  static async cacheSinglePlanProvider(
    planId: string,
    channel: string,
  ): Promise<void> {
    const providers = await prisma.planProviderConfig.findMany({
      where: {
        planId,
        channel: channel as any,
      },
      orderBy: [{ isDefault: "desc" }, { priority: "asc" }],
    });

    if (!providers.length) return;

    const selected = providers[0];

    await redis.set(
      `${this.CACHE_PREFIX}:${planId}:${channel}`,
      JSON.stringify({
        id: selected.id,
        provider: selected.provider,
        config: selected.config,
      }),
    );
  }

  /**
   * Cache one provider only (by providerId and channel). It will select the provider based on the priority and default flag.
   */
  static async cacheOnePlanProvider(
    providerId: string,
    channel: string,
  ): Promise<void> {
    let selected: { provider: string; config: any; id?: string } | null = null;

    selected = await prisma.planProviderConfig.findUnique({
      where: {
        id: providerId,
        channel: channel as any,
      },
    });

    if (!selected) {
      selected = await prisma.planProviderConfig.findUnique({
        where: {
          id: providerId,
          channel: channel as any,
        },
      });
    }

    await redis.set(
      `${this.CACHE_PREFIX}:${providerId}:${channel}`,
      JSON.stringify({
        id: selected?.id,
        provider: selected?.provider,
        config: selected?.config,
      }),
    );
  }

  /**
   * Invalidate specific/all plan cache
   */
  static async invalidateCache(
    planId: string,
    channel?: string,
  ): Promise<void> {
    if (channel) {
      await redis.del(`${this.CACHE_PREFIX}:${planId}:${channel}`);
      return;
    }

    await redis.del(
      `${this.CACHE_PREFIX}:${planId}:EMAIL`,
      `${this.CACHE_PREFIX}:${planId}:SMS`,
      `${this.CACHE_PREFIX}:${planId}:PUSH`,
    );
  }
}
