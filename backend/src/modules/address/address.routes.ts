import express, { Router } from "express";
import * as addressCtrl from "./address.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAdmin, isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const addressRoutes: Router = express.Router();

addressRoutes.post(
  "/create-agency-address",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency_addresses"),
  addressCtrl.createAgencyAddress,
);
addressRoutes.get(
  "/get-all-agency-addresses",
  isAuthenticated,
  isAgent,
  checkPermission("view_agency_addresses"),
  addressCtrl.getAgencyAddresses,
);
addressRoutes.get(
  "/get-agency-address/:id",
  isAuthenticated,
  isAgent,
  checkPermission("view_agency_addresses"),
  addressCtrl.getAgencyAddressById,
);
addressRoutes.put(
  "/update-agency-address/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency_addresses"),
  addressCtrl.updateAgencyAddress,
);
addressRoutes.delete(
  "/delete-agency-address/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency_addresses"),
  addressCtrl.deleteAgencyAddress,
);
addressRoutes.put(
  "/set-default-agency-address/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_agency_addresses"),
  addressCtrl.setDefaultAgencyAddress,
);

addressRoutes.get(
  "/shipping-addresses",
  isAuthenticated,
  addressCtrl.getUserAddresses,
);
addressRoutes.post("/add-address", isAuthenticated, addressCtrl.addUserAddress);
addressRoutes.delete(
  "/delete-address/:addressId",
  isAuthenticated,
  addressCtrl.deleteUserAddress,
);

export default addressRoutes;
