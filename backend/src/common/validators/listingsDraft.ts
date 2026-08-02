// validators/listingDraft.schema.ts
import { z } from "zod";

const structureSchema = z.object({
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  toilets: z.number().int().min(0).optional(),
  livingRooms: z.number().int().min(0).optional(),
  kitchens: z.number().int().min(0).optional(),
  kitchenType: z.enum(["PRIVATE", "SHARED", "OUTDOOR"]).optional(),
  toiletLocation: z.enum(["INDOOR", "OUTDOOR", "SHARED"]).optional(),
  isWholeBuilding: z.boolean().optional(),
  isServiced: z.boolean().optional(),
  floorLevel: z.number().int().optional(),
  hasBalcony: z.boolean().optional(),
  petPolicy: z
    .enum(["NOT_ALLOWED", "ALLOWED", "NEGOTIABLE", "REQUIRES_APPROVAL"])
    .optional(),
  petDetails: z.record(z.string(), z.any()).optional(),
});

const pricingSchema = z.object({
  basePrice: z.number().positive("Base price is required"),
  cautionFee: z.number().optional(),
  agentFee: z.number().optional(),
  legalFee: z.number().optional(),
  serviceCharge: z.number().optional(),
  paymentFrequency: z
    .enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"])
    .optional(),
  leaseTerm: z
    .enum(["SIX_MONTHS", "ONE_YEAR", "TWO_YEARS", "THREE_YEARS", "FIVE_YEARS"])
    .optional(),
  currency: z.string().default("NGN"),
  negotiable: z.boolean().optional(),
});

const imageSchema = z.object({
  fileId: z.string(),
  url: z.string().url(),
  caption: z.string().optional(),
  type: z.string().optional(),
  isCover: z.boolean().optional(),
  order: z.number().int().optional(),
});

// One unit's full data — used for both the single-unit case and each
// entry in a multi-unit array.
const unitSchema = z.object({
  unitLabel: z.string().optional(), // required only when isMultiUnit=true, enforced below
  category: z.enum(["RENT", "SALE", "LEASE", "SHORT_LET"]),
  type: z.enum([
    "SELF_CONTAIN",
    "MINI_FLAT",
    "ONE_BEDROOM_FLAT",
    "TWO_BEDROOM_FLAT",
    "THREE_BEDROOM_FLAT",
    "FOUR_BEDROOM_FLAT",
    "FIVE_BEDROOM_FLAT",
    "ROOM_ONLY",
    "SHOP",
    "OFFICE_SPACE",
    "SHORT_LET",
    "LAND",
    "OTHER",
  ]),
  designType: z.string().optional(),
  purpose: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "MIXED_USE",
    "SHORT_LET",
    "HOSTEL",
    "TENEMENT",
    "SERVICED_APARTMENT",
  ]),
  economicClass: z.string().optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  condition: z.enum(["NEW", "GOOD", "NEEDS_RENOVATION", "OLD"]).optional(),
  sizeSqm: z.number().positive().optional(),
  landSizeSqm: z.number().positive().optional(),
  yearBuilt: z.number().int().optional(),

  electricity: z.string().optional(),
  electricBilling: z.string().optional(),
  waterSupply: z.string().optional(),
  cooling: z.string().optional(),
  heating: z.string().optional(),
  construction: z.string().optional(),
  floorType: z.string().optional(),
  roofType: z.string().optional(),
  wallFinish: z.string().optional(),
  ceilingType: z.string().optional(),
  buildingMaterial: z.string().optional(),

  customSpecifications: z.record(z.string(), z.any()).optional(),
  customFeatures: z.record(z.string(), z.any()).optional(),

  structure: structureSchema.optional(),
  amenityIds: z.array(z.string()).default([]),
  images: z
    .array(imageSchema)
    .min(1, "At least one image is required")
    .default([]),
  videos: z
    .array(z.object({ fileId: z.string(), url: z.string().url() }))
    .default([]),
  floorPlans: z
    .array(z.object({ fileId: z.string(), name: z.string().optional() }))
    .default([]),

  // Listing-level fields, one per unit (each unit gets its own offer)
  listingPurpose: z.enum(["RENT", "SALE", "LEASE", "SHORT_LET"]),
  availability: z
    .enum(["AVAILABLE_NOW", "AVAILABLE_FROM_DATE", "COMING_SOON"])
    .optional(),
  availableFrom: z.coerce.date().optional(),
  pricing: pricingSchema,
});

export const listingDraftSchema = z
  .object({
    // Asset-level (properties)
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    address: z.string().min(3, "Address is required"),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    tags: z.array(z.string()).default([]),
    nearByLocation: z
      .array(
        z.object({
          name: z.string(),
          category: z.string(),
          distanceKm: z.number().optional(),
        }),
      )
      .default([]),
    video_url: z.string().url().optional(),

    isMultiUnit: z.boolean(),
    unit: unitSchema.optional(), // used when isMultiUnit = false
    units: z.array(unitSchema).optional(), // used when isMultiUnit = true
  })
  .superRefine((data, ctx) => {
    if (data.isMultiUnit) {
      if (!data.units || data.units.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["units"],
          message: "At least one unit is required for a multi-unit property",
        });
      }
      data.units?.forEach((u, i) => {
        if (!u.unitLabel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["units", i, "unitLabel"],
            message:
              "unitLabel is required for each unit in a multi-unit property",
          });
        }
      });
    } else if (!data.unit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unit"],
        message: "unit is required for a standalone property",
      });
    }
  });

export type ListingDraftInput = z.infer<typeof listingDraftSchema>;

// A looser schema for autosave — nothing is required, since the agent
// might be mid-sentence when the frontend autosaves. Publish always
// re-validates with the strict schema above.
export const listingDraftPartialSchema = z.object({}).passthrough();
