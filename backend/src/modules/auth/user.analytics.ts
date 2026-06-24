import prisma from "../../libs/prisma";
import { updatePropertyAnalytics } from "../property/property.analytics";

export const updateUserAnalytics = async (event: any) => {
  try {
    const exisitingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: { actions: true },
    });

    let updatedActions: any = exisitingData?.actions || [];

    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.propertyId === event.propertyId && entry.action === event.action,
    );

    // Always log property views
    if (event.action === "property_view") {
      updatedActions.push({
        propertyId: event?.propertyId,
        agencyId: event.agencyId,
        action: event.action,
        timestamp: new Date(),
      });
    }
    // One-time save for inquiry / save_property / apply
    else if (
      ["inquiry", "save_property", "apply"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        propertyId: event?.propertyId,
        agencyId: event.agencyId,
        action: event?.action,
        timestamp: new Date(),
      });
    }
    // Remove saved property
    else if (event.action === "unsave_property") {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.propertyId === event.propertyId &&
            entry.action === "save_property"
          ),
      );
    }

    // Keep only last 100 actions
    if (updatedActions.length > 100) {
      updatedActions.shift();
    }

    const extraFields: Record<string, any> = {};
    if (event.country) extraFields.country = event.country;
    if (event.city) extraFields.city = event.city;
    if (event.device) extraFields.device = event.device;

    // update or create user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    // Update property analytics
    await updatePropertyAnalytics(event);
  } catch (error) {
    console.log("Error storing user analytics:", error);
  }
};
