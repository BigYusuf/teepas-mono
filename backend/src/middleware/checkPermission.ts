import { Response, NextFunction } from "express";
import prisma from "../libs/prisma";

export const checkPermission = (permissionKey: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const agentId = req.agent?.id;
      const agencyId = req.agency?.id; // agency id

      if (!agentId || !agencyId) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
      }

      // Find the agent's active membership in the current agency
      const membership = await prisma.agencyMembership.findFirst({
        where: {
          agentId,
          agencyId,
          status: "ACTIVE",
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      if (!membership || !membership.role) {
        return res.status(403).json({ status: false, message: "Forbidden" });
      }

      // Check if the role has the required permission by key
      const hasPermission = membership.role.permissions.some(
        (rp: { permission: { key: string } }) =>
          rp.permission?.key === permissionKey,
      );

      if (!hasPermission) {
        return res.status(403).json({ status: false, message: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  };
};
