import { Response, NextFunction } from "express";
import prisma from "../libs/prisma";

export const checkPermission = (permissionName: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const agentId = req.agent?.id; // set by your auth middleware
      if (!agentId) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
      }

      // Fetch agent with role and nested permissions
      const agent = await prisma.agents.findUnique({
        where: { id: agentId },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }, // <-- important!
              },
            },
          },
        },
      });

      if (!agent || !agent.role) {
        return res.status(403).json({ status: false, message: "Forbidden" });
      }

      // Check if the role has the required permission
      const hasPermission = agent.role.permissions?.some(
        (rp: { permission: { name: string } }) =>
          rp.permission?.name === permissionName,
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
