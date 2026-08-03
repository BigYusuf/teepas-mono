import express, { Router } from "express";
import {
  initiateFunding,
  flutterwaveCreditWebhook,
  getAgencyBalance,
  getCreditTransactions,
  refundCreditsPoint,
  adminRefundCredits,
  upsertCreditSetting,
  getCreditSettings,
  getCreditSettingById,
  deleteCreditSetting,
  toggleCreditSettingStatus,
} from "./credit.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { isAdmin } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const creditRoutes: Router = express.Router();

// ───────────── Agency: fund wallet ─────────────
creditRoutes.post(
  "/initiate-funding",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency_credits"),
  initiateFunding,
);
creditRoutes.get("/balance", isAuthenticated, isAgent, getAgencyBalance);
creditRoutes.get(
  "/transactions",
  isAuthenticated,
  isAgent,
  getCreditTransactions,
);

// ───────────── Webhook (no auth — verified via signature header) ─────────────
creditRoutes.post("/webhook/flutterwave", flutterwaveCreditWebhook);

// ───────────── Admin: refunds ─────────────
creditRoutes.post(
  "/admin/refund",
  isAuthenticated,
  isAdmin,
  adminRefundCredits,
);
creditRoutes.post(
  "/admin/refund-point",
  isAuthenticated,
  isAdmin,
  refundCreditsPoint,
);

// ───────────── Admin: credit settings CRUD ─────────────
creditRoutes.post(
  "/admin/settings",
  isAuthenticated,
  isAdmin,
  upsertCreditSetting,
);
creditRoutes.get(
  "/admin/settings",
  isAuthenticated,
  isAdmin,
  getCreditSettings,
);
creditRoutes.get(
  "/admin/settings/:id",
  isAuthenticated,
  isAdmin,
  getCreditSettingById,
);
creditRoutes.delete(
  "/admin/settings/:id",
  isAuthenticated,
  isAdmin,
  deleteCreditSetting,
);
creditRoutes.patch(
  "/admin/settings/:id/toggle",
  isAuthenticated,
  isAdmin,
  toggleCreditSettingStatus,
);

export default creditRoutes;
