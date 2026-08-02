// controllers/listingDraft.controller.ts
import { Response, NextFunction, Request } from "express";
import slugify from "slugify";

import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { generatePropertySlug } from "../../utils/generateSlug";
import { markAgencyTaskCompleted } from "../../middleware/markTask";
import { listingDraftSchema } from "../../common/validators/listingsDraft";
import redis from "../../libs/redis";

// ── CREATE DRAFT ──────────────────────────────────────────────────────────
// Starts an empty (or partially seeded) draft. Frontend calls this once
// when the agent taps "Add Listing", before they've typed anything.
export const createDraft = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agent?.id)
      return next(new AuthError("Only agents can create listings."));
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const { isMultiUnit = false, seed = {} } = req.body;

    const draft = await prisma.listingDrafts.create({
      data: {
        agencyId: req.agency.id,
        agentId: req.agent.id,
        isMultiUnit,
        data: seed, // usually {} — frontend fills it in via autosave
        status: "IN_PROGRESS",
      },
    });

    res.status(201).json({ success: true, draft });
  } catch (error) {
    next(error);
  }
};

// ── AUTOSAVE ──────────────────────────────────────────────────────────────
// Called on every meaningful field change / step transition from the
// frontend. Merges into existing data rather than overwriting, so a
// partial payload (e.g. just the pricing step) doesn't wipe earlier steps.
export const autosaveDraft = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { data, lastSavedStep } = req.body;

    const existing = await prisma.listingDrafts.findUnique({ where: { id } });
    if (!existing) return next(new NotFoundError("Draft not found."));
    if (existing.agentId !== req.agent?.id) {
      return next(new AuthError("Not authorized to edit this draft."));
    }
    if (existing.status === "PUBLISHED") {
      return next(new ValidationError("Cannot edit a published draft."));
    }

    const mergedData = deepMerge(existing.data as object, data ?? {});

    const draft = await prisma.listingDrafts.update({
      where: { id },
      data: {
        data: mergedData,
        lastSavedStep: lastSavedStep ?? existing.lastSavedStep,
        status: "IN_PROGRESS",
      },
    });

    res.status(200).json({ success: true, draft });
  } catch (error) {
    next(error);
  }
};

// Simple recursive merge — good enough for form data (objects merge,
// arrays and primitives get replaced wholesale by the incoming value).
function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) return source;
  if (typeof source !== "object" || source === null) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    result[key] =
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
        ? deepMerge(target?.[key] ?? {}, source[key])
        : source[key];
  }
  return result;
}

// ── GET DRAFT ─────────────────────────────────────────────────────────────
export const getDraft = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const draft = await prisma.listingDrafts.findUnique({ where: { id } });
    if (!draft) return next(new NotFoundError("Draft not found."));
    if (draft.agentId !== req.agent?.id) {
      return next(new AuthError("Not authorized to view this draft."));
    }

    res.status(200).json({ success: true, draft });
  } catch (error) {
    next(error);
  }
};

// ── LIST MY DRAFTS ───────────────────────────────────────────────────────
// "Continue where you left off" screen — shows in-progress drafts per agent.
export const listDrafts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agent?.id)
      return next(new AuthError("Only agents can view drafts."));

    const drafts = await prisma.listingDrafts.findMany({
      where: {
        agentId: req.agent.id,
        status: { in: ["IN_PROGRESS", "READY"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ success: true, drafts });
  } catch (error) {
    next(error);
  }
};

// ── DISCARD DRAFT ────────────────────────────────────────────────────────
export const discardDraft = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const draft = await prisma.listingDrafts.findUnique({ where: { id } });
    if (!draft) return next(new NotFoundError("Draft not found."));
    if (draft.agentId !== req.agent?.id) {
      return next(new AuthError("Not authorized to discard this draft."));
    }

    await prisma.listingDrafts.update({
      where: { id },
      data: { status: "DISCARDED" },
    });

    res.status(200).json({ success: true, message: "Draft discarded." });
  } catch (error) {
    next(error);
  }
};

