import express, { Router } from "express";
import isAuthenticated from "../../middleware/isAuthenticated";
import { getRecommendedProperties } from "./recommendation-controller";

const recommendationRoutes: Router = express.Router();

recommendationRoutes.get(
  "/get-recommendation-properties",
  isAuthenticated,
  getRecommendedProperties,
);

export default recommendationRoutes;
