import { config } from "../../shared/configs/app.config";
import { prisma } from "../../shared/db";

export const getUrl = async (appId?: string) => {
  if (appId) {
    const app = await prisma.app.findUnique({
      where: {
        id: appId,
      },
    });
    if (!app) {
      throw new Error("App not found");
    }
    return app.redirectUris;
  } else {
    return config.APP_ORIGIN || "http://localhost:3000";
  }
};
