import express, { Router } from "express";

import * as listingCtrl from "./listings.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const listingRoutes: Router = express.Router();

// ───────────── Draft Flow ─────────────
listingRoutes.post(
  "/create-draft",
  isAuthenticated,
  isAgent,
  checkPermission("create_property"),
  listingCtrl.createDraft,
);
listingRoutes.patch(
  "/autosave-drafts/:id",
  isAuthenticated,
  isAgent,
  checkPermission("edit_property"),
  listingCtrl.autosaveDraft,
);
listingRoutes.get(
  "/get-draft/:id",
  isAuthenticated,
  isAgent,
  listingCtrl.getDraft,
);
listingRoutes.get(
  "/list-drafts",
  isAuthenticated,
  isAgent,
  listingCtrl.listDrafts,
);
listingRoutes.delete(
  "/delete-draft/:id",
  isAuthenticated,
  isAgent,
  checkPermission("delete_property"),
  listingCtrl.discardDraft,
);
listingRoutes.post(
  "/edit-draft/:listingId",
  isAuthenticated,
  isAgent,
  checkPermission("edit_property"),
  listingCtrl.editListingAsDraft,
);
listingRoutes.post(
  "/publish-drafts/:id",
  isAuthenticated,
  isAgent,
  checkPermission("publish_property"),
  listingCtrl.publishDraft,
);

// ───────────── Public / Search ─────────────
listingRoutes.get("/search-listings", listingCtrl.searchListings);
listingRoutes.get("/recent-listings", listingCtrl.getRecentListings);
listingRoutes.get("/slug-validator", listingCtrl.slugValidator);
listingRoutes.get("/get-listing/:id", listingCtrl.getListingById);
listingRoutes.get("/get-sibling-listings/:id", listingCtrl.getSiblingListings);

// ───────────── Agency Dashboard ─────────────
listingRoutes.get(
  "/my-agency-listings",
  isAuthenticated,
  isAgent,
  checkPermission("view_properties"),
  listingCtrl.getAgencyListings,
);
listingRoutes.get(
  "/agency-filtered-listings",
  isAuthenticated,
  isAgent,
  checkPermission("view_properties"),
  listingCtrl.getAgencyFilteredListings,
);
listingRoutes.get(
  "/get-listing-analytics/:listingId",
  isAuthenticated,
  isAgent,
  checkPermission("view_own_property_reports"),
  listingCtrl.getPropertyAnalytics,
);

// ───────────── Lifecycle ─────────────
listingRoutes.patch(
  "/update-listing-status/:id",
  isAuthenticated,
  isAgent,
  checkPermission("edit_property"),
  listingCtrl.updateListingStatus,
);
listingRoutes.post(
  "/relist-unit/:unitId",
  isAuthenticated,
  isAgent,
  checkPermission("publish_property"),
  listingCtrl.relistUnit,
);

export default listingRoutes;
