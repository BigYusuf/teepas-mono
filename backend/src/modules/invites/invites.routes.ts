import express, { Router } from "express";

import * as inviteCtrl from "./invites.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const inviteRoutes: Router = express.Router();

// ───────────── Invites Management ─────────────
inviteRoutes.get("/get-invite-details/:token", inviteCtrl.getInvitationDetails);

inviteRoutes.post("/accept-invites", inviteCtrl.acceptInvitation);

inviteRoutes.get("/reject-invite/:invitationId", inviteCtrl.rejectInvitation);

inviteRoutes.get(
  "/list-my-invites",
  isAuthenticated,
  isAgent,
  inviteCtrl.listMyInvitations,
);

inviteRoutes.get(
  "/list-agency-invites",
  isAuthenticated,
  isAgent,
  inviteCtrl.listAgencyInvitations,
);

inviteRoutes.post(
  "/invite-agent",
  isAuthenticated,
  isAgent,
  inviteCtrl.inviteAgent,
);

inviteRoutes.get(
  "/get-agency-invite/:invitationId",
  isAuthenticated,
  isAgent,
  inviteCtrl.getAgencyInvitation,
);
inviteRoutes.patch(
  "/revoke-invite/:invitationId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  inviteCtrl.revokeInvitation,
);
inviteRoutes.patch(
  "/resend-invite/:invitationId",
  isAuthenticated,
  isAgent,
  inviteCtrl.resendInvitation,
);

export default inviteRoutes;
