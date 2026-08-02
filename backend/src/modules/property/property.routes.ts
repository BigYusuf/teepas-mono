import express, { Router } from "express";

import * as propertyCtrl from "./property.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const propertyRoutes: Router = express.Router();

// ───────────── Public Routes ─────────────
propertyRoutes.get("/get-all-amenities", propertyCtrl.getAllAmenities);
propertyRoutes.get("/get-categories", propertyCtrl?.getCategories);

// ───────────── Property Images ─────────────
propertyRoutes.post(
  "/upload-property-image",
  isAuthenticated,
  checkPermission("create_property"),
  propertyCtrl?.uploadPropertyImage,
);
propertyRoutes.post(
  "/add-property-image",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.addPropertyImage,
);
propertyRoutes.post(
  "/mark-property-image-cover",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.markPropertyImageAsCover,
);
propertyRoutes.delete(
  "/delete-property-image",
  isAuthenticated,
  checkPermission("delete_property"),
  propertyCtrl?.deletePropertyImage,
);

// ───────────── Floor Plans ─────────────
propertyRoutes.post(
  "/upload-floor-plan",
  isAuthenticated,
  checkPermission("create_property"),
  propertyCtrl?.uploadFloorPlan,
);
propertyRoutes.post(
  "/add-floor-plan",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.addFloorPlan,
);
propertyRoutes.delete(
  "/delete-floor-plan/:id",
  isAuthenticated,
  checkPermission("delete_property"),
  propertyCtrl?.deleteFloorPlan,
);
propertyRoutes.patch(
  "/update-floor-plan/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.updateFloorPlan,
);

// ───────────── Documents ─────────────
propertyRoutes.post(
  "/upload-document",
  isAuthenticated,
  checkPermission("create_property"),
  propertyCtrl?.uploadDocument,
);
propertyRoutes.post(
  "/add-property-document",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.addPropertyDocument,
);
propertyRoutes.delete(
  "/delete-property-document/:id",
  isAuthenticated,
  checkPermission("delete_property"),
  propertyCtrl?.deletePropertyDocument,
);
propertyRoutes.patch(
  "/update-property-document/:id",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.updatePropertyDocument,
);

// ───────────── Delete & Restore ─────────────
propertyRoutes.delete(
  "/delete-property/:propertyId",
  isAuthenticated,
  checkPermission("delete_property"),
  propertyCtrl?.deleteProperty,
);

propertyRoutes.delete(
  "/permanent-delete-property/:propertyId",
  isAuthenticated,
  checkPermission("delete_property"),
  propertyCtrl?.permanentDeleteProperty,
);
propertyRoutes.put(
  "/restore-property/:propertyId",
  isAuthenticated,
  checkPermission("edit_property"),
  propertyCtrl?.restoreProperty,
);

propertyRoutes.post(
  "/properties/:propertyId/units",
  isAgent,
  checkPermission("edit_property"),
  propertyCtrl.addUnit,
);
propertyRoutes.get("/units/:unitId", propertyCtrl.getUnitById);

propertyRoutes.patch(
  "/units/:unitId",
  isAgent,
  checkPermission("edit_property"),
  propertyCtrl.editUnit,
);

propertyRoutes.delete(
  "/units/:unitId",
  isAgent,
  checkPermission("delete_property"),
  propertyCtrl.deleteUnit,
);

export default propertyRoutes;
