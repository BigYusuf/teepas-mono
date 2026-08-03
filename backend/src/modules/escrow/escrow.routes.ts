import express, { Router } from "express";

import * as escrowCtrl from "./escrow.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { isAdmin } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const escrowRoutes: Router = express.Router();

// ───────────── User side (tenants/buyers — just authenticated users) ─────────────
escrowRoutes.post(
  "/create-escrow",
  isAuthenticated,
  escrowCtrl.createEscrowRequest,
);
escrowRoutes.get(
  "/get-my-escrow-payments",
  isAuthenticated,
  escrowCtrl.getMyEscrowPayments,
);

// ───────────── Shared (confirm/dispute — user OR agency, controller checks ownership) ─────────────
escrowRoutes.patch(
  "/confirm-escrow/:id",
  isAuthenticated,
  escrowCtrl.confirmEscrow,
);
escrowRoutes.patch(
  "/dispute-escrow/:id",
  isAuthenticated,
  escrowCtrl.disputeEscrow,
);
escrowRoutes.get("/get-escrow/:id", isAuthenticated, escrowCtrl.getEscrowById);

// ───────────── Agency side ─────────────
escrowRoutes.get(
  "/get-agency-escrow-payments",
  isAuthenticated,
  isAgent,
  checkPermission("manage_escrow"),
  escrowCtrl.getAgencyEscrowPayments,
);

// ───────────── Admin side (dispute resolution) ─────────────
escrowRoutes.patch(
  "/resolve-dispute/:id",
  isAuthenticated,
  isAdmin,
  checkPermission("resolve_escrow_disputes"),
  escrowCtrl.resolveDispute,
);

// ───────────── Webhook (no auth — verified via signature header) ─────────────
escrowRoutes.post("/webhook/flutterwave", escrowCtrl.flutterwaveWebhook);

export default escrowRoutes;
