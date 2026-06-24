import express, { Router } from "express";
import {

} from "./credit.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAgent } from "../../middleware/authorizeRoles";

const creditRoutes: Router = express.Router();

export default creditRoutes;
