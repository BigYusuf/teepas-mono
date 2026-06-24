import app from "./app";
// import { corsCache } from "./common/service/cors.cache.service";
// import { RedisPlanProviderService } from "./common/service/plan.provider.service";

// side effects (cron)
// import "./cron/redis.hourly";
import { config } from "./shared/configs/app.config";

const startServer = async () => {
  try {
    const server = app.listen(config.PORT, async () => {
 
      console.log(`🚀 API listening at ${config.PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      // try {
        //running redis cache sercvices
        // await RedisPlanProviderService.cachePlanProviders();
        // await corsCache.warm();
        // await corsCache.startAutoRefresh();

        // console.log("✅ Redis Cache Warmed-up successfully!");
      // } catch (error) {
      //   console.error("❌ Failed to initialize redis warm service:", error);
      // }
    });

    // graceful shutdown (important for workers later)
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("HTTP server closed");
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