// ── EDIT EXISTING LIVE LISTING AS A DRAFT ────────────────────────────────
// Pulls a published listing's current state into a fresh draft row so the
// agent can edit it through the same form/autosave flow, without touching
// the live listing until they republish.
export const editListingAsDraft = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId } = req.params;
    if (!req.agent?.id)
      return next(new AuthError("Only agents can edit listings."));

    const listing = await prisma.listings.findUnique({
      where: { id: listingId },
      include: {
        unit: {
          include: {
            property: true,
            structure: true,
            images: true,
            videos: true,
            floorPlans: true,
            amenities: { include: { amenity: true } },
          },
        },
        pricing: true,
      },
    });
    if (!listing) return next(new NotFoundError("Listing not found."));
    if (listing.unit.property.agentId !== req.agent.id) {
      return next(new AuthError("Not authorized to edit this listing."));
    }

    const { property, structure, images, videos, floorPlans, amenities } =
      listing.unit;

    const seededData = {
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
      tags: property.tags,
      isMultiUnit: property.isMultiUnit,
      unit: {
        unitLabel: listing.unit.unitLabel,
        category: listing.unit.category,
        type: listing.unit.type,
        purpose: listing.unit.purpose,
        furnishing: listing.unit.furnishing,
        condition: listing.unit.condition,
        sizeSqm: listing.unit.sizeSqm,
        structure: structure ?? {},
        amenityIds: amenities.map((a) => a.amenityId),
        images: images.map((i) => ({
          fileId: i.fileId,
          url: i.url,
          isCover: i.isCover,
        })),
        videos: videos.map((v) => ({ fileId: v.fileId, url: v.url })),
        floorPlans: floorPlans.map((f) => ({ fileId: f.fileId, name: f.name })),
        listingPurpose: listing.purpose,
        availability: listing.availability,
        availableFrom: listing.availableFrom,
        pricing: listing.pricing ?? {},
      },
    };

    // Reuse an existing edit-draft for this listing if one's already open,
    // rather than spawning duplicates every time they tap "Edit".
    const draft = await prisma.listingDrafts.upsert({
      where: { listingId },
      update: { data: seededData, status: "IN_PROGRESS" },
      create: {
        agencyId: listing.unit.property.agencyId,
        agentId: req.agent.id,
        listingId,
        isMultiUnit: property.isMultiUnit,
        data: seededData,
        status: "IN_PROGRESS",
      },
    });

    res.status(200).json({ success: true, draft });
  } catch (error) {
    next(error);
  }
};

