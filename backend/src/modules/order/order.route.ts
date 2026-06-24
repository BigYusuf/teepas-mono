import isAuthenticated from "../../middleware/isAuthenticated";
import express, { Router } from "express";
import {
  // createPaymentIntent,
  // createPaymentSession,
  // getAdminOrders,
  // getOrderDetails,
  // getSellerOrders,
  // getUserOrders,
  // updateDeliveryStatus,
  // verifyCouponCode,
  // verifyingPaymentSession,
} from "./order.controller";
import { isAdmin, isAgent } from "../../middleware/authorizeRoles";

const orderRoutes: Router = express.Router();

// orderRoutes.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
// orderRoutes.post("/create-payment-session", isAuthenticated, createPaymentSession);
// orderRoutes.get(
//   "/verifying-payment-session",
//   isAuthenticated,
//   verifyingPaymentSession
// );
// orderRoutes.get("/get-seller-orders", isAuthenticated, isSeller, getSellerOrders);
// orderRoutes.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
// orderRoutes.put(
//   "/update-status/:orderId",
//   isAuthenticated,
//   isSeller,
//   updateDeliveryStatus
// );
// orderRoutes.put("/verify-coupon", isAuthenticated, verifyCouponCode);
// orderRoutes.get("/get-user-orders", isAuthenticated, getUserOrders);
// orderRoutes.get("/get-admin-orders", isAuthenticated, isAdmin, getAdminOrders);

export default orderRoutes;
