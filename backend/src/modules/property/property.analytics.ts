import prisma from "../../libs/prisma";

export const updatePropertyAnalytics = async (event: any) => {
  try {
    if (!event.propertyId || !event.agencyId) return;

    const updateFields: any = {};

    if (event.action === "property_view") updateFields.views = { increment: 1 };
    if (event.action === "inquiry") updateFields.inquiries = { increment: 1 };
    if (event.action === "save_property") updateFields.saved = { increment: 1 };
    if (event.action === "unsave_property")
      updateFields.saved = { decrement: 1 };
    if (event.action === "apply") updateFields.applications = { increment: 1 };
    if (event.action === "rent") updateFields.rents = { increment: 1 };
    if (event.action === "sale") updateFields.sales = { increment: 1 };

    await prisma.propertyAnalytics.upsert({
      where: { propertyId: event.propertyId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        propertyId: event.propertyId,
        agencyId: event.agencyId,
        views: event.action === "property_view" ? 1 : 0,
        inquiries: event.action === "inquiry" ? 1 : 0,
        saved: event.action === "save_property" ? 1 : 0,
        applications: event.action === "apply" ? 1 : 0,
        rents: event.action === "rent" ? 1 : 0,
        sales: event.action === "sale" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });

    // If user applied → log in propertyApplications table
    if (event.action === "apply") {
      await prisma.propertyApplications.upsert({
        where: {
          id: event.id,
          userId: event.userId,
          propertyId: event.propertyId,
        },
        update: {
          userStatus: "PENDING", // default when user applies
          agencyStatus: "PENDING",
          overallStatus: "PENDING",
        },
        create: {
          userId: event.userId,
          propertyId: event.propertyId,
          userStatus: "PENDING",
          agencyStatus: "PENDING",
          overallStatus: "PENDING",
        },
      });
    }

    if (
      event.action === "sale" ||
      event.action === "rent" ||
      event.action === "lease" ||
      event.action === "short_let"
    ) {
      await prisma.propertyTransactions.create({
        data: {
          userId: event.userId,
          propertyId: event.propertyId,
          agencyId: event.agencyId,
          amount: event.amount,
          type:
            event?.action === "lease"
              ? "LEASE"
              : event?.action === "sale"
                ? "SALE"
                : event?.action === "rent"
                  ? "RENT"
                  : event?.action === "short_let"
                    ? "SHORT_LET"
                    : event?.action,
          status: "PENDING",
        },
      });
    }
  } catch (error) {
    console.log("Error updating property analytics:", error);
  }
};
