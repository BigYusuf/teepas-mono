import express, { Router } from "express";
import * as authCtrl from "./auth.controller";
import isAuthenticated from "../../middleware/isAuthenticated";
import { isAdmin, isAgent } from "../../middleware/authorizeRoles";

const authRoutes: Router = express.Router();

authRoutes.get("/get-all-amenities", authCtrl.getAllAmenities);
authRoutes.post("/user-registration", authCtrl.userRegistration);
authRoutes.post("/verify-user", authCtrl.verifyUser);
authRoutes.post("/login-user", authCtrl.loginUser);
authRoutes.get("/logout-user", isAuthenticated, authCtrl.logOutUser);
authRoutes.post("/refresh-token", authCtrl.refreshToken);
authRoutes.get("/lPYHH;DIUFY6ogged-in-user", isAuthenticated, authCtrl.getUser);
authRoutes.post("/forgot-password-user", authCtrl.userForgotPassword);
authRoutes.post("/reset-password-user", authCtrl.resetUserPassword);
authRoutes.post("/verify-forgot-password-user", authCtrl.verifyUserForgotPassword);
authRoutes.post("/agent-registration", authCtrl.registerAgent);
authRoutes.post("/verify-agent", authCtrl.verifyAgent);
authRoutes.post("/create-agency-bank", authCtrl.createAgencyBankAccount);
authRoutes.post("/login-agent", authCtrl.loginAgent);
authRoutes.get("/logout-agent", isAuthenticated, isAgent, authCtrl.logOutAgent);
authRoutes.post("/login-admin", authCtrl.loginAdmin);
authRoutes.get("/logout-admin", isAuthenticated, authCtrl.logOutAdmin);
authRoutes.get(
  "/logged-in-agent",
  isAuthenticated,
  isAgent,
  authCtrl.getAgent,
);
authRoutes.get("/logged-in-admin", isAuthenticated, isAdmin, authCtrl.getAdmin);
authRoutes.post("/change-password", isAuthenticated, authCtrl.updateUserPassword);
authRoutes.get("/get-layouts", authCtrl.getLayoutData);

export default authRoutes;
