import express, { Router } from "express";

import * as agentCtrl from "./agent.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const agentRoutes: Router = express.Router();

// ───────────── Profile & Images ─────────────
agentRoutes.post(
  "/upload-image",
  isAuthenticated,
  checkPermission("edit_profile"),
  agentCtrl.uploadImage,
);

// ───────────── Public Agent Info ─────────────
agentRoutes.get("/get-agent/:id", agentCtrl.getAgentInfo);
agentRoutes.get("/get-agent-properties/:id", agentCtrl.getAgentProperties);
agentRoutes.get("/get-agent-events/:id", agentCtrl.getAgentEvents);


// ───────────── Notifications ─────────────
agentRoutes.get(
  "/agent-notifications",
  isAuthenticated,
  isAgent,
  checkPermission("send_notifications"),
  agentCtrl.agentNotifications,
);
agentRoutes.post(
  "/mark-notification-as-read",
  isAuthenticated,
  checkPermission("send_notifications"),
  agentCtrl.markNotificationAsRead,
);

// ───────────── Following ─────────────
agentRoutes.post(
  "/follow-agency",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.followAgency,
);
agentRoutes.post(
  "/unfollow-agency",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.unfollowAgency,
);
agentRoutes.get(
  "/is-following/:id",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.isFollowing,
);

// ───────────── Bank Accounts ─────────────
agentRoutes.get(
  "/get-all-agency-bank-accounts",
  isAuthenticated,
  checkPermission("view_finance"),
  agentCtrl.getAgencyBankAccounts,
);
agentRoutes.get(
  "/get-agency-bank-account/:id",
  isAuthenticated,
  checkPermission("view_finance"),
  agentCtrl.getAgencyBankAccount,
);
agentRoutes.put(
  "/update-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.updateAgencyBankAccount,
);
agentRoutes.delete(
  "/delete-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.deleteAgencyBankAccount,
);
agentRoutes.put(
  "/set-primary-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.setPrimaryAgencyBankAccount,
);

// ───────────── Property Applications ─────────────
agentRoutes.get(
  "/get-property-applications",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.getAgencyApplications,
);
agentRoutes.patch(
  "/application/:id/approve",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.approveApplication,
);
agentRoutes.patch(
  "/application/:id/reject",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.rejectApplication,
);

export default agentRoutes;
