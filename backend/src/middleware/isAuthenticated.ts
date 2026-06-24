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
    };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    let account;

    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "agent") {
      account = await prisma.agents.findUnique({
        where: { id: decoded.id },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }, // <-- important!
              },
            },
          },
          agency: {
            include: {
              addresses: true,
              bankAccounts: true,
              followers: true,
              agencyCredits: true,
            },
          },
        },
      });
      // If agent has an agency but no agencyCredits, create one
      if (account?.agency && !account.agency.agencyCredits) {
        const newCredits = await prisma.agencyCredits.create({
          data: {
            agencyId: account.agency.id,
            balance: 0,
          },
        });

        // Attach it to the response so you don’t need to re-fetch
        account.agency.agencyCredits = newCredits;
      }
      req.agent = account;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export default isAuthenticated;
