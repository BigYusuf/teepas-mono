
import { NextFunction, Response } from "express";
import { AuthError } from "../error-handler";

export const isAgent = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "agent") {
    return next(new AuthError("Access denied: Agent only"));
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return next(new AuthError("Access denied: Admin only"));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthError("Access denied: Agent only"));
  }
  next();
};
