import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import { imagekit } from "../../libs/imagekit";
import prisma from "../../libs/prisma";
import {
  deductCreditsDynamic,
  refundCredits,
} from "../../middleware/creditDeduction";
import { NextFunction, Request, Response } from "express";
// import { notifyPropertyCreated } from "../services/notification";
import slugify from "slugify";
import multer from "multer";
import redis from "../../libs/redis";
import { generatePropertySlug } from "../../utils/generateSlug";

// get property categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Create discount codes
export const createPromotions = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.promotions.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available plesae use a different code!",
        ),
      );
    }

    const discount_code = await prisma.promotions.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        agentId: req.agent.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

// get discount codes
export const getPromotions = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const promotions = await prisma.promotions.findMany({
      where: {
        agentId: req.agent.id,
      },
    });

    res.status(201).json({
      success: true,
      promotions,
    });
  } catch (error) {
    return next(error);
  }
};

// delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const agentId = req.agent?.id;

    const discountCode = await prisma.promotions.findUnique({
      where: { id },
      select: { id: true, agentId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.agentId !== agentId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    await prisma.promotions.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: "Discount code successfully deleted" });
  } catch (error) {
    next(error);
  }
};

// upload property image
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

// delete property image
export const deletePropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);
    await prisma.propertyImages.deleteMany({
      where: { fileId },
    });

    res.status(201).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};
// mark property image as cover
export const markPropertyImageAsCover = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, fileId } = req.body;

    if (!propertyId || !fileId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing propertyId or fileId" });
    }

    // Reset all other images for this property
    await prisma.propertyImages.updateMany({
      where: { propertyId },
      data: { isCover: false },
    });

    // Mark selected one as cover
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
    const { propertyId, url, fileId } = req.body;

    // Create new image and link it to property
    const image = await prisma.propertyImages.create({
      data: {
        fileId,
        url,
        propertyId,
      },
    });

    res.status(201).json({ success: true, image });
  } catch (err) {
    next(err);
  }
};

// 🔹 helper for tags
const parseTags = (tags: any) =>
  Array.isArray(tags)
    ? tags
    : tags?.split(",")?.map((t: string) => t.trim()) || [];

// 🔹 helper for cleaning empty values
const cleanBody = (body: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(body).filter(([_, value]) => {
      if (value === "" || value === null || value === undefined) return false;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        !Object.keys(value).length
      )
        return false;
      return true;
    }),
  );
};

// CREATE OR UPDATE DRAFT
// export const createProperty = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       title,
//       description,
//       slug,
//       bedrooms,
//       bathrooms,
//       category,
//       address,
//       promotions,
//       price,
//       type,
//       tags,
//       customSpecifications,
//       customFeatures = {},
//       images = [],
//       status = "ACTIVE",
//     } = req.body;

//     if (!req.agent?.id) {
//       return next(new AuthError("Only agents can create properties!"));
//     }

//     // 🧹 Clean up empty fields
//     const cleanedData: any = cleanBody(req.body);

//     // 🟡 Handle DRAFT save or update
//     if (status === "DRAFT") {
//       const existingDraft = await prisma.properties.findFirst({
//         where: { agentId: req.agent.id, status: "DRAFT" },
//       });

//       const draftData = {
//         title,
//         description,
//         category,
//         type,
//         slug,
//         address,
//         bedrooms: bedrooms ? parseInt(bedrooms) : null,
//         bathrooms: bathrooms ? parseInt(bathrooms) : null,
//         price: price ? parseFloat(price) : null,
//         promotions,
//         tags: parseTags(tags),
//         customFeatures,
//         customSpecifications,
//       };

//       if (existingDraft) {
//         const updatedDraft = await prisma.properties.update({
//           where: { id: existingDraft.id },
//           data: draftData,
//         });

//         return res.status(200).json({
//           success: true,
//           status: "DRAFT",
//           message: "Draft updated successfully",
//           property: updatedDraft,
//         });
//       }

//       const newDraft = await prisma.properties.create({
//         data: {
//           ...draftData,
//           agentId: req.agent.id,
//           agencyId: req.agent.agency?.id,
//           status: "DRAFT",
//         },
//       });

//       return res.status(201).json({
//         success: true,
//         status: "DRAFT",
//         message: "Draft created successfully",
//         property: newDraft,
//       });
//     }

//     // 🟢 Handle ACTIVE creation or publishing
//     if (status === "ACTIVE") {
//       if (
//         !title ||
//         !slug ||
//         !description ||
//         !category ||
//         !type ||
//         !tags ||
//         !price ||
//         !images ||
//         !bathrooms ||
//         !bedrooms ||
//         !address
//       ) {
//         return next(new ValidationError("Missing required fields"));
//       }

//       // 🧩 Check for duplicate slug among ACTIVE listings
//       const slugExists = await prisma.properties.findFirst({
//         where: { slug, status: "ACTIVE", NOT: { agentId: req.agent.id } },
//       });

//       if (slugExists) {
//         return next(
//           new ValidationError(
//             "Slug already exists! Please use a different one."
//           )
//         );
//       }

//       // 🔹 Check if the user already has a draft with the same slug
//       const existingDraft = await prisma.properties.findFirst({
//         where: { slug, agentId: req.agent.id, status: "DRAFT" },
//       });

