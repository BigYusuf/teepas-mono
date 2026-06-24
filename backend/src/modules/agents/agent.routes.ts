import express, { Router } from "express";

import * as agentCtrl from "./agent.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const router: Router = express.Router();

// ───────────── Agency Management ─────────────
router.get(
  "/get-agency-staffs",
  isAuthenticated,
  checkPermission("manage_agency"),
  agentCtrl.getAgencyStaffs,
);
router.delete(
  "/delete",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agentCtrl.deleteAgency,
);
router.patch(
  "/restore",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agentCtrl.restoreAgency,
);

router.delete(
  "/remove-agent/:agentId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  agentCtrl.removeAgentFromAgency,
);

// ───────────── Agent Status Management ─────────────
router.patch(
  "/:agentId/status",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"), // change it to manage_team later
  agentCtrl.toggleAgentStatus,
); // Enable or disable an agent

//change agent role
router.patch(
  "/change-role/:agentId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"), // change it to manage_team later
  agentCtrl.updateAgentRole,
); // EUpdate agent role

// ───────────── Invite Agent ─────────────
router.post(
  "/invite-staff",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"), // change it to manage_team later
  agentCtrl.inviteAgent,
);

// ───────────── Profile & Images ─────────────
router.post(
  "/upload-image",
  isAuthenticated,
  checkPermission("edit_profile"),
  agentCtrl.uploadImage,
);
router.put(
  "/update-image",
  isAuthenticated,
  checkPermission("edit_profile"),
  agentCtrl.updateProfilePictures,
);
router.put(
  "/edit-profile",
  isAuthenticated,
  checkPermission("edit_profile"),
  agentCtrl.editAgentProfile,
);

// ───────────── Public Agent Info ─────────────
router.get("/get-agent/:id", agentCtrl.getAgentInfo);
router.get("/get-agent-properties/:id", agentCtrl.getAgentProperties);
router.get("/get-agent-events/:id", agentCtrl.getAgentEvents);

// ───────────── Team Agency/agents Info ─────────────
router.get(
  "/get-agent-performance/:id",
  isAuthenticated,
  isAgent,
  agentCtrl.getMyAgencyPerformance,
);
router.get(
  "/get-agency-team/:id",
  isAuthenticated,
  isAgent,
  agentCtrl.getMyAgencyTeam,
);

// ───────────── Notifications ─────────────
router.get(
  "/agent-notifications",
  isAuthenticated,
  isAgent,
  checkPermission("send_notifications"),
  agentCtrl.agentNotifications,
);
router.post(
  "/mark-notification-as-read",
  isAuthenticated,
  checkPermission("send_notifications"),
  agentCtrl.markNotificationAsRead,
);

// ───────────── Following ─────────────
router.post(
  "/follow-agency",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.followAgency,
);
router.post(
  "/unfollow-agency",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.unfollowAgency,
);
router.get(
  "/is-following/:id",
  isAuthenticated,
  checkPermission("follow_agency"),
  agentCtrl.isFollowing,
);

// ───────────── Bank Accounts ─────────────
router.get(
  "/get-all-agency-bank-accounts",
  isAuthenticated,
  checkPermission("view_finance"),
  agentCtrl.getAgencyBankAccounts,
);
router.get(
  "/get-agency-bank-account/:id",
  isAuthenticated,
  checkPermission("view_finance"),
  agentCtrl.getAgencyBankAccount,
);
router.put(
  "/update-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.updateAgencyBankAccount,
);
router.delete(
  "/delete-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.deleteAgencyBankAccount,
);
router.put(
  "/set-primary-agency-bank-account/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_finance"),
  agentCtrl.setPrimaryAgencyBankAccount,
);

// ───────────── Property Applications ─────────────
router.get(
  "/get-property-applications",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.getAgencyApplications,
);
router.patch(
  "/application/:id/approve",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.approveApplication,
);
router.patch(
  "/application/:id/reject",
  isAuthenticated,
  isAgent,
  checkPermission("approve_property_applications"),
  agentCtrl.rejectApplication,
);

export default router;
