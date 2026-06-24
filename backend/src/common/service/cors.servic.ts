import { redis } from "../../shared/db";

export interface WarmCacheOptions<T> {
  keyPrefix: string;
  ttlSeconds?: number;
  intervalMs?: number;

  fetcher: () => Promise<Array<{
    key: string;
    value: T;
  }>>;
}

export class RedisWarmCacheService<T> {
  private options: WarmCacheOptions<T>;
  private interval?: NodeJS.Timeout;
  private isWarming = false;

  constructor(options: WarmCacheOptions<T>) {
    this.options = {
      ttlSeconds: 3600,
      intervalMs: 3600 * 1000,
      ...options,
    };
  }

  /**
   * Warm cache manually (DB → Redis)
   */
  async warm(): Promise<void> {
    if (this.isWarming) return;

    this.isWarming = true;

    try {
      const items = await this.options.fetcher();

      const pipeline = redis.multi();

      for (const item of items) {
        pipeline.set(
          `${this.options.keyPrefix}:${item.key}`,
          JSON.stringify(item.value),
          "EX",
          this.options.ttlSeconds,
        );
      }

      await pipeline.exec();

      console.log(
        `🔥 Warm cache updated: ${items.length} items (${this.options.keyPrefix})`,
      );
    } catch (error) {
      console.error("Warm cache failed:", error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Start auto refresh loop
   */
  startAutoRefresh(): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.warm();
    }, this.options.intervalMs);

    console.log(
      `♻️ Auto-refresh started: ${this.options.keyPrefix}`,
    );
  }

  /**
   * Stop auto refresh
   */
  stopAutoRefresh(): void {
    if (!this.interval) return;

    clearInterval(this.interval);
    this.interval = undefined;

    console.log(
      `⛔ Auto-refresh stopped: ${this.options.keyPrefix}`,
    );
  }

  /**
   * Get cached value
   */
  async get(key: string): Promise<T | null> {
    const cached = await redis.get(
      `${this.options.keyPrefix}:${key}`,
    );

    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Force refresh now
   */
  async refresh(): Promise<void> {
    await this.warm();
  }
}