import express, { Router } from "express";

import * as applicationCtrl from "./application.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const applicationRoutes: Router = express.Router();

// ───────────── User side ─────────────
applicationRoutes.post(
  "/apply-listings/:listingId",
  isAuthenticated,
  checkPermission("apply_property"),
  applicationCtrl.applyToListing,
);
applicationRoutes.get(
  "/me",
  isAuthenticated,
  checkPermission("view_application_status"),
  applicationCtrl.getMyApplications,
);
applicationRoutes.patch(
  "/cancel-application/:id",
  isAuthenticated,
  checkPermission("view_application_status"),
  applicationCtrl.cancelApplication,
);
applicationRoutes.patch(
  "/accept-application/:id",
  isAuthenticated,
  checkPermission("view_application_status"),
  applicationCtrl.userAcceptApplication,
);

// ───────────── Agency side ─────────────
applicationRoutes.get(
  "/agency-applications",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  applicationCtrl.getAgencyApplications,
);
applicationRoutes.patch(
  "/schedule-inspection/:id",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  applicationCtrl.scheduleInspectionForApplication,
);
applicationRoutes.patch(
  "/update-agency-status/:id",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  applicationCtrl.updateAgencyApplicationStatus,
);

// ───────────── Shared ─────────────
applicationRoutes.get(
  "/get-application/:id",
  isAuthenticated,
  applicationCtrl.getApplicationById, // ownership check happens inside the controller
);

export default applicationRoutes;