//       // 🟣 Detect if draft images are raw (base64) or already uploaded URLs
//       const hasRawImages =
//         Array.isArray(images) &&
//         images.some(
//           (img) =>
//             typeof img === "object" &&
//             img !== null &&
//             (img.base64 || img.file === null)
//         );

//       // 🖼 Handle images conditionally
//       let uploadedImages: any[] = [];

//       if (hasRawImages) {
//         uploadedImages = await Promise.all(
//           images.map(async (img: any, index: number) => {
//             try {
//               if (!img?.base64) return null;
//               const uploadResponse = await imagekit.upload({
//                 file: img.base64,
//                 fileName: `property-${Date.now()}-${index}.jpg`,
//                 folder: "/properties",
//               });
//               return {
//                 fileId: uploadResponse.fileId,
//                 url: uploadResponse.url,
//               };
//             } catch (e) {
//               console.error("Failed to upload image:", e);
//               return null;
//             }
//           })
//         );
//       } else {
//         uploadedImages = images.map((url: any) => {
//           if (typeof url === "string" && url.includes("ik.imagekit.io")) {
//             return { url, fileId: null };
//           }
//           if (url?.url) return { url: url.url, fileId: url.fileId || null };
//           return null;
//         });
//       }

//       // 🟢 If publishing existing draft
//       if (existingDraft) {
//         const published = await prisma.properties.update({
//           where: { id: existingDraft.id },
//           data: {
//             ...cleanedData,
//             status: "ACTIVE",
//             tags: parseTags(tags),
//             bedrooms: bedrooms ? parseInt(bedrooms) : existingDraft.bedrooms,
//             bathrooms: bathrooms
//               ? parseInt(bathrooms)
//               : existingDraft.bathrooms,
//             price: price ? parseFloat(price) : existingDraft.price,
//             floorPlans: cleanedData.floorPlans?.length
//               ? { create: cleanedData.floorPlans }
//               : {},
//             images:
//               uploadedImages?.length > 0
//                 ? { create: uploadedImages.filter(Boolean) }
//                 : undefined,
//           },
//           include: { images: true },
//         });

//         return res.status(200).json({
//           success: true,
//           status: "ACTIVE",
//           message: "Draft published successfully",
//           property: published,
//         });
//       }

//       // 🧩 Create a new ACTIVE property
//       const newProperty = await prisma.properties.create({
//         data: {
//           ...cleanedData,
//           agentId: req.agent.id,
//           agencyId: req.agent.agency?.id,
//           tags: parseTags(tags),
//           bedrooms: bedrooms ? parseInt(bedrooms) : null,
//           bathrooms: bathrooms ? parseInt(bathrooms) : null,
//           price: price ? parseFloat(price) : null,
//           customFeatures,
//           customSpecifications,
//           images:
//             uploadedImages?.length > 0
//               ? { create: uploadedImages.filter(Boolean) }
//               : undefined,
//           floorPlans: cleanedData.floorPlans?.length
//             ? { create: cleanedData.floorPlans }
//             : {},
//           status: "ACTIVE",
//         },
//         include: { images: true },
//       });
//       const followers = req.agent?.agency?.followers;
//       // Fetch agency followers (example, adjust to your schema)
//       // const followers = await prisma.followers.findMany({
//       //   where: { agencyId: newProperty.agencyId },
//       //   include: { user: true },
//       // });
//       const followerUsers = followers.map((f: any) => f.user);

//       // Send notifications asynchronously (non-blocking)
//       notifyPropertyCreated(newProperty as any, followerUsers, req.agent).catch(
//         (err) => console.error("Notification error:", err)
//       );

//       return res.status(201).json({
//         success: true,
//         status: "ACTIVE",
//         message: "Property created successfully",
//         property: newProperty,
//       });
//     }

//     return res.status(400).json({ error: "Invalid status" });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

// STEP 1: Basic Info
export const propertyBasicInfo = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.agent?.id) {
      return next(new AuthError("Only agents can create properties!"));
    }

    const {
      id,
      title,
      description,
      category,
      type,
      designType,
      purpose,
      economicClass,
      tags,
      furnishing,
      condition,
      availability,
      availableFrom,
      amenities,
    } = req.body;

    const tempSlug = slugify(`draft-${Date.now()}`, { lower: true });

    const cleanedData: any = cleanBody({
      title,
      description,
      slug: tempSlug,
      category,
      type,
      designType,
      purpose,
      economicClass,
      tags: parseTags(tags),
      furnishing,
      condition,
      amenities,
      availability,
      availableFrom,
    });

    let property;
    if (id) {
      property = await prisma.properties.update({
        where: { id },
        data: {
          ...cleanedData,
          status: "DRAFT",
          progressStep: 1,
        },
      });
    } else {
      property = await prisma.properties.create({
        data: {
          ...cleanedData,
          agentId: req.agent.id,
          agencyId: req.agent.agency?.id,
          status: "DRAFT",
          progressStep: 1,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Step 1: Basic info saved successfully",
      nextStep: 2,
      property,
    });
  } catch (error) {
    next(error);
  }
};

