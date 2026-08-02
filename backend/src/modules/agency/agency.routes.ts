import express, { Router } from "express";

import * as agencyCtrl from "./agency.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const agencyRoutes: Router = express.Router();

// ───────────── Agency Management ─────────────
agencyRoutes.post("/create-agency", isAuthenticated, agencyCtrl.createAgency);

agencyRoutes.get("/get-agency/:agencyId", agencyCtrl.getAgency);

agencyRoutes.get("/top-agencies", agencyCtrl?.topAgencies);

agencyRoutes.delete(
  "/delete",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agencyCtrl.deleteAgency,
);
agencyRoutes.patch(
  "/restore",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agencyCtrl.restoreAgency,
);

agencyRoutes.delete(
  "/remove-agent/:agentId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agencyCtrl.removeAgentFromAgency,
);

// ───────────── Agent Status Management ─────────────
agencyRoutes.patch(
  "/toggle-agent-status/:agentId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"), // change it to manage_team later
  agencyCtrl.toggleAgentStatus,
); // Enable or disable an agent

// change agent role
agencyRoutes.patch(
  "/change-role/:agentId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"), // change it to manage_team later
  agencyCtrl.updateAgentRole,
); // Update agent role

// ───────────── Profile & Images ─────────────
agencyRoutes.patch(
  "/update-agency-image",
  isAuthenticated,
  checkPermission("edit_profile"),
  agencyCtrl.updateAgencyPictures,
);
agencyRoutes.get(
  "/get-my-agency-reviews",
  isAuthenticated,
  isAgent,
  agencyCtrl.getMyAgencyReviews,
);
agencyRoutes.patch(
  "/edit-profile",
  isAuthenticated,
  checkPermission("edit_profile"),
  agencyCtrl.editAgencyProfile,
);
agencyRoutes.patch(
  "/edit-contact",
  isAuthenticated,
  checkPermission("edit_profile"),
  agencyCtrl.editAgencyContact,
);
agencyRoutes.patch(
  "/edit-business-details",
  isAuthenticated,
  checkPermission("edit_profile"),
  agencyCtrl.editAgencyBusinessDetails,
);
agencyRoutes.patch(
  "/edit-media",
  isAuthenticated,
  checkPermission("edit_profile"),
  agencyCtrl.editAgencyMedia,
);

// ───────────── Team Agency/agents Info ─────────────
agencyRoutes.get(
  "/get-agent-performance/:id",
  isAuthenticated,
  isAgent,
  agencyCtrl.getMyAgencyPerformance,
);
agencyRoutes.get("/get-filtered-agencies", agencyCtrl?.getFilteredAgencies);


export default agencyRoutes;
