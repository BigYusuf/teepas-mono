import express, { Router } from "express";

import * as membershipCtrl from "./memberships.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const membershipRoutes: Router = express.Router();

// ───────────── Join Agency ─────────────

membershipRoutes.post(
  "/join-agency/:agencyId",
  isAuthenticated,
  isAgent,
  membershipCtrl.joinAgency,
);

membershipRoutes.get(
  "/cancel-join-request/:requestId",
  isAuthenticated,
  isAgent,
  membershipCtrl.cancelJoinRequest,
);

membershipRoutes.get(
  "/list-my-join-request",
  isAuthenticated,
  isAgent,
  membershipCtrl.listMyJoinRequests,
);

membershipRoutes.get(
  "/list-my-agencies",
  isAuthenticated,
  isAgent,
  membershipCtrl.listMyAgencies,
);

membershipRoutes.get(
  "/list-agency-join-request",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  membershipCtrl.listJoinRequests,
);
membershipRoutes.get(
  "/get-join-request/:requestId",
  isAuthenticated,
  isAgent,
  membershipCtrl.getJoinRequest,
);

membershipRoutes.patch(
  "/approve-join-request/:requestId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  membershipCtrl.approveJoinRequest,
);
membershipRoutes.patch(
  "/reject-join-request/:requestId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency"),
  membershipCtrl.rejectJoinRequest,
);

// ───────────── Membership Management ─────────────
membershipRoutes.get(
  "/list-members",
  isAuthenticated,
  isAgent,
  membershipCtrl.listAgencyMembers,
);

membershipRoutes.get(
  "/get-member/:membershipId",
  isAuthenticated,
  isAgent,
  membershipCtrl.getAgencyMember,
);

export default membershipRoutes;