// STEP 2: Location & Structure
export const propertyLocationStructure = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // property id
    if (!id) return next(new ValidationError("Missing property ID"));

    const {
      // location data
      address,
      city,
      state,
      country,
      coordinates,
      nearByLocation,
      // structure data
      bedrooms,
      bathrooms,
      toilets,
      livingRooms,
      kitchens,
      kitchenType,
      toiletLocation,
      isWholeBuilding,
      isServiced,
      floorLevel,
      hasBalcony,
      petPolicy,
      petDetails,
    } = req.body;

    // 🧩 Check property
    const property = await prisma.properties.findUnique({
      where: { id, agentId: req.agent.id },
      include: { structure: true },
    });
    if (!property) return next(new NotFoundError("Draft property not found"));

    // 🧱 Handle structure: create or update
    let structure;
    if (property.structureId && property.structure) {
      structure = await prisma.propertyStructure.update({
        where: { id: property.structureId },
        data: cleanBody({
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          toilets: parseInt(toilets),
          livingRooms: parseInt(livingRooms),
          kitchens: parseInt(kitchens),
          kitchenType,
          toiletLocation,
          isWholeBuilding,
          isServiced,
          floorLevel: parseInt(floorLevel),
          hasBalcony,
          petPolicy,
          petDetails,
        }),
      });
    } else {
      structure = await prisma.propertyStructure.create({
        data: cleanBody({
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          toilets: parseInt(toilets),
          livingRooms: parseInt(livingRooms),
          kitchens: parseInt(kitchens),
          kitchenType,
          toiletLocation,
          isWholeBuilding,
          isServiced,
          floorLevel: parseInt(floorLevel),
          hasBalcony,
          petPolicy,
          petDetails,
        }),
      });

      // link new structure to property
      await prisma.properties.update({
        where: { id },
        data: { structureId: structure.id },
      });
    }

    // 📍 Update property location + progress
    const updatedProperty = await prisma.properties.update({
      where: { id },
      data: {
        address,
        city,
        state,
        country,
        nearByLocation,
        coordinates,
        progressStep: 2,
        status: "DRAFT",
      },
      include: { structure: true },
    });

    res.status(200).json({
      success: true,
      message: "Step 2: Location & structure updated successfully",
      nextStep: 3,
      property: updatedProperty,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// STEP 3: Pricing & Payment
export const updatePropertyPricing = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) return next(new ValidationError("Missing property ID"));
    const {
      basePrice,
      cautionFee,
      agentFee,
      legalFee,
      serviceCharge,
      paymentFrequency,
      paymentType,
      negotiable,
      leaseTerm,
      currency,
    } = req.body;

    if (!basePrice) return next(new ValidationError("Base Price is missing"));

    const cleanedData: any = cleanBody({
      propertyId: id,
      basePrice: parseFloat(basePrice),
      paymentType,
      cautionFee: parseFloat(cautionFee),
      agentFee: parseFloat(agentFee),
      legalFee: parseFloat(legalFee),
      serviceCharge: parseFloat(serviceCharge),
      paymentFrequency,
      leaseTerm,
      currency,
      negotiable,
    });

    const property = await prisma.properties.findUnique({ where: { id } });

    if (!property) return next(new ValidationError("Property not found"));

    // If pricing exists, update it; else, create new
    // Ensure required fields for creation (basePrice) and use propertyId directly
    const basePriceValue =
      cleanedData.basePrice !== undefined && cleanedData.basePrice !== null
        ? Number(cleanedData.basePrice)
        : (cleanedData.basePrice ?? 0);

    const pricing = await prisma.propertyPricing.upsert({
      where: { propertyId: id },
      update: cleanedData,
      create: {
        ...cleanedData,
        basePrice: basePriceValue,
        propertyId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Pricing details saved successfully",
      pricing,
      nextStep: 4,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// STEP 4: Features & Utilities
export const propertyFeaturesUtililities = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) return next(new ValidationError("Missing property ID"));

    const {
      yearBuilt,
      cooling,
      waterSupply,
      heating,
      electricity,
      electricBilling,
      buildingMaterial,
      wallFinish,
      floorType,
      roofType,
      sizeSqm,
      landSizeSqm,
      customSpecifications,
      customFeatures = {},
    } = req.body;

    const cleanedData: any = cleanBody({
      yearBuilt: parseInt(yearBuilt),
      waterSupply,
      heating,
      cooling,
      electricity,
      electricBilling,
      wallFinish,
      buildingMaterial,
      floorType,
      roofType,
      sizeSqm: parseFloat(sizeSqm),
      landSizeSqm: parseFloat(landSizeSqm),

      customFeatures,
      customSpecifications,
    });

    const property = await prisma.properties.update({
      where: { id },
      data: cleanedData,
    });

    res.status(200).json({
      success: true,
      message: "Features updated successfully",
      property,
      nextStep: 5,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// STEP 5: Media & Attachments (lightweight version)
export const updatePropertyMedia = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { video_url } = req.body;

    if (!id) return next(new ValidationError("Missing property ID"));

    const property = await prisma.properties.update({
      where: { id },
      data: {
        ...(video_url && { video_url }),
      },
      include: {
        images: true,
        floorPlans: true,
        documents: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Property media info updated",
      property,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// controllers/property.ts
export const publishProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) return next(new ValidationError("Missing property ID"));

    const property = await prisma.properties.findUnique({
      where: { id },
      include: { pricing: true, structure: true },
    });
    if (!property) return next(new ValidationError("Property not found"));

    const updatedProperty = await prisma.properties.update({
      where: { id },
      data: {
        status: "ACTIVE",
        isPublished: true,
        slug: generatePropertySlug({
          bedrooms: property?.structure?.bedrooms,
          price: property?.pricing?.basePrice,
          city: property?.city,
          title: property.title,
          type: property.type,
        }),
        progressStep: 0,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, property: updatedProperty });
  } catch (err) {
    next(err);
  }
};

//upload floor plan
// export const uploadFloorPlan = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { base64file, propertyId, name, description } = req.body;

//     if (!base64file) throw new ValidationError("No file provided.");
//     if (!propertyId) throw new ValidationError("Missing propertyId.");

//     // Determine file type from base64 header
//     const isPDF = base64file.startsWith("data:application/pdf");
//     const fileName = isPDF
//       ? `floorplan-${Date.now()}.pdf`
//       : `floorplan-${Date.now()}.jpg`;

//     // Upload to ImageKit
//     const uploaded = await imagekit.upload({
//       file: base64file,
//       fileName,
//       folder: "/floorplans",
//     });

//     // Save to Prisma
//     const floorPlan = await prisma.floorPlan.create({
//       data: {
//         propertyId,
//         name,
//         description,
//         imageUrl: uploaded.url,
//         fileId: uploaded.fileId,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       floorPlan,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const upload = multer();

// export const uploadFloorPlan = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const fileExt = file.originalname.split(".").pop();
//     const fileName = `floorplan-${Date.now()}.${fileExt}`;

//     const uploadResponse: any = await imagekit.upload({
//       file: file.buffer.toString("base64"),
//       fileName,
//       folder: "/floorplans",
//     });

//     res.status(200).json({
//       url: uploadResponse?.url,
//       fileId: uploadResponse?.fileId || uploadResponse?.file_id,
//       fileType: file.mimetype, // "image/png" or "application/pdf"
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// Add floor plan

export const uploadFloorPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file } = req.body; // base64 string
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
    const { propertyId, name, description, fileId, imageUrl, layout } =
      req.body;
    if (!propertyId || !imageUrl)
      throw new ValidationError("Missing propertyId or imageUrl");

    const floorPlan = await prisma.floorPlan.create({
      data: { propertyId, fileId, name, description, imageUrl, layout },
    });

    res.status(201).json({ success: true, floorPlan });
  } catch (err) {
    next(err);
  }
};

// Update floor plan
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

// Delete floor plan
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

/* -------------------------------------------------------------------------- */
/*                              PROPERTY DOCUMENTS                            */
/* -------------------------------------------------------------------------- */
export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file } = req.body; // base64 string
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
// Add document
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

// Update document
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
  } catch (err) {
    next(err);
  }
};

