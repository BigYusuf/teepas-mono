// controllers/application.controller.ts
import { Response, NextFunction } from "express";
import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { computeOverallStatus } from "../../common/utils/application-status";
import { markAgencyTaskCompleted } from "../../middleware/markTask";
import { logInteraction } from "../../queues/interaction.queue";

// ── CREATE — user applies to a listing ────────────────────────────────────
export const applyToListing = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId } = req.params;
    const userId = req.user?.id;
    if (!userId)
      return next(new AuthError("Only users can apply to listings."));

    const listing = await prisma.listings.findUnique({
      where: { id: listingId },
      include: { unit: { include: { property: true } } },
    });
    if (!listing) return next(new NotFoundError("Listing not found."));
    if (listing.status !== "ACTIVE") {
      return next(
        new ValidationError(
          "This listing is not currently accepting applications.",
        ),
      );
    }

    const existing = await prisma.propertyApplications.findFirst({
      where: { userId, listingId },
    });
    if (existing) {
      return next(
        new ValidationError("You have already applied to this listing."),
      );
    }

    const application = await prisma.propertyApplications.create({
      data: {
        userId,
        listingId,
        agencyId: listing.unit.property.agencyId,
      },
      include: {
        listing: {
          select: {
            id: true,
            purpose: true,
            unit: {
              select: {
                unitLabel: true,
                property: { select: { title: true } },
              },
            },
          },
        },
        agency: { select: { name: true } },
      },
    });

    await prisma.propertyAnalytics
      .upsert({
        where: { listingId },
        update: { applications: { increment: 1 } },
        create: {
          listingId,
          agencyId: listing.unit.property.agencyId,
          applications: 1,
          lastViewedAt: new Date(),
        },
      })
      .catch((err) =>
        console.error("Failed to record application analytics:", err),
      );

    logInteraction(userId, listingId, "APPLY").catch((err) =>
      console.error("Failed to log interaction:", err),
    );
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// ── READ — user's own applications ────────────────────────────────────────
export const getMyApplications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return next(new AuthError("Only users can view their applications."));

    const { status } = req.query;

    const applications = await prisma.propertyApplications.findMany({
      where: { userId, ...(status && { overallStatus: status }) },
      include: {
        listing: {
          include: {
            pricing: true,
            unit: {
              include: {
                images: { where: { isCover: true }, take: 1 },
                property: { select: { title: true, city: true } },
              },
            },
          },
        },
        agency: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// ── READ — agency's received applications ─────────────────────────────────
export const getAgencyApplications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const { status, listingId } = req.query;

    const applications = await prisma.propertyApplications.findMany({
      where: {
        agencyId: req.agency.id,
        ...(status && { overallStatus: status }),
        ...(listingId && { listingId }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: {
          include: {
            unit: {
              select: {
                unitLabel: true,
                property: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// ── READ — single application ─────────────────────────────────────────────
export const getApplicationById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        agency: { select: { id: true, name: true } },
        listing: {
          include: {
            pricing: true,
            unit: {
              include: { structure: true, property: true, images: true },
            },
          },
        },
      },
    });
    if (!application) return next(new NotFoundError("Application not found."));

    const isOwner = application.userId === req.user?.id;
    const isAgency = application.agencyId === req.agency?.id;
    if (!isOwner && !isAgency) {
      return next(new AuthError("Not authorized to view this application."));
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// ── USER: cancel application ──────────────────────────────────────────────
export const cancelApplication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
    });
    if (!application) return next(new NotFoundError("Application not found."));
    if (application.userId !== userId)
      return next(new AuthError("Not authorized."));
    if (application.overallStatus === "COMPLETED") {
      return next(
        new ValidationError("Cannot cancel a completed application."),
      );
    }

    const updated = await prisma.propertyApplications.update({
      where: { id },
      data: {
        userStatus: "CANCELLED",
        overallStatus: computeOverallStatus(
          "CANCELLED",
          application.agencyStatus,
        ),
      },
    });

    res.status(200).json({ success: true, application: updated });
  } catch (error) {
    next(error);
  }
};

// ── AGENCY: schedule inspection ────────────────────────────────────────────
export const scheduleInspectionForApplication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { scheduledAt, notes } = req.body;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    if (!scheduledAt)
      return next(new ValidationError("scheduledAt is required."));

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
      include: {
        listing: { select: { unit: { select: { propertyId: true } } } },
      },
    });
    if (!application) return next(new NotFoundError("Application not found."));
    if (application.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    const result = await prisma.$transaction(async (tx) => {
      const inspection = await tx.propertyInspections.create({
        data: {
          listingId: application.listingId,
          agencyId: req.agency.id,
          requestedById: application.userId,
          scheduledAt: new Date(scheduledAt),
          notes,
        },
      });

      const updatedApplication = await tx.propertyApplications.update({
        where: { id },
        data: {
          userStatus: "INSPECTION_SCHEDULED",
          agencyStatus: "INSPECTION_APPROVED",
          overallStatus: computeOverallStatus(
            "INSPECTION_SCHEDULED",
            "INSPECTION_APPROVED",
          ),
        },
      });

      return { inspection, application: updatedApplication };
    });

    await markAgencyTaskCompleted(req.agency.id, "CREATE_PROPERTY_INSPECTION");

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ── AGENCY: approve or reject ──────────────────────────────────────────────
export const updateAgencyApplicationStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { agencyStatus } = req.body; // "APPROVED" | "REJECTED"
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    if (!["APPROVED", "REJECTED"].includes(agencyStatus)) {
      return next(
        new ValidationError("agencyStatus must be APPROVED or REJECTED."),
      );
    }

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
    });
    if (!application) return next(new NotFoundError("Application not found."));
    if (application.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    const updated = await prisma.propertyApplications.update({
      where: { id },
      data: {
        agencyStatus,
        overallStatus: computeOverallStatus(
          application.userStatus,
          agencyStatus,
        ),
      },
    });

    res.status(200).json({ success: true, application: updated });
  } catch (error) {
    next(error);
  }
};

// ── USER: respond after agency approval (final accept) ────────────────────
export const userAcceptApplication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
    });
    if (!application) return next(new NotFoundError("Application not found."));
    if (application.userId !== userId)
      return next(new AuthError("Not authorized."));
    if (application.agencyStatus !== "APPROVED") {
      return next(
        new ValidationError("Agency has not approved this application yet."),
      );
    }

    const updated = await prisma.propertyApplications.update({
      where: { id },
      data: {
        userStatus: "APPROVED",
        overallStatus: computeOverallStatus(
          "APPROVED",
          application.agencyStatus,
        ),
      },
    });

    res.status(200).json({ success: true, application: updated });
  } catch (error) {
    next(error);
  }
};
