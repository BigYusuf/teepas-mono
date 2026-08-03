import express, { Router } from "express";

import * as withdrawalCtrl from "./withdrawal.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const withdrawalRoutes: Router = express.Router();

withdrawalRoutes.get(
  "/wallet",
  isAuthenticated,
  isAgent,
  withdrawalCtrl.getWallet,
);
withdrawalRoutes.get(
  "/wallet/transactions",
  isAuthenticated,
  isAgent,
  withdrawalCtrl.getWalletTransactions,
);

withdrawalRoutes.post(
  "/withdrawals",
  isAuthenticated,
  isAgent,
  checkPermission("manage_withdrawals"),
  withdrawalCtrl.requestWithdrawal,
);
withdrawalRoutes.get(
  "/withdrawals",
  isAuthenticated,
  isAgent,
  withdrawalCtrl.getMyWithdrawals,
);

withdrawalRoutes.post(
  "/withdrawals/webhook/flutterwave",
  withdrawalCtrl.transferWebhook,
);

export default withdrawalRoutes;