// Delete document
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

// export const softDeletePropertyDocument = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;

//     await prisma.propertyDocuments.update({
//       where: { id },
//       data: { deleted: true, deletedAt: new Date() },
//     });

//     res.status(200).json({ success: true, message: "Document soft deleted" });
//   } catch (err) {
//     next(err);
//   }
// };

// Update Property

export const updateProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const property = await prisma.properties.findUnique({ where: { id } });
    if (!property) return next(new ValidationError("Property not found"));
    if (property.agentId !== req.agent.id)
      return next(new AuthError("You can only update your own properties"));

    const updated = await prisma.properties.update({
      where: { id },
      data,
      include: { images: true },
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

// Get Current Draft
export const getDraftProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const draft = await prisma.properties.findFirst({
      where: { agentId: req.agent.id, status: "DRAFT" },
      include: {
        images: true,
        documents: true,
        pricing: true,
        floorPlans: true,
      },
    });

    if (!draft) {
      return res.status(200).json({ success: true, draft: null });
    }

    res.status(200).json({ success: true, draft });
  } catch (error) {
    next(error);
  }
};

// get logged in agent properties
export const getAgencyProperties = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const properties = await prisma.properties.findMany({
      where: {
        agencyId: req?.agent?.agency?.id,
      },
      include: {
        images: true,
        pricing: true,
        structure: true,
        floorPlans: true,
      },
    });

    res.status(201).json({
      success: true,
      properties,
    });
  } catch (error) {
    return next(error);
  }
};

// delete property
export const deleteProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const agentId = req.agent?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true, isDeleted: true },
    });

    if (!property) {
      return next(new ValidationError("Property not found"));
    }

    if (property.agencyId !== agentId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (property.isDeleted) {
      return next(new ValidationError("Property is already deleted"));
    }

    const deletedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
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

// permanent delete property or draft
export const permanentDeleteProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const agencyId = req.agent?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true },
    });

    if (!property) {
      return next(new ValidationError("Property not found"));
    }

    if (property.agencyId !== agencyId) {
      return next(new ValidationError("Unauthorized action"));
    }

    await prisma.properties.delete({
      where: { id: propertyId },
    });

    return res.status(200).json({
      message: "Property has been permanently deleted.",
    });
  } catch (error) {
    return next(error);
  }
};

