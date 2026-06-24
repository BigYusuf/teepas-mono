import { prisma } from "../../shared/db";
import { RedisWarmCacheService } from "./cors.servic";

export const corsCache = new RedisWarmCacheService<string[]>({
  keyPrefix: "cors:origins",
  intervalMs: 60 * 60 * 1000, // 1 hour

  fetcher: async () => {
    const apps = await prisma.app.findMany({
      select: {
        id: true,
        allowedOrigins: true,
      },
    });

    return apps.map((app) => ({
      key: app.id,
      value: app.allowedOrigins,
    }));
  },
});
