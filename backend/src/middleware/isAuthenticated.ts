import prisma from "../libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["agent-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "agent" | "admin";
      membershipId?: string;
      agencyId?: string;
    };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    let account;

    if (decoded.role === "user") {
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = user;
      req.role = "user";
      return next();
    }
    if (decoded.role === "admin") {
      const admin = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = admin;
      req.role = "user";
      return next();
    }
    if (decoded.role === "agent") {
      const agent = await prisma.agents.findUnique({
        where: { id: decoded.id },
        include: {
          memberships: {
            where: { id: decoded?.membershipId, agencyId: decoded?.agencyId },

            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },

              agency: {
                include: {
                  addresses: true,
                  bankAccounts: true,
                  agencyCredits: true,
                  documents: true,
                },
              },
            },
          },
        },
      });
      // If agent has an agency but no agencyCredits, create one

      if (!agent) {
        return res.status(401).json({ message: "Agent not found!" });
      }
      req.role = "agent";
      req.agent = agent;
      req.membership = agent.memberships[0];
      req.agency = agent.memberships[0].agency;
      req.permissions = agent.memberships[0].role.permissions.map(
        (p: any) => p.permission.key,
      );
      return next();
    }

    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export default isAuthenticated;
