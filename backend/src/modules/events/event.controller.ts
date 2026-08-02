// controllers/marketingEvent.controller.ts
import { Response, NextFunction } from "express";
import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { deductCreditsDynamic } from "../../middleware/creditDeduction";
import { markAgencyTaskCompleted } from "../../middleware/markTask";

// ── CREATE — agency creates a marketing event (ad campaign) ───────────────
export const createEvent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const {
      title,
      description,
      platforms,
      showOnHomepage,
      startDate,
      endDate,
      type, // AGENCY | PROPERTY
      propertyIds, // required if type === PROPERTY
    } = req.body;

    if (!title || !startDate || !endDate) {
      return next(
        new ValidationError("title, startDate, and endDate are required."),
      );
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return next(new ValidationError("endDate must be after startDate."));
    }
    if (type === "GLOBAL") {
      return next(
        new ValidationError(
          "GLOBAL events can only be created by platform admins.",
        ),
      );
    }
    if (type === "PROPERTY" && (!propertyIds || !propertyIds.length)) {
      return next(
        new ValidationError(
          "propertyIds is required for PROPERTY-type events.",
        ),
      );
    }

    // If any properties are linked, confirm they belong to this agency
    if (propertyIds?.length) {
      const owned = await prisma.properties.count({
        where: { id: { in: propertyIds }, agencyId: req.agency.id },
      });
      if (owned !== propertyIds.length) {
        return next(
          new ValidationError(
            "One or more properties don't belong to this agency.",
          ),
        );
      }
    }

    const event = await prisma.$transaction(async (tx) => {
      // Cost model — showOnHomepage campaigns typically cost more visibility credits
      const creditUsage = await deductCreditsDynamic(
        {
          agencyId: req.agency.id,
          action: "CREATE_MARKETING_EVENT",
          tier: showOnHomepage ? "HOMEPAGE" : "STANDARD",
        },
        tx,
      );

      const created = await tx.marketingEvents.create({
        data: {
          title,
          description,
          platforms: platforms ?? ["WEB", "MOBILE"],
          showOnHomepage: !!showOnHomepage,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          type,
          status: "ACTIVE",
          pointsUsed: creditUsage.cost,
          agencyId: req.agency.id,
          propertyLinks: propertyIds?.length
            ? {
                create: propertyIds.map((propertyId: string) => ({
                  propertyId,
                })),
              }
            : undefined,
        },
        include: {
          propertyLinks: { include: { property: { select: { title: true } } } },
        },
      });

      const wallet = await tx.agencyCredits.findUnique({
        where: { agencyId: req.agency.id },
      });
      if (wallet) {
        await tx.creditTransactions.create({
          data: {
            agencyId: req.agency.id,
            type: "SPENT",
            amount: creditUsage.cost,
            balanceBefore: wallet.balance + creditUsage.cost,
            balanceAfter: wallet.balance,
            purpose: "CREATE_MARKETING_EVENT",
            note: `Event: ${title}`,
            eventId: created.id,
          },
        });
      }

      return created;
    });

    await markAgencyTaskCompleted(req.agency.id, "CREATE_FIRST_ADVERTISEMENT");

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ── READ — single event ─────────────────────────────────────────────────
export const getEventById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const event = await prisma.marketingEvents.findUnique({
      where: { id },
      include: {
        images: true,
        agency: { select: { id: true, name: true, media: true } },
        propertyLinks: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                units: {
                  take: 1,
                  include: {
                    images: { where: { isCover: true }, take: 1 },
                    listings: {
                      where: { status: "ACTIVE" },
                      include: { pricing: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!event) return next(new NotFoundError("Event not found."));

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ── READ — public list (homepage sliders, browse) ─────────────────────────
export const listEvents = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, showOnHomepage, page = "1", limit = "20" } = req.query;
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const now = new Date();
    const where: any = {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      ...(type && { type }),
      ...(showOnHomepage !== undefined && {
        showOnHomepage: showOnHomepage === "true",
      }),
    };

    const [events, total] = await Promise.all([
      prisma.marketingEvents.findMany({
        where,
        include: {
          images: true,
          agency: { select: { id: true, name: true } },
          propertyLinks: {
            take: 3,
            include: {
              property: {
                select: {
                  title: true,
                  units: {
                    take: 1,
                    include: { images: { where: { isCover: true }, take: 1 } },
                  },
                },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      prisma.marketingEvents.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── READ — agency's own events ─────────────────────────────────────────────
export const getAgencyEvents = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    const { status } = req.query;

    const events = await prisma.marketingEvents.findMany({
      where: { agencyId: req.agency.id, ...(status && { status }) },
      include: {
        images: true,
        propertyLinks: { include: { property: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE — edit event details ─────────────────────────────────────────
export const updateEvent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));
    if (event.status !== "DRAFT" && event.status !== "ACTIVE") {
      return next(
        new ValidationError(
          "Cannot edit an event that has ended or been terminated.",
        ),
      );
    }

    const {
      title,
      description,
      platforms,
      showOnHomepage,
      startDate,
      endDate,
    } = req.body;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return next(new ValidationError("endDate must be after startDate."));
    }

    const updated = await prisma.marketingEvents.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(platforms && { platforms }),
        ...(showOnHomepage !== undefined && { showOnHomepage }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });

    res.status(200).json({ success: true, event: updated });
  } catch (error) {
    next(error);
  }
};

// ── LINK / UNLINK PROPERTIES ────────────────────────────────────────────
export const linkPropertiesToEvent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { propertyIds } = req.body;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    if (!propertyIds?.length)
      return next(new ValidationError("propertyIds is required."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    const owned = await prisma.properties.count({
      where: { id: { in: propertyIds }, agencyId: req.agency.id },
    });
    if (owned !== propertyIds.length) {
      return next(
        new ValidationError(
          "One or more properties don't belong to this agency.",
        ),
      );
    }

    // Avoid duplicate links
    const existing = await prisma.eventPropertyLink.findMany({
      where: { eventId: id, propertyId: { in: propertyIds } },
      select: { propertyId: true },
    });
    const existingIds = new Set(existing.map((e) => e.propertyId));
    const newIds = propertyIds.filter((pid: string) => !existingIds.has(pid));

    if (newIds.length) {
      await prisma.eventPropertyLink.createMany({
        data: newIds.map((propertyId: string) => ({ eventId: id, propertyId })),
      });
    }

    res
      .status(200)
      .json({
        success: true,
        message: `${newIds.length} propert(y/ies) linked.`,
      });
  } catch (error) {
    next(error);
  }
};

export const unlinkPropertyFromEvent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, propertyId } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    await prisma.eventPropertyLink.deleteMany({
      where: { eventId: id, propertyId },
    });

    res.status(200).json({ success: true, message: "Property unlinked." });
  } catch (error) {
    next(error);
  }
};

// ── IMAGES ────────────────────────────────────────────────────────────────
export const addEventImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { url, fileId, platform } = req.body;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    const image = await prisma.eventImages.create({
      data: { eventId: id, url, fileId, platform },
    });

    res.status(201).json({ success: true, image });
  } catch (error) {
    next(error);
  }
};

export const deleteEventImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { imageId } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const image = await prisma.eventImages.findUnique({
      where: { id: imageId },
      include: { event: { select: { agencyId: true } } },
    });
    if (!image) return next(new NotFoundError("Image not found."));
    if (image.event?.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));

    await prisma.eventImages.delete({ where: { id: imageId } });

    res.status(200).json({ success: true, message: "Image deleted." });
  } catch (error) {
    next(error);
  }
};

// ── END / TERMINATE ─────────────────────────────────────────────────────
export const endEvent = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));
    if (!["ACTIVE", "UPCOMING", "DRAFT"].includes(event.status)) {
      return next(
        new ValidationError(`Cannot end an event with status ${event.status}.`),
      );
    }

    const updated = await prisma.marketingEvents.update({
      where: { id },
      data: { status: "ENDED" },
    });

    res.status(200).json({ success: true, event: updated });
  } catch (error) {
    next(error);
  }
};

// ── DELETE (draft only — anything live should be ended, not deleted) ──────
export const deleteEvent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const event = await prisma.marketingEvents.findUnique({ where: { id } });
    if (!event) return next(new NotFoundError("Event not found."));
    if (event.agencyId !== req.agency.id)
      return next(new AuthError("Not authorized."));
    if (event.status !== "DRAFT") {
      return next(
        new ValidationError(
          "Only draft events can be deleted. End a live event instead.",
        ),
      );
    }

    await prisma.marketingEvents.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    next(error);
  }
};
