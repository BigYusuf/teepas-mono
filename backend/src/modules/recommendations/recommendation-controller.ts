import prisma from "../../libs/prisma";
import { NextFunction, Response } from "express";
import { recommendProperties } from "./recommendation.service";

// get recommended properties
export const getRecommendedProperties = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const properties = await prisma.properties.findMany({
      include: { images: true, agency: true },
    });

    let userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });

    const now = new Date();
    let recommendedProperties = [];

    if (!userAnalytics) {
      recommendedProperties = properties.slice(-10);
    } else {
      const actions = Array.isArray(userAnalytics.actions)
        ? (userAnalytics.actions as any[])
        : [];

      const recommendations = Array.isArray(userAnalytics.recommendations)
        ? (userAnalytics.recommendations as string[])
        : [];

      const lastTrainedTime = userAnalytics.lastTrained
        ? new Date(userAnalytics.lastTrained)
        : null;
      const hoursDiff = lastTrainedTime
        ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
        : Infinity;

      if (actions.length < 50) {
        recommendedProperties = properties.slice(-10);
      } else if (hoursDiff < 3 && recommendations.length > 0) {
        recommendedProperties = properties.filter((product: any) =>
          recommendations.includes(product.id),
        );
      } else {
        const recommendedPropertyIds = await recommendProperties(
          userId,
          properties,
        );
        recommendedProperties = properties.filter((product: any) =>
          recommendedPropertyIds.includes(product.id),
        );

        await prisma.userAnalytics.update({
          where: { userId },
          data: {
            recommendations: recommendedPropertyIds,
            lastTrained: now,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      recommendations: recommendedProperties,
    });
  } catch (error) {
    return next(error);
  }
};
