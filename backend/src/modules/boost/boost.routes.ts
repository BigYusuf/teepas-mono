import express, { Router } from "express";

import * as boostCtrl from "./boost.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const boostRoutes: Router = express.Router();

boostRoutes.post(
  "/listings-boost/:listingId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_boosts"),
  boostCtrl.boostListing,
);
boostRoutes.get(
  "/agency-boost",
  isAuthenticated,
  isAgent,
  checkPermission("manage_boosts"),
  boostCtrl.getAgencyBoosts,
);
boostRoutes.get("/listings-boost/:listingId", boostCtrl.getListingBoost); // public — used to show "Boosted" badge
boostRoutes.patch(
  "/cancel-boost/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_boosts"),
  boostCtrl.cancelBoost,
);

export default boostRoutes;
