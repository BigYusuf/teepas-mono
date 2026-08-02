import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import { imagekit } from "../../libs/imagekit";
import prisma from "../../libs/prisma";
import {
  deductCreditsDynamic,
  refundCredits,
} from "../../middleware/creditDeduction";
import { NextFunction, Request, Response } from "express";

export const getAllAmenities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [amenities, totalAmenities] = await Promise.all([
      prisma.amenities.findMany({
        skip,
        take: limit,
        orderBy: { category: "asc" },
      }),
      prisma.amenities.count(),
    ]);

    res.status(200).json({
      success: true,
      data: amenities,
      meta: {
        totalAmenities,
        currentPage: page,
        totalPages: Math.ceil(totalAmenities / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(404).json({ message: "Categories not found" });
    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// ── IMAGES (unit-scoped) ──────────────────────────────────────────────────
export const uploadPropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `property-${Date.now()}.jpg`,
      folder: "/properties",
    });
    res.status(201).json({
      file_url: response.url,
      url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);
    await prisma.propertyImages.deleteMany({ where: { fileId } });
    res.status(201).json({ success: true, response });
  } catch (error) {
    next(error);
  }
};

export const markPropertyImageAsCover = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId, fileId } = req.body;
    if (!unitId || !fileId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing unitId or fileId" });
    }

    await prisma.propertyImages.updateMany({
      where: { unitId },
      data: { isCover: false },
    });
    const updated = await prisma.propertyImages.updateMany({
      where: { fileId },
      data: { isCover: true },
    });

    res.status(200).json({
      success: true,
      message: "Cover image updated successfully",
      updated,
    });
  } catch (error) {
    next(error);
  }
};

export const addPropertyImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId, url, fileId } = req.body;
    if (!unitId) return next(new ValidationError("unitId is required"));

    const image = await prisma.propertyImages.create({
      data: { fileId, url, unitId },
    });
    res.status(201).json({ success: true, image });
  } catch (err) {
    next(err);
  }
};

// ── FLOOR PLANS (unit-scoped) ────────────────────────────────────────────
export const uploadFloorPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const uploadResponse = await imagekit.upload({
      file,
      fileName: `floorplan-${Date.now()}`,
      folder: "/floorplans",
    });
    res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      type: uploadResponse.fileType,
    });
  } catch (err) {
    next(err);
  }
};

export const addFloorPlan = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId, name, description, fileId, imageUrl, layout } = req.body;
    if (!unitId || !imageUrl)
      throw new ValidationError("Missing unitId or imageUrl");

    const floorPlan = await prisma.floorPlan.create({
      data: { unitId, fileId, name, description, imageUrl, layout },
    });
    res.status(201).json({ success: true, floorPlan });
  } catch (err) {
    next(err);
  }
};

export const updateFloorPlan = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, fileId, layout } = req.body;
    const floorPlan = await prisma.floorPlan.update({
      where: { id },
      data: { name, description, imageUrl, fileId, layout },
    });
    res.status(200).json({ success: true, floorPlan });
  } catch (err) {
    next(err);
  }
};

export const deleteFloorPlan = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await prisma.floorPlan.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Floor plan deleted" });
  } catch (err) {
    next(err);
  }
};

// ── DOCUMENTS (property/asset-scoped — unchanged) ────────────────────────
export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const uploadResponse = await imagekit.upload({
      file,
      fileName: `document-${Date.now()}`,
      folder: "/propertyDocuments",
    });
    res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      type: uploadResponse.fileType,
    });
  } catch (err) {
    next(err);
  }
};

export const addPropertyDocument = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, name, type, url, fileId } = req.body;
    if (!propertyId || !url || !type)
      throw new ValidationError("Missing required fields");

    const document = await prisma.propertyDocuments.create({
      data: {
        propertyId,
        name,
        type,
        url,
        uploadedById: req?.agent?.id,
        fileId,
      },
    });
    res.status(201).json({ success: true, document });
  } catch (err) {
    next(err);
  }
};

