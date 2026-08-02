import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

import { HTTPSTATUS } from "./shared/configs/http.config";
import { config } from "./shared/configs/app.config";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorMiddleware } from "./error-handler/error-middleware";
import addressRoutes from "./modules/address/address.routes";
import authRoutes from "./modules/auth/auth.routes";
import inviteRoutes from "./modules/invites/invites.routes";
import membershipRoutes from "./modules/memberships/memberships.routes";
import agencyRoutes from "./modules/agency/agency.routes";
import agentRoutes from "./modules/agents/agent.routes";
import propertyRoutes from "./modules/property/property.routes";
import chatRoutes from "./modules/chat/chat.routes";
// import recommendationRoutes from "./modules/recommendations/recommendation.route";
// import propertyRoutes from "./modules/property/property.routes";
// import orderRoutes from "./modules/order/order.route";
// import creditRoutes from "./modules/credit/credit.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment-based configuration
const isProduction = process.env.NODE_ENV === "production";

// Production-safe CORS configuration
const allowedOrigins = isProduction
  ? [
      "https://teepas.com",
      "https://agency.teepas.com",
      "https://admin.teepas.com",
      "http://nginx",
      "http://localhost",
    ]
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    credentials: true,
  }),
);
// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Simplified rate limit - auth should be handled by individual services
  message: { error: "Too many requests, please try again later!" },
  standardHeaders: true,
  legacyHeaders: false, // Disable legacy headers in production
  keyGenerator: (req: any) => ipKeyGenerator(req.ip), // ← handles both IPv4 and IPv6
  skip: (req) => req.path === "/api/v1/health",
});

app.use(limiter);
// Use appropriate logging for production
app.use(morgan(isProduction ? "combined" : "dev"));

app.use(express.json({ limit: "50mb" })); // Reduced from 100mb for security
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Health routes
app.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Teepas is READY and running",
      status: "OK",
    });
  }),
);

app.get(
  "/api/v1/health",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Service is healthy",
      status: "OK",
    });
  }),
);

console.log(`🔗 CORS Origins: ${JSON.stringify(allowedOrigins)}`);
// Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/agencies`, agencyRoutes);
app.use(`${BASE_PATH}/agents`, agentRoutes);
app.use(`${BASE_PATH}/address`, addressRoutes); // address
app.use(`${BASE_PATH}/memberships`, membershipRoutes); // memberships
app.use(`${BASE_PATH}/invites`, inviteRoutes); // invites
// app.use(`${BASE_PATH}/recommendations`, recommendationRoutes); // recommendations
app.use(`${BASE_PATH}/properties`, propertyRoutes); // property routes
app.use(`${BASE_PATH}/chatting`, chatRoutes); // chatting routes
// app.use(`${BASE_PATH}/orders`, orderRoutes);
// app.use(`${BASE_PATH}/credits`, creditRoutes);
// Error handler (always last)
app.use(errorMiddleware);

export default app;
