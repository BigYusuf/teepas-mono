import express, { Router } from "express";
import isAuthenticated from "../../middleware/isAuthenticated";
import { getRecommendedListings } from "./recommendation.controller";

const recommendationRoutes: Router = express.Router();

recommendationRoutes.get(
  "/get-recommended-listings",
  isAuthenticated,
  getRecommendedListings,
);

export default recommendationRoutes;
