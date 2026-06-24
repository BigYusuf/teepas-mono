import express, { Router } from "express";
import {
  addPropertyImage,
  createPromotions,
  deleteDiscountCode,
  deleteProperty,
  deletePropertyImage,
  getAllEvents,
  getAllProperties,
  getCategories,
  getPromotions,
  getFilteredEvents,
  getFilteredProperties,
  getFilteredAgencies,
  getPropertyAnalytics,
  getPropertyDetails,
  getAgencyProperties,
  // getStripeAccount,
  restoreProperty,
  searchProperties,
  slugValidator,
  topAgencies,
  uploadPropertyImage,
  getDraftProperty,
  permanentDeleteProperty,
  boostProperty,
  propertyBasicInfo,
  propertyLocationStructure,
  propertyFeaturesUtililities,
  addFloorPlan,
  deleteFloorPlan,
  updateFloorPlan,
  addPropertyDocument,
  deletePropertyDocument,
  updatePropertyDocument,
  updatePropertyPricing,
  markPropertyImageAsCover,
  uploadFloorPlan,
  uploadDocument,
  publishProperty,
  getAgencyFilteredProperties,
} from "./property.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const propertyRoutes: Router = express.Router();

// ───────────── Public Routes ─────────────
propertyRoutes.get("/get-categories", getCategories);
propertyRoutes.get("/get-all-properties", getAllProperties);
propertyRoutes.get("/get-all-events", getAllEvents);
propertyRoutes.get("/get-property/:slug", getPropertyDetails);
propertyRoutes.get("/get-filtered-properties", getFilteredProperties);
propertyRoutes.get("/get-filtered-offers", getFilteredEvents);
propertyRoutes.get("/get-filtered-agencies", getFilteredAgencies);
propertyRoutes.get("/search-properties", searchProperties);
propertyRoutes.get("/top-agencies", topAgencies);

// ───────────── Promotions ─────────────
propertyRoutes.post(
  "/create-promotion",
  isAuthenticated,
  checkPermission("manage_promotions"),
  createPromotions
);
propertyRoutes.get("/get-promotions", isAuthenticated, getPromotions);
propertyRoutes.delete(
  "/delete-promotion/:id",
  isAuthenticated,
  checkPermission("manage_promotions"),
  deleteDiscountCode
);

// ───────────── Property Images ─────────────
propertyRoutes.post(
  "/upload-property-image",
  isAuthenticated,
  checkPermission("create_property"),
  uploadPropertyImage
);
propertyRoutes.post(
  "/add-property-image",
  isAuthenticated,
  checkPermission("edit_property"),
  addPropertyImage
);
propertyRoutes.post(
  "/mark-property-image-cover",
  isAuthenticated,
  checkPermission("edit_property"),
  markPropertyImageAsCover
);
propertyRoutes.delete(
  "/delete-property-image",
  isAuthenticated,
  checkPermission("delete_property"),
  deletePropertyImage
);

// ───────────── Property CRUD ─────────────
propertyRoutes.post(
  "/create-property-basic",
  isAuthenticated,
  checkPermission("create_property"),
  propertyBasicInfo
);
propertyRoutes.put(
  "/create-property-location/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyLocationStructure
);
propertyRoutes.put(
  "/create-property-pricing/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  updatePropertyPricing
);
propertyRoutes.put(
  "/create-property-features/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyFeaturesUtililities
);
propertyRoutes.put(
  "/create-property-publish/:id",
  isAuthenticated,
  checkPermission("publish_property"),
  publishProperty
);

// ───────────── Floor Plans ─────────────
propertyRoutes.post(
  "/upload-floor-plan",
  isAuthenticated,
  checkPermission("create_property"),
  uploadFloorPlan
);
propertyRoutes.post(
  "/add-floor-plan",
  isAuthenticated,
  checkPermission("edit_property"),
  addFloorPlan
);
propertyRoutes.delete(
  "/delete-floor-plan/:id",
  isAuthenticated,
  checkPermission("delete_property"),
  deleteFloorPlan
);
propertyRoutes.patch(
  "/update-floor-plan/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  updateFloorPlan
);

// ───────────── Documents ─────────────
propertyRoutes.post(
  "/upload-document",
  isAuthenticated,
  checkPermission("create_property"),
  uploadDocument
);
propertyRoutes.post(
  "/add-property-document",
  isAuthenticated,
  checkPermission("edit_property"),
  addPropertyDocument
);
propertyRoutes.delete(
  "/delete-property-document/:id",
  isAuthenticated,
  checkPermission("delete_property"),
  deletePropertyDocument
);
propertyRoutes.patch(
  "/update-property-document/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  updatePropertyDocument
);

// ───────────── Drafts & Agency Properties ─────────────
propertyRoutes.get(
  "/get-draft-property",
  isAuthenticated,
  checkPermission("view_properties"),
  getDraftProperty
);
propertyRoutes.put(
  "/update-property/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  getDraftProperty
);
propertyRoutes.get(
  "/get-agency-properties",
  isAuthenticated,
  // checkPermission("view_properties"),
  getAgencyProperties
);
propertyRoutes.get(
  "/get-agency-filtered-properties",
  isAuthenticated,
  getAgencyFilteredProperties
);

// ───────────── Delete & Restore ─────────────
propertyRoutes.delete(
  "/delete-property/:propertyId",
  isAuthenticated,
  checkPermission("delete_property"),
  deleteProperty
);
propertyRoutes.post(
  "/boost-property",
  isAuthenticated,
  isAgent,
  checkPermission("manage_boosts"),
  boostProperty
);
propertyRoutes.delete(
  "/permanent-delete-property/:propertyId",
  isAuthenticated,
  checkPermission("delete_property"),
  permanentDeleteProperty
);
propertyRoutes.put(
  "/restore-property/:propertyId",
  isAuthenticated,
  checkPermission("edit_property"),
  restoreProperty
);

// // ───────────── Stripe & Validation ─────────────
// propertyRoutes.get(
//   "/get-stripe-account",
//   isAuthenticated,
//   isAgent,
//   checkPermission("manage_finance"),
//   getStripeAccount
// );
propertyRoutes.post(
  "/slug-validator",
  isAuthenticated,
  isAgent,
  checkPermission("create_property"),
  slugValidator
);

// ───────────── Analytics ─────────────
propertyRoutes.get(
  "/get-property-analytics/:propertyId",
  isAuthenticated,
  checkPermission("view_agency_reports"),
  getPropertyAnalytics
);

export default propertyRoutes;