// restore property
export const restoreProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;

    const agentId = req.agent?.agency?.id;

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, agencyId: true, isDeleted: true },
    });

    if (!property) {
      return next(new ValidationError("Property not found"));
    }

    if (property.agencyId !== agentId) {
      return next(new ValidationError("Unauthorized action"));
    }

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

// // get agent stripe information
// export const getStripeAccount = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const agentData = await prisma.agents.findUnique({
//       where: { id: req.agent.id },
//       select: { stripeId: true },
//     });

//     if (!agentData?.stripeId) {
//       return next(new ValidationError("No Stripe account linked!"));
//     }

//     // Fetch Stripe account details
//     const stripeAccount = await stripe.accounts.retrieve(agentData.stripeId);

//     // Fetch last payout (if available)
//     const payouts = await stripe.payouts.list(
//       { limit: 1 },
//       { stripeAccount: stripeAccount.id }
//     );
//     const lastPayout = payouts?.data.length
//       ? new Date(payouts.data[0].created * 1000).toLocaleDateString()
//       : null;

//     return res.status(200).json({
//       success: true,
//       stripeAccount: {
//         id: stripeAccount.id,
//         email: stripeAccount.email || "Not available",
//         business_name:
//           stripeAccount.business_profile?.name ||
//           stripeAccount.individual?.first_name +
//             " " +
//             stripeAccount.individual?.last_name ||
//           "N/A",
//         country: stripeAccount.country || "Unknown",
//         payouts_enabled: stripeAccount.payouts_enabled,
//         charges_enabled: stripeAccount.charges_enabled,
//         last_payout: lastPayout || "No payouts yet",
//         dashboard_url: `https://connect.stripe.com/app/express_dashboard/${stripeAccount.id}`,
//       },
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// get All properties
export const getAllProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = (req.query.type as string) || "latest"; // e.g. latest, verified, topRated

    // ───────────────────────────────
    // 🔹 Build Filters Dynamically
    // ───────────────────────────────
    const baseFilter: any = {
      isDeleted: false,
      isPublished: true,
      status: "ACTIVE",
    };

    // Optional filters
    if (req.query.category) baseFilter.category = req.query.category as string; // RENT, SALE, LEASE...
    if (req.query.state) baseFilter.state = req.query.state as string;
    if (req.query.city) baseFilter.city = req.query.city as string;
    if (req.query.purpose) baseFilter.purpose = req.query.purpose as string; // RESIDENTIAL, COMMERCIAL, etc.
    if (req.query.furnishing)
      baseFilter.furnishing = req.query.furnishing as string; // FURNISHED, etc.
    if (req.query.condition)
      baseFilter.condition = req.query.condition as string; // GOOD, NEW, etc.
    if (req.query.availability)
      baseFilter.availability = req.query.availability as string; // AVAILABLE_NOW, etc.
    if (req.query.verified)
      baseFilter.verified = req.query.verified === "true" ? true : false;

    // Range filters
    if (req.query.minPrice || req.query.maxPrice) {
      baseFilter.pricing = {
        basePrice: {
          gte: req.query.minPrice
            ? parseFloat(req.query.minPrice as string)
            : undefined,
          lte: req.query.maxPrice
            ? parseFloat(req.query.maxPrice as string)
            : undefined,
        },
      };
    }

    // ───────────────────────────────
    // 🔹 Sorting Logic
    // ───────────────────────────────
    let orderBy: any = { createdAt: "desc" };
    switch (type) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "verified":
        baseFilter.verified = true;
        orderBy = { verifiedAt: "desc" };
        break;
      case "popular":
        orderBy = { views: "desc" };
        break;
      case "topRated":
        orderBy = { ratings: "desc" };
        break;
      case "highPrice":
        orderBy = { pricing: { basePrice: "desc" } };
        break;
      case "lowPrice":
        orderBy = { pricing: { basePrice: "asc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // ───────────────────────────────
    // 🔹 Fetch Data
    // ───────────────────────────────
    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        skip,
        take: limit,
        where: baseFilter,
        include: {
          images: true,
          agency: {
            select: { id: true, name: true, avatar: true },
          },
          pricing: true,
          structure: true,
        },
        orderBy,
      }),
      prisma.properties.count({ where: baseFilter }),
    ]);

    const top10Properties = await prisma.properties.findMany({
      take: 10,
      where: baseFilter,
      orderBy,
      include: { images: true, pricing: true },
    });

    // ───────────────────────────────
    // 🔹 Response
    // ───────────────────────────────
    return res.status(200).json({
      success: true,
      message: `Fetched ${type} properties successfully.`,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      filters: baseFilter,
      data: {
        properties,
        top10Properties,
        sortBy: type,
      },
    });
  } catch (error) {
    next(error);
  }
};

// get all events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.properties.findMany({
        skip,
        take: limit,
        // where: baseFilter,
        include: {
          images: true,
          agency: true,
        },
        // orderBy: {
        //   totalSales: "desc",
        // },
      }),
      prisma.properties.count({}),
      // prisma.properties.count({ where: baseFilter }),
      prisma.properties.findMany({
        // where: baseFilter,
        take: 10,
        // orderBy: {
        //   totalSales: "desc",
        // },
      }),
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// get property details
export const getPropertyDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const property = await prisma.properties.findUnique({
      where: {
        slug: req.params.slug!,
      },
      include: {
        images: true,
        pricing: true,
        agency: true,
        floorPlans: true,
        structure: true,
      },
    });
    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    return next(error);
  }
};