export const updatePropertyDocument = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, url, verified } = req.body;
    const document = await prisma.propertyDocuments.update({
      where: { id },
      data: { name, url, verified },
    });
    res.status(200).json({ success: true, document });
  } catch (err: any) {
    next(err);
  }
};

export const deletePropertyDocument = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await prisma.propertyDocuments.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Document deleted" });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE (asset-level fields only) ─────────────────────────────────────
// Explicit allowlist — properties no longer owns pricing/structure/status,
// so an unfiltered req.body spread would silently accept stale frontend
// payloads for fields that don't exist here anymore.
const ASSET_LEVEL_FIELDS = [
  "title",
  "description",
  "address",
  "city",
  "state",
  "country",
  "latitude",
  "longitude",
  "tags",
] as const;

export const updateProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const property = await prisma.properties.findUnique({ where: { id } });
    if (!property) return next(new ValidationError("Property not found"));
    if (property.agentId !== req.agent.id) {
      return next(new AuthError("You can only update your own properties"));
    }

    const data = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        ASSET_LEVEL_FIELDS.includes(key as any),
      ),
    );

    const updated = await prisma.properties.update({
      where: { id },
      data,
      include: { units: { include: { images: true } } },
    });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE / RESTORE ──────────────────────────────────────────────────────
export const deleteProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const agencyId = req?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true, isDeleted: true },
    });
    if (!property) return next(new ValidationError("Property not found"));
    if (property.agencyId !== agencyId)
      return next(new ValidationError("Unauthorized action"));
    if (property.isDeleted)
      return next(new ValidationError("Property is already deleted"));

    // Archive any live listings under this property before soft-deleting
    // the asset itself, so search/detail views don't surface orphaned
    // listings whose parent property is gone.
    const deletedProperty = await prisma.$transaction(async (tx) => {
      await tx.listings.updateMany({
        where: {
          unit: { propertyId },
          status: { in: ["ACTIVE", "PENDING", "DRAFT"] },
        },
        data: { status: "ARCHIVED" },
      });

      return tx.properties.update({
        where: { id: propertyId },
        data: {
          isDeleted: true,
          deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    });

    return res.status(200).json({
      message:
        "Property is scheduled for deletion in 24 hours. You can restore it within this period.",
      deletedAt: deletedProperty.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const permanentDeleteProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const agencyId = req?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true },
    });
    if (!property) return next(new ValidationError("Property not found"));
    if (property.agencyId !== agencyId)
      return next(new ValidationError("Unauthorized action"));

    await prisma.properties.delete({ where: { id: propertyId } });
    return res
      .status(200)
      .json({ message: "Property has been permanently deleted." });
  } catch (error) {
    return next(error);
  }
};

export const restoreProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const agencyId = req?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true, isDeleted: true },
    });
    if (!property) return next(new ValidationError("Property not found"));
    if (property.agencyId !== agencyId)
      return next(new ValidationError("Unauthorized action"));
    if (!property.isDeleted) {
      return res
        .status(400)
        .json({ message: "Property is not in deleted state" });
    }

    await prisma.properties.update({
      where: { id: propertyId },
      data: { isDeleted: false, deletedAt: null },
    });
    return res.status(200).json({ message: "Property successfully restored!" });
  } catch (error) {
    return res.status(500).json({ message: "Error restoring property", error });
  }
};

// controllers/propertyUnit.controller.ts