// ── PUBLISH ───────────────────────────────────────────────────────────────
// Validates the whole draft at once, then materializes it into real rows.
// Handles three cases: new standalone, new multi-unit, and republish of an
// existing edited listing.
export const publishDraft = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: draftId } = req.params;

    const draft = await prisma.listingDrafts.findUnique({
      where: { id: draftId },
    });
    if (!draft) return next(new NotFoundError("Draft not found."));
    if (draft.agentId !== req.agent?.id)
      return next(new AuthError("Not authorized."));
    if (draft.status === "PUBLISHED") {
      return next(
        new ValidationError("This draft has already been published."),
      );
    }

    const parsed = listingDraftSchema.safeParse(draft.data);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        message: "Listing is incomplete.",
        errors: parsed.error.flatten(),
      });
    }
    const form = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // ── Republishing an edit of an existing listing ──
      if (draft.listingId) {
        const existing = await tx.listings.findUniqueOrThrow({
          where: { id: draft.listingId },
          include: { unit: true },
        });

        await tx.properties.update({
          where: { id: existing.unit.propertyId },
          data: {
            title: form.title,
            description: form.description,
            address: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
            latitude: form.latitude,
            longitude: form.longitude,
            tags: form.tags,
          },
        });

        const u = form.unit!; // guaranteed by schema when isMultiUnit=false
        await tx.propertyUnits.update({
          where: { id: existing.unitId },
          data: {
            type: u.type,
            purpose: u.purpose,
            furnishing: u.furnishing,
            condition: u.condition,
            sizeSqm: u.sizeSqm,
          },
        });

        const listing = await tx.listings.update({
          where: { id: existing.id },
          data: {
            purpose: u.listingPurpose,
            availability: u.availability,
            availableFrom: u.availableFrom,
            status: "ACTIVE",
            publishedAt: new Date(),
            pricing: {
              upsert: { update: u.pricing, create: u.pricing },
            },
          },
        });

        return { property: null, listings: [listing] };
      }

      // ── Fresh publish (standalone or multi-unit) ──
      const property = await tx.properties.create({
        data: {
          title: form.title,
          description: form.description,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          latitude: form.latitude,
          longitude: form.longitude,
          tags: form.tags,
          isMultiUnit: form.isMultiUnit,
          agencyId: draft.agencyId,
          agentId: draft.agentId,
          nearByLocation: form.nearByLocation.length
            ? { create: form.nearByLocation }
            : undefined,
        },
      });

      const unitsToCreate = form.isMultiUnit ? form.units! : [form.unit!];
      const listings = [];

      for (const u of unitsToCreate) {
        const unit = await tx.propertyUnits.create({
          data: {
            propertyId: property.id,
            unitLabel: u.unitLabel,
            category: u.category,
            type: u.type,
            designType: u.designType as any,
            purpose: u.purpose as any,
            economicClass: u.economicClass as any,
            furnishing: u.furnishing,
            condition: u.condition,
            sizeSqm: u.sizeSqm,
            landSizeSqm: u.landSizeSqm,
            yearBuilt: u.yearBuilt,
            electricity: u.electricity as any,
            waterSupply: u.waterSupply as any,
            structure: u.structure
              ? ({ create: u.structure } as any)
              : undefined,
            images: u.images.length ? { create: u.images } : undefined,
            videos: u.videos.length ? { create: u.videos } : undefined,
            floorPlans: u.floorPlans.length
              ? { create: u.floorPlans }
              : undefined,
            amenities: u.amenityIds.length
              ? { create: u.amenityIds.map((amenityId) => ({ amenityId })) }
              : undefined,
          },
        });

        const listing = await tx.listings.create({
          data: {
            unitId: unit.id,
            slug: generatePropertySlug({
              title: `${form.title}${u.unitLabel ? ` - ${u.unitLabel}` : ""}`,
              bedrooms: u.structure?.bedrooms ?? 0,
              price: u.pricing.basePrice,
              city: form.city,
              type: u.type,
            }),
            purpose: u.listingPurpose,
            availability: u.availability,
            availableFrom: u.availableFrom,
            status: "ACTIVE",
            publishedAt: new Date(),
            pricing: { create: u.pricing },
          },
        });

        listings.push(listing);
      }

      return { property, listings };
    });

    await prisma.listingDrafts.update({
      where: { id: draftId },
      data: { status: "PUBLISHED", listingId: result.listings[0].id },
    });

    // Fire property/listing-count tasks off real publish, not draft creation
    await markAgencyTaskCompleted(draft.agencyId, "CREATE_FIRST_PROPERTY");
    if (result.listings.length >= 5) {
      await markAgencyTaskCompleted(draft.agencyId, "ADD_5_PROPERTIES");
    }
    if (result.listings.length >= 10) {
      await markAgencyTaskCompleted(draft.agencyId, "ADD_10_PROPERTIES");
    }

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE LISTING (public detail view) ──────────────────────────────
// The main screen a user lands on after tapping a search result.
export const getListingById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listings.findUnique({
      where: { id },
      include: {
        pricing: true,
        unit: {
          include: {
            structure: true,
            images: { orderBy: { order: "asc" } },
            videos: true,
            floorPlans: true,
            amenities: { include: { amenity: true } },
            property: {
              include: {
                agency: {
                  include: { media: true, contact: true },
                },
                nearByLocation: true,
              },
            },
          },
        },
      },
    });

    if (!listing || listing.status === "ARCHIVED") {
      return next(new NotFoundError("Listing not found."));
    }

    // Fire-and-forget view increment — don't block the response on it
    prisma.propertyAnalytics
      .upsert({
        where: { listingId: id },
        update: { views: { increment: 1 }, lastViewedAt: new Date() },
        create: {
          listingId: id,
          agencyId: listing.unit.property.agencyId,
          views: 1,
          lastViewedAt: new Date(),
        },
      })
      .catch((err) => console.error("Failed to record listing view:", err));

    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// ── SEARCH / BROWSE LISTINGS ──────────────────────────────────────────────
