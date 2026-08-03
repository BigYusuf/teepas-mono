import express, { Router } from "express";

import * as eventCtrl from "./event.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";
import { checkPermission } from "../../middleware/checkPermission";

const eventRoutes: Router = express.Router();

eventRoutes.post(
  "/create-event",
  isAuthenticated,
  isAgent,
  checkPermission("create_marketing_events"),
  eventCtrl.createEvent,
);
eventRoutes.get("/list-events", eventCtrl.listEvents); // public
eventRoutes.get("/get-event/:id", eventCtrl.getEventById); // public
eventRoutes.get(
  "/get-agency-events",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.getAgencyEvents,
);
eventRoutes.patch(
  "/update-event/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.updateEvent,
);
eventRoutes.patch(
  "/end-event/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.endEvent,
);
eventRoutes.delete(
  "/delete-event/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.deleteEvent,
);

eventRoutes.post(
  "/link-properties-to-events/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.linkPropertiesToEvent,
);
eventRoutes.delete(
  "/unlink-property-from-event/:id/properties/:propertyId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.unlinkPropertyFromEvent,
);

eventRoutes.post(
  "/add-event-image/:id",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.addEventImage,
);
eventRoutes.delete(
  "/delete-event-image/:imageId",
  isAuthenticated,
  isAgent,
  checkPermission("manage_marketing_events"),
  eventCtrl.deleteEventImage,
);

export default eventRoutes;