// ── ADD UNIT ────────────────────────────────────────────────────────────
// Adds a new unit to an existing property (e.g. agency later adds "Shop 7"
// to a mall that already has 6 shops). Doesn't create a listing — that's
// a separate step (draft flow or a direct listing create), since a unit
// can exist without being actively offered yet.
export const addUnit = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true, isMultiUnit: true },
    });
    if (!property) return next(new NotFoundError("Property not found."));
    if (property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to modify this property."));
    }
    if (!property.isMultiUnit) {
      return next(
        new ValidationError(
          "This property is not marked as multi-unit. Set isMultiUnit=true before adding units.",
        ),
      );
    }

    const {
      unitLabel,
      category,
      type,
      designType,
      purpose,
      economicClass,
      furnishing,
      condition,
      sizeSqm,
      landSizeSqm,
      yearBuilt,
      electricity,
      electricBilling,
      waterSupply,
      cooling,
      heating,
      construction,
      floorType,
      roofType,
      wallFinish,
      ceilingType,
      buildingMaterial,
      customSpecifications,
      customFeatures,
      structure, // { bedrooms, bathrooms, toilets, ... }
      amenityIds, // string[]
    } = req.body;

    if (!unitLabel) {
      return next(
        new ValidationError(
          "unitLabel is required for units in a multi-unit property.",
        ),
      );
    }

    // Prevent duplicate labels within the same property (e.g. two "Shop 3"s)
    const existingLabel = await prisma.propertyUnits.findFirst({
      where: { propertyId, unitLabel },
    });
    if (existingLabel) {
      return next(
        new ValidationError(
          `A unit labeled "${unitLabel}" already exists on this property.`,
        ),
      );
    }

    const unit = await prisma.propertyUnits.create({
      data: {
        property: { connect: { id: propertyId } },
        unitLabel,
        category,
        type,
        designType,
        purpose,
        economicClass,
        furnishing,
        condition,
        sizeSqm,
        landSizeSqm,
        yearBuilt,
        electricity,
        electricBilling,
        waterSupply,
        cooling,
        heating,
        construction,
        floorType,
        roofType,
        wallFinish,
        ceilingType,
        buildingMaterial,
        customSpecifications,
        customFeatures,
        structure: structure ? { create: structure } : undefined,
        amenities: amenityIds?.length
          ? { create: amenityIds.map((amenityId: string) => ({ amenityId })) }
          : undefined,
      },
      include: { structure: true, amenities: { include: { amenity: true } } },
    });

    res.status(201).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

// ── EDIT UNIT ────────────────────────────────────────────────────────────
export const editUnit = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { unitId } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const unit = await prisma.propertyUnits.findUnique({
      where: { id: unitId },
      include: { property: { select: { agencyId: true } }, structure: true },
    });
    if (!unit) return next(new NotFoundError("Unit not found."));
    if (unit.property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to modify this unit."));
    }

    const {
      unitLabel,
      category,
      type,
      designType,
      purpose,
      economicClass,
      furnishing,
      condition,
      sizeSqm,
      landSizeSqm,
      yearBuilt,
      electricity,
      electricBilling,
      waterSupply,
      cooling,
      heating,
      construction,
      floorType,
      roofType,
      wallFinish,
      ceilingType,
      buildingMaterial,
      customSpecifications,
      customFeatures,
      structure,
      amenityIds,
    } = req.body;

    if (unitLabel && unitLabel !== unit.unitLabel) {
      const duplicate = await prisma.propertyUnits.findFirst({
        where: { propertyId: unit.propertyId, unitLabel, id: { not: unitId } },
      });
      if (duplicate) {
        return next(
          new ValidationError(
            `A unit labeled "${unitLabel}" already exists on this property.`,
          ),
        );
      }
    }

    const cleanedData = Object.fromEntries(
      Object.entries({
        unitLabel,
        category,
        type,
        designType,
        purpose,
        economicClass,
        furnishing,
        condition,
        sizeSqm,
        landSizeSqm,
        yearBuilt,
        electricity,
        electricBilling,
        waterSupply,
        cooling,
        heating,
        construction,
        floorType,
        roofType,
        wallFinish,
        ceilingType,
        buildingMaterial,
        customSpecifications,
        customFeatures,
      }).filter(([, v]) => v !== undefined),
    );

    // Structure: update if it exists, create + link if it doesn't yet
    if (structure) {
      if (unit.structureId) {
        await prisma.propertyStructure.update({
          where: { id: unit.structureId },
          data: structure,
        });
      } else {
        const created = await prisma.propertyStructure.create({
          data: structure,
        });
        cleanedData.structureId = created.id;
      }
    }

    // Amenities: full replace if provided (simplest correct behavior —
    // avoids partial-diff bugs when the frontend sends the complete list)
    if (amenityIds) {
      await prisma.propertyUnitAmenities.deleteMany({ where: { unitId } });
      if (amenityIds.length) {
        await prisma.propertyUnitAmenities.createMany({
          data: amenityIds.map((amenityId: string) => ({ unitId, amenityId })),
        });
      }
    }

    const updated = await prisma.propertyUnits.update({
      where: { id: unitId },
      data: cleanedData,
      include: {
        structure: true,
        amenities: { include: { amenity: true } },
        images: true,
      },
    });

    res.status(200).json({ success: true, unit: updated });
  } catch (error) {
    next(error);
  }
};