// get filtered properties
export const getFilteredProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      priceRange = "0,100000000",
      categories = "",
      types = "", // property.type
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

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const [minPrice, maxPrice] = String(priceRange)
      .split(",")
      .map((n) => Number(n.trim()));

    const skip = (parsedPage - 1) * parsedLimit;

    // 🧠 Cache key based on filters
    const cacheKey = `filtered:properties:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🧾 Base filters (for the main property model)
    const filters: any = {
      status: "ACTIVE",
      isPublished: true,
      isDeleted: false,
    };

    if (categories) filters.category = { in: String(categories).split(",") };
    if (types) filters.type = { in: String(types).split(",") };
    if (availability)
      filters.availability = { in: String(availability).split(",") };
    if (purpose) filters.purpose = { in: String(purpose).split(",") };
    if (furnishing) filters.furnishing = { in: String(furnishing).split(",") };
    if (states) filters.state = { in: String(states).split(",") };
    if (cities) filters.city = { in: String(cities).split(",") };

    // 🏗️ Structure filters (nested relation)
    const structureFilters: any = {};
    if (bedrooms) structureFilters.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) structureFilters.bathrooms = { gte: Number(bathrooms) };

    // 💰 Pricing filters (nested relation)
    const pricingFilters: any = {
      basePrice: { gte: minPrice, lte: maxPrice },
    };
    if (leaseTerms)
      pricingFilters.leaseTerm = { in: String(leaseTerms).split(",") };

    // 🔍 Query DB
    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: {
          ...filters,
          propertyPricing: {
            ...pricingFilters,
          },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
        skip,
        take: parsedLimit,
        orderBy: { createdAt: "desc" },
        include: {
          images: true,
          agency: { select: { id: true, name: true } },
          agent: { select: { id: true, name: true, email: true } },
          pricing: true,
          structure: true,
          floorPlans: true,
          documents: true,
        },
      }),
      prisma.properties.count({
        where: {
          ...filters,
          propertyPricing: {
            ...pricingFilters,
          },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
      }),
    ]);

    const result = {
      properties,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };

    // 💾 Cache for 60 seconds
    await redis.setex(cacheKey, 60, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAgencyFilteredProperties = async (
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

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const [minPrice, maxPrice] = String(priceRange)
      .split(",")
      .map((n) => Number(n.trim()));

    const skip = (parsedPage - 1) * parsedLimit;

    // 🧾 Base filters
    const filters: any = {
      agencyId: req?.agent?.agency?.id,
      isDeleted: false,
      isPublished: true,
    };

    if (categories) filters.category = { in: String(categories).split(",") };
    if (types) filters.type = { in: String(types).split(",") };
    if (availability)
      filters.availability = { in: String(availability).split(",") };
    if (purpose) filters.purpose = { in: String(purpose).split(",") };
    if (furnishing) filters.furnishing = { in: String(furnishing).split(",") };
    if (states) filters.state = { in: String(states).split(",") };
    if (cities) filters.city = { in: String(cities).split(",") };

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // 🏗️ Structure filters
    const structureFilters: any = {};
    if (bedrooms) structureFilters.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) structureFilters.bathrooms = { gte: Number(bathrooms) };

    // 💰 Pricing filters
    const pricingFilters: any = {
      basePrice: { gte: minPrice, lte: maxPrice },
    };
    if (leaseTerms)
      pricingFilters.leaseTerm = { in: String(leaseTerms).split(",") };

    // 🔄 Sort logic
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.pricing = { basePrice: sortOrder as "asc" | "desc" };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // 🧠 Cache key (optional)
    const cacheKey = `agency:properties:${req.agent.agency.id}:${JSON.stringify(
      req.query,
    )}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔍 Query
    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: {
          ...filters,
          pricing: { ...pricingFilters },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
        include: {
          images: true,
          pricing: true,
          structure: true,
          floorPlans: true,
        },
        skip,
        take: parsedLimit,
        orderBy,
      }),
      prisma.properties.count({
        where: {
          ...filters,
          pricing: { ...pricingFilters },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
      }),
    ]);

    const result = {
      success: true,
      properties,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };

    // 💾 Cache 60s
    await redis.setex(cacheKey, 60, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// get filtered properties with agent promotions applied
export const getFilteredPropertiesPromo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
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

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const [minPrice, maxPrice] = String(priceRange)
      .split(",")
      .map((n) => Number(n.trim()));

    const skip = (parsedPage - 1) * parsedLimit;

    // 🧠 Cache key based on filters
    const cacheKey = `filtered:properties:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🧾 Base filters
    const filters: any = {
      status: "ACTIVE",
      isPublished: true,
      isDeleted: false,
    };

    if (categories) filters.category = { in: String(categories).split(",") };
    if (types) filters.type = { in: String(types).split(",") };
    if (availability)
      filters.availability = { in: String(availability).split(",") };
    if (purpose) filters.purpose = { in: String(purpose).split(",") };
    if (furnishing) filters.furnishing = { in: String(furnishing).split(",") };
    if (states) filters.state = { in: String(states).split(",") };
    if (cities) filters.city = { in: String(cities).split(",") };

    // Structure filters
    const structureFilters: any = {};
    if (bedrooms) structureFilters.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) structureFilters.bathrooms = { gte: Number(bathrooms) };

    // Pricing filters
    const pricingFilters: any = {
      basePrice: { gte: minPrice, lte: maxPrice },
    };
    if (leaseTerms)
      pricingFilters.leaseTerm = { in: String(leaseTerms).split(",") };

    // 🔍 Query DB
    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: {
          ...filters,
          pricing: {
            ...pricingFilters,
          },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
        skip,
        take: parsedLimit,
        orderBy: { createdAt: "desc" },
        include: {
          images: true,
          agency: { select: { id: true, name: true } },
          agent: { select: { id: true, name: true, email: true } },
          pricing: true,
          structure: true,
          floorPlans: true,
          documents: true,
        },
      }),
      prisma.properties.count({
        where: {
          ...filters,
          pricing: {
            ...pricingFilters,
          },
          structure: Object.keys(structureFilters).length
            ? structureFilters
            : undefined,
        },
      }),
    ]);

    // ⚡ Get promotions for all agents in the returned properties
    const agentIds = Array.from(
      new Set(properties.map((p: any) => p.agentId).filter(Boolean)),
    );

    const promotions = await prisma.promotions.findMany({
      where: { agentId: { in: agentIds } },
    });

    // 🧮 Apply discounts
    const discountedProperties = properties.map((prop: any) => {
      const basePrice = prop.pricing?.basePrice ?? 0;
      const promotion = promotions.find(
        (promo: any) => promo.agentId === prop.agentId,
      );

      if (!promotion) {
        return {
          ...prop,
          pricing: {
            ...prop.pricing,
            originalPrice: basePrice,
            finalPrice: basePrice,
          },
        };
      }

      let finalPrice = basePrice;

      if (promotion.discountType === "PERCENTAGE") {
        finalPrice = basePrice - (promotion.discountValue / 100) * basePrice;
      } else if (promotion.discountType === "FLAT") {
        finalPrice = Math.max(basePrice - promotion.discountValue, 0);
      }

      return {
        ...prop,
        pricing: {
          ...prop.pricing,
          originalPrice: basePrice,
          finalPrice,
          promotionApplied: {
            name: promotion.public_name,
            code: promotion.discountCode,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
          },
        },
      };
    });

    const result = {
      properties: discountedProperties,
      pagination: {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };

    // 💾 Cache for 60 seconds
    await redis.setex(cacheKey, 60, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// get filtered offers
export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          agency: true,
        },
      }),
      prisma.properties.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      properties,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// get filtered agencys
export const getFilteredAgencies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [agencies, total] = await Promise.all([
      prisma.agencies.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          agents: true,
          followers: true,
          properties: true,
        },
      }),
      prisma.agencies.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      agencies,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// search properties
export const searchProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) throw new ValidationError("Search query is required.");

    const cacheKey = `search:properties:${query.toLowerCase()}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const properties = await prisma.properties.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      },
      take: 15,
      orderBy: { createdAt: "desc" },
    });

    const result = { properties };

    // 💾 Cache for 120 seconds
    await redis.setex(cacheKey, 120, JSON.stringify(result));

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// recent properties
export const getRecentProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt((req.query.limit as string) || "10");

    const cacheKey = `recent:properties:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const properties = await prisma.properties.findMany({
      where: {
        isPublished: true,
        status: "ACTIVE",
        isDeleted: false,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          where: { isCover: true },
          take: 1,
        },
        agency: {
          select: { id: true, name: true, avatar: true },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const result = {
      count: properties.length,
      properties,
    };

    // Cache for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// top agencies
export const topAgencies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt((req.query.limit as string) || "10");
    const cacheKey = `top:agencies:${limit}`;

    // 🔹 1️⃣ Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔹 2️⃣ Fetch grouped transactions for agencies with revenue
    const transactions = await prisma.propertyTransactions.groupBy({
      by: ["agencyId", "type"],
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    });

    let allAgencyIds = [...new Set(transactions.map((t: any) => t.agencyId))];

    // 🔹 3️⃣ Fallback: if no transaction data (e.g. in dev)
    if (allAgencyIds.length === 0) {
      const fallbackAgencies = await prisma.agencies.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          logoUrl: true,
          verified: true,
          followers: { select: { id: true } },
          propertyAnalytics: {
            select: { views: true, inquiries: true, saved: true },
          },
        },
      });

      const fallbackResult = {
        success: true,
        topAgencies: fallbackAgencies.map((agency: any) => ({
          id: agency.id,
          name: agency.name,
          logoUrl: agency.logoUrl || agency.avatar,
          verified: agency.verified,
          totalRevenue: 0,
          totalsByType: {},
          followersCount: agency.followers.length,
          totalViews: agency.propertyAnalytics.reduce(
            (sum: any, a: any) => sum + (a.views || 0),
            0,
          ),
          totalInquiries: agency.propertyAnalytics.reduce(
            (sum: any, a: any) => sum + (a.inquiries || 0),
            0,
          ),
        })),
      };

      // cache fallback for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(fallbackResult));
      return res.status(200).json(fallbackResult);
    }

    // 🔹 4️⃣ Get agency details for those with transactions
    const agencies = await prisma.agencies.findMany({
      where: { id: { in: allAgencyIds }, isDeleted: false },
      select: {
        id: true,
        name: true,
        avatar: true,
        logoUrl: true,
        verified: true,
        followers: { select: { id: true } },
        propertyAnalytics: {
          select: { views: true, inquiries: true, saved: true },
        },
      },
    });

    // 🔹 5️⃣ Merge analytics with transaction revenue
    const enriched = agencies.map((agency: any) => {
      const agencyTx = transactions.filter(
        (t: any) => t.agencyId === agency.id,
      );

      const totalRevenue = agencyTx.reduce(
        (acc: any, t: any) => acc + (t._sum.amount || 0),
        0,
      );

      const totalsByType = agencyTx.reduce(
        (acc: any, t: any) => ({
          ...acc,
          [t.type.toLowerCase()]:
            (acc[t.type.toLowerCase()] || 0) + (t._sum.amount || 0),
        }),
        {},
      );

      const totalViews = agency.propertyAnalytics.reduce(
        (sum: any, a: any) => sum + (a.views || 0),
        0,
      );

      const totalInquiries = agency.propertyAnalytics.reduce(
        (sum: any, a: any) => sum + (a.inquiries || 0),
        0,
      );

      return {
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logoUrl || agency.avatar,
        verified: agency.verified,
        totalRevenue,
        totalsByType,
        followersCount: agency.followers.length,
        totalViews,
        totalInquiries,
      };
    });

    // 🔹 6️⃣ Sort by total revenue
    const sorted = enriched.sort(
      (a: any, b: any) => b.totalRevenue - a.totalRevenue,
    );

    const result = {
      success: true,
      topAgencies: sorted.slice(0, limit),
    };

    // 🔹 7️⃣ Cache result for 10 minutes
    await redis.setex(cacheKey, 600, JSON.stringify(result));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching top agencies:", error);
    next(error);
  }
};

// slug validator
export const slugValidator = async (
  req: Request,
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

    // Slugify manually (no slugify lib)
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50); // cap to 50 chars

    let uniqueSlug = slug;
    let counter = 1;

    while (
      await prisma.properties.findUnique({
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

// get property analytics
export const getPropertyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const analytics = await prisma.propertyAnalytics.findUnique({
      where: {
        propertyId: req.params.propertyId,
      },
    });
    res.status(201).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return next(error);
  }
};

// User applies for a property
export const applyForProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id; // from auth middleware

    // 1️⃣ Check if property exists
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      include: { agency: true },
    });

    if (!property) {
      return next(new ValidationError("Property not found!"));
    }

    // 2️⃣ Check if user already applied
    const existingApplication = await prisma.propertyApplications.findFirst({
      where: { userId, propertyId },
    });

    if (existingApplication) {
      return next(
        new ValidationError("You have already applied for this property."),
      );
    }

    // 3️⃣ Create the application
    const application = await prisma.propertyApplications.create({
      data: {
        userId,
        propertyId,
        agencyId: property.agencyId,
      },
      include: {
        property: { select: { title: true, id: true } },
        agency: { select: { name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const boostProperty = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const agencyId = req.agent?.agency?.id;
  const { propertyId, tier } = req.body;

  if (!propertyId) return next(new ValidationError("Property ID is required"));
  if (!tier)
    return next(new ValidationError("Tier is required (BRONZE, SILVER, GOLD)"));

  try {
    await prisma.$transaction(async (tx: any) => {
      // Step 1: Deduct credits safely within transaction
      const creditUsage = await deductCreditsDynamic({
        agencyId,
        action: "BOOST_PROPERTY",
        tier,
      });

      const { cost, validityDays } = creditUsage;

      // Step 2: Compute time range
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + (validityDays || 3) * 24 * 60 * 60 * 1000,
      );

      // Ensure safe typing for tier priority (avoid indexing with any)
      let tierPriority = 1;
      switch (tier) {
        case "BRONZE":
          tierPriority = 1;
          break;
        case "SILVER":
          tierPriority = 2;
          break;
        case "GOLD":
          tierPriority = 3;
          break;
        default:
          tierPriority = 1;
      }

      // Step 3: Create boost record
      const boost = await tx.propertyBoosts.create({
        data: {
          agencyId,
          propertyId,
          tier,
          creditsSpent: cost,
          startTime,
          endTime,
          status: "ACTIVE",
          priorityScore: tierPriority,
        },
      });

      // Return result if success
      res.status(201).json({
        success: true,
        message: `${tier} property boost activated for ${validityDays} days.`,
        boost,
      });
    });
  } catch (error) {
    // ❌ Step 4: Refund credits automatically if transaction fails
    console.error("❌ Boost failed, refunding credits:", error);

    if (agencyId && req.body?.tier) {
      try {
        await refundCredits(
          agencyId,
          req.body.cost || 0,
          "BOOST_PROPERTY",
          req.body.tier,
        );
      } catch (refundErr) {
        console.error("⚠️ Refund failed:", refundErr);
      }
    }

    next(error);
  }
};