// Main feed. Filters read through unit → structure for bedroom/bathroom
// counts, since those live on the unit, not the listing.
export const searchListings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      city,
      state,
      purpose, // RENT | SALE | LEASE | SHORT_LET
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      type, // PropertyType
      furnishing,
      amenityIds,
      page = 1,
      limit = 20,
    } = req.query;

    const where: any = {
      status: "ACTIVE",
      ...(purpose && { purpose }),
      unit: {
        ...(type && { type }),
        ...(furnishing && { furnishing }),
        ...(bedrooms && { structure: { bedrooms: Number(bedrooms) } }),
        ...(bathrooms && { structure: { bathrooms: Number(bathrooms) } }),
        property: {
          ...(city && { city: { equals: city, mode: "insensitive" } }),
          ...(state && { state: { equals: state, mode: "insensitive" } }),
        },
        ...(amenityIds && {
          amenities: {
            some: { amenityId: { in: (amenityIds as string).split(",") } },
          },
        }),
      },
      ...(minPrice || maxPrice
        ? {
            pricing: {
              basePrice: {
                ...(minPrice && { gte: Number(minPrice) }),
                ...(maxPrice && { lte: Number(maxPrice) }),
              },
            },
          }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      prisma.listings.findMany({
        where,
        include: {
          pricing: true,
          unit: {
            include: {
              structure: true,
              images: { where: { isCover: true }, take: 1 },
              property: { select: { title: true, city: true, state: true } },
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.listings.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── AGENCY DASHBOARD — "MY LISTINGS" ──────────────────────────────────────
// The tree view: properties with their units and each unit's listing status.
export const getAgencyListings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const { status } = req.query; // optional filter: ACTIVE | DRAFT | RENTED | SOLD etc.

    const properties = await prisma.properties.findMany({
      where: { agencyId: req.agency.id, isDeleted: false },
      include: {
        units: {
          include: {
            structure: true,
            images: { where: { isCover: true }, take: 1 },
            listings: {
              where: status ? { status } : undefined,
              include: { pricing: true },
              orderBy: { createdAt: "desc" },
              take: 1, // most recent listing per unit — the "current" one
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, properties });
  } catch (error) {
    next(error);
  }
};

// ── SIBLING UNITS ─────────────────────────────────────────────────────────
// "3 other shops available at this complex" — shown on a listing's detail page.
export const getSiblingListings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // current listing id

    const current = await prisma.listings.findUnique({
      where: { id },
      select: { unit: { select: { propertyId: true } } },
    });
    if (!current) return next(new NotFoundError("Listing not found."));

    const siblings = await prisma.listings.findMany({
      where: {
        status: "ACTIVE",
        id: { not: id },
        unit: { propertyId: current.unit.propertyId },
      },
      include: {
        pricing: true,
        unit: { include: { images: { where: { isCover: true }, take: 1 } } },
      },
    });

    res.status(200).json({ success: true, siblings });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE STATUS (pause / relist / archive) ─────────────────────────────
// Covers the lifecycle transitions that aren't full re-edits: an agent
// pausing a listing temporarily, marking it RENTED/SOLD manually, or
// archiving it.
const allowedTransitions: Record<string, string[]> = {
  ACTIVE: ["PENDING", "RENTED", "SOLD", "EXPIRED", "ARCHIVED"],
  PENDING: ["ACTIVE", "ARCHIVED"],
  RENTED: ["ACTIVE", "ARCHIVED"], // ACTIVE = relisting after tenant leaves
  SOLD: ["ARCHIVED"],
  EXPIRED: ["ACTIVE", "ARCHIVED"],
  DRAFT: ["ACTIVE", "ARCHIVED"],
};

export const updateListingStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!req.agency?.id) return next(new AuthError("No agency selected."));
    if (!newStatus) return next(new ValidationError("New status is required."));

    const listing = await prisma.listings.findUnique({
      where: { id },
      include: {
        unit: { select: { property: { select: { agencyId: true } } } },
      },
    });
    if (!listing) return next(new NotFoundError("Listing not found."));
    if (listing.unit.property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to modify this listing."));
    }

    const allowed = allowedTransitions[listing.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return next(
        new ValidationError(
          `Cannot transition listing from ${listing.status} to ${newStatus}.`,
        ),
      );
    }

    const updated = await prisma.listings.update({
      where: { id },
      data: {
        status: newStatus,
        ...(newStatus === "ACTIVE" &&
          !listing.publishedAt && { publishedAt: new Date() }),
        ...(newStatus === "EXPIRED" && { expiredAt: new Date() }),
      },
    });

    res.status(200).json({ success: true, listing: updated });
  } catch (error) {
    next(error);
  }
};

// ── RELIST (create a fresh listing on the same unit) ─────────────────────
// For when a tenant leaves and the same physical unit goes back on the
// market — a NEW listings row, not a status flip on the old one, so lease
// history stays tied to the listing it actually happened under.
export const relistUnit = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId } = req.params;
    const { purpose, availability, availableFrom, pricing } = req.body;

    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const unit = await prisma.propertyUnits.findUnique({
      where: { id: unitId },
      include: { property: { select: { agencyId: true } } },
    });
    if (!unit) return next(new NotFoundError("Unit not found."));
    if (unit.property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to relist this unit."));
    }
    if (!pricing?.basePrice) {
      return next(new ValidationError("Base price is required to relist."));
    }

    // Archive any still-open listing on this unit first (shouldn't
    // normally exist, but guards against double-listing the same space)
    await prisma.listings.updateMany({
      where: { unitId, status: { in: ["ACTIVE", "PENDING"] } },
      data: { status: "ARCHIVED" },
    });

    const listing = await prisma.listings.create({
      data: {
        unitId,
        slug: `${unitId}-${Date.now()}`, // replace with generatePropertySlug in production
        purpose,
        availability,
        availableFrom,
        status: "ACTIVE",
        publishedAt: new Date(),
        pricing: { create: pricing },
      },
    });

    res.status(201).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// ── DELETE / SOFT-DELETE A LISTING'S PROPERTY ────────────────────────────
// Deletes the whole asset (matches your existing soft-delete cron
// pattern) — archives all listings under it first.
export const softDeleteProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;

    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
    });
    if (!property) return next(new NotFoundError("Property not found."));
    if (property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to delete this property."));
    }

    await prisma.$transaction(async (tx) => {
      await tx.listings.updateMany({
        where: {
          unit: { propertyId },
          status: { in: ["ACTIVE", "PENDING", "DRAFT"] },
        },
        data: { status: "ARCHIVED" },
      });

      await tx.properties.update({
        where: { id: propertyId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    });

    res
      .status(200)
      .json({ success: true, message: "Property scheduled for deletion." });
  } catch (error) {
    next(error);
  }
};

// recent listings
export const getRecentListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt((req.query.limit as string) || "10");
    const cacheKey = `recent:listings:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const listings = await prisma.listings.findMany({
      where: {
        status: "ACTIVE",
        unit: { property: { isDeleted: false } },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        pricing: true,
        unit: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                state: true,
                agency: { select: { id: true, name: true } },
                agent: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    const result = {
      count: listings.length,
      listings,
    };

    // Cache for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ── AGENCY: filtered/searchable listings dashboard ────────────────────────
export const getAgencyFilteredListings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      priceRange = "0,100000000",
      categories = "",
      types = "",
      availability = "",
      leaseTerms = "",
      page = "1",
      limit = "12",
      states = "",
      cities = "",
      bedrooms = "",
      bathrooms = "",
      furnishing = "",
      purpose = "",
    } = req.query;

    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const [minPrice, maxPrice] = String(priceRange)
      .split(",")
      .map((n) => Number(n.trim()));

    const skip = (parsedPage - 1) * parsedLimit;

    // 🧾 listing-level filters
    const listingFilters: any = {
      status: { not: "ARCHIVED" }, // agency dashboard shows drafts too, just not archived
    };
    if (availability)
      listingFilters.availability = { in: String(availability).split(",") };
    if (purpose) listingFilters.purpose = { in: String(purpose).split(",") }; // ListingPurpose: RENT/SALE/LEASE/SHORT_LET

    // 🏢 unit-level filters (type, category, furnishing) + reach up to property (agency/city/state)
    const unitFilters: any = {
      property: {
        agencyId: req.agency.id,
        isDeleted: false,
      },
    };
    if (categories)
      unitFilters.category = { in: String(categories).split(",") }; // PropertyCategory
    if (types) unitFilters.type = { in: String(types).split(",") };
    if (furnishing)
      unitFilters.furnishing = { in: String(furnishing).split(",") };
    if (states) unitFilters.property.state = { in: String(states).split(",") };
    if (cities) unitFilters.property.city = { in: String(cities).split(",") };

    if (search) {
      unitFilters.property.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // 🏗️ structure filters (bedrooms/bathrooms) — nested under unit
    const structureFilters: any = {};
    if (bedrooms) structureFilters.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) structureFilters.bathrooms = { gte: Number(bathrooms) };
    if (Object.keys(structureFilters).length) {
      unitFilters.structure = { is: structureFilters };
    }

    // 💰 pricing filters — 1:1 with listing now, not property
    const pricingFilters: any = {
      basePrice: { gte: minPrice, lte: maxPrice },
    };
    if (leaseTerms)
      pricingFilters.leaseTerm = { in: String(leaseTerms).split(",") };

    const where = {
      ...listingFilters,
      unit: { is: unitFilters },
      pricing: { is: pricingFilters },
    };

    // 🔄 sort — price sorts through the pricing relation, everything else
    // sorts directly on the listing (createdAt, publishedAt, views, etc.)
    const orderBy: any =
      sortBy === "price"
        ? { pricing: { basePrice: sortOrder as "asc" | "desc" } }
        : { [sortBy]: sortOrder };

    const cacheKey = `agency:listings:${req.agency.id}:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const [listings, total] = await Promise.all([
      prisma.listings.findMany({
        where,
        include: {
          pricing: true,
          unit: {
            include: {
              structure: true,
              images: true,
              floorPlans: true,
              property: {
                select: { title: true, city: true, state: true, address: true },
              },
            },
          },
        },
        skip,
        take: parsedLimit,
        orderBy,
      }),
      prisma.listings.count({ where }),
    ]);

    const result = {
      success: true,
      listings,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
// slug validator
export const slugValidator = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { slug } = req.body;
    if (!slug || typeof slug !== "string") {
      return next(
        new ValidationError("Slug is required and must be a string."),
      );
    }

    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    let uniqueSlug = slug;
    let counter = 1;

    while (
      await prisma.listings.findUnique({
        where: { slug: uniqueSlug },
      })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return res.status(200).json({
      available: uniqueSlug === slug,
      slug: uniqueSlug,
    });
  } catch (error) {
    return next(error);
  }
};

// get listing analytics
export const getPropertyAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const analytics = await prisma.propertyAnalytics.findUnique({
      where: {
        listingId: req.params.listingId,
      },
    });
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return next(error);
  }
};