// ── DELETE UNIT ───────────────────────────────────────────────────────────
// Hard-blocks deletion if there's an active lease or a live listing —
// deleting a unit someone is currently renting would orphan real
// contractual data. Archives listings first if none are blocking.
export const deleteUnit = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId } = req.params;
    if (!req.agency?.id) return next(new AuthError("No agency selected."));

    const unit = await prisma.propertyUnits.findUnique({
      where: { id: unitId },
      include: {
        property: { select: { agencyId: true } },
        listings: {
          where: { status: { in: ["ACTIVE", "PENDING", "RENTED", "SOLD"] } },
          include: {
            leases: {
              where: { status: { in: ["ACTIVE", "PENDING_SIGNATURE"] } },
            },
          },
        },
      },
    });
    if (!unit) return next(new NotFoundError("Unit not found."));
    if (unit.property.agencyId !== req.agency.id) {
      return next(new AuthError("Not authorized to delete this unit."));
    }

    const hasActiveLease = unit.listings.some((l) => l.leases.length > 0);
    if (hasActiveLease) {
      return next(
        new ValidationError(
          "Cannot delete a unit with an active or pending lease. Terminate the lease first.",
        ),
      );
    }

    const hasBlockingListing = unit.listings.some((l) =>
      ["ACTIVE", "PENDING", "RENTED", "SOLD"].includes(l.status),
    );
    if (hasBlockingListing) {
      return next(
        new ValidationError(
          "Cannot delete a unit with a live, rented, or sold listing. Archive the listing first.",
        ),
      );
    }

    // Safe to delete — cascade cleanup of dependent rows Prisma won't
    // auto-cascade (adjust based on your actual onDelete settings)
    await prisma.$transaction(async (tx) => {
      await tx.listings.deleteMany({ where: { unitId } }); // only DRAFT/EXPIRED/ARCHIVED left at this point
      await tx.propertyImages.deleteMany({ where: { unitId } });
      await tx.propertyVideo.deleteMany({ where: { unitId } });
      await tx.floorPlan.deleteMany({ where: { unitId } });
      await tx.propertyUnitAmenities.deleteMany({ where: { unitId } });

      const target = await tx.propertyUnits.findUnique({
        where: { id: unitId },
      });
      await tx.propertyUnits.delete({ where: { id: unitId } });

      if (target?.structureId) {
        await tx.propertyStructure
          .delete({ where: { id: target.structureId } })
          .catch(() => {
            // structure might be referenced elsewhere or already gone — non-fatal
          });
      }
    });

    res
      .status(200)
      .json({ success: true, message: "Unit deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE UNIT (with its listing history) ─────────────────────────────
export const getUnitById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { unitId } = req.params;

    const unit = await prisma.propertyUnits.findUnique({
      where: { id: unitId },
      include: {
        structure: true,
        images: true,
        videos: true,
        floorPlans: true,
        amenities: { include: { amenity: true } },
        property: {
          select: { title: true, address: true, city: true, agencyId: true },
        },
        listings: {
          orderBy: { createdAt: "desc" },
          include: { pricing: true },
        },
      },
    });
    if (!unit) return next(new NotFoundError("Unit not found."));

    res.status(200).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};
