import { NextFunction, Request, Response } from "express";

import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error-handler";
import { imagekit } from "../../libs/imagekit";
// import { sendNotifyEmail } from "../services/notification";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";
import { getPagination, getPaginationMeta } from "../../utils/paginations";

// Upload Image
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file || !fileName || !folder) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields!" });
    }

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    return res.status(201).json({
      success: true,
      file_id: uploadResponse.fileId,
      url: uploadResponse.url,
    });
  } catch (error) {
    console.error("Image Upload Failed:", error);
    return next(error);
  }
};

export const updateAgentAvatar = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return next(new ValidationError("Missing imageUrl!"));
    }

    if (!req.agent?.id) {
      return next(new AuthError("Only agents can update their avatar!"));
    }

    const updatedAgent = await prisma.agents.update({
      where: { id: req.agent.id },
      data: { avatar: imageUrl },
      select: { id: true, avatar: true },
    });

    // ✅ Mark task as completed
    await markTaskCompleted(
      { agentId: req.agent.id },
      "UPLOAD_PROFILE_PICTURE",
    );

    res.status(200).json({
      success: true,
      message: "Agent avatar updated successfully!",
      updatedAgent,
    });
  } catch (error) {
    return next(error);
  }
};

// get agent (public preview)
export const getAgentInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agency = await prisma.agencies.findUnique({
      where: { id: req.params.id },
    });

    const followersCount = await prisma.followers.count({
      where: { agencyId: agency?.id },
    });

    res.status(201).json({
      success: true,
      agency,
      followersCount,
    });
  } catch (error) {
    next(error);
  }
};

// get agent properties (public preview)
export const getAgentProperties = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: {
          // starting_date: null,
          agencyId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
          agency: true,
        },
      }),

      prisma.properties.count({
        where: {
          // starting_date: null,
          agencyId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      properties,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// get agent events (public preview)
export const getAgentEvents = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [properties, total] = await Promise.all([
      prisma.properties.findMany({
        where: {
          // starting_date: {
          //   not: null,
          // },
          agencyId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
        },
      }),

      prisma.properties.count({
        where: {
          // starting_date: null,
          agencyId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      properties,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

// follow a agency
export const followAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.body;

    if (!agencyId) {
      return next(new ValidationError("Agency id is required!"));
    }

    // Check if already followed
    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        agencyId,
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "Already following this agency",
      });
    }

    // Create new follow
    const follow = await prisma.followers.create({
      data: {
        userId: req.user?.id,
        agencyId,
      },
    });

    res.status(201).json({
      success: true,
      follow,
    });
  } catch (error) {
    next(error);
  }
};

// unfollow a agency
export const unfollowAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.body;

    if (!agencyId) {
      return next(new ValidationError("Agency id is required!"));
    }

    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        agencyId,
      },
    });

    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this agency.",
      });
    }

    await prisma.followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the agency.",
    });
  } catch (error) {
    next(error);
  }
};

// is following
export const isFollowing = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.params.id;
    if (!agencyId) {
      return next(new ValidationError("Agency id is required!"));
    }

    const isFollowing = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        agencyId,
      },
    });

    res.status(200).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

// fetching notifications for agents
export const agentNotifications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent?.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: agentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// mark notification as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError("Notification id is required!"));
    }

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// 📋 Get All Bank Accounts for an Agency
export const getAgencyBankAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

    if (!agencyId) return next(new ValidationError("Agency ID is required!"));

    const accounts = await prisma.agencyBankAccounts.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    next(error);
  }
};

// 🔍 Get Single Bank Account
export const getAgencyBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const account = await prisma.agencyBankAccounts.findUnique({
      where: { id },
    });

    if (!account) return next(new ValidationError("Bank account not found!"));

    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Update Bank Account
export const updateAgencyBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { bankName, accountName, accountNumber, currency, isPrimary } =
      req.body;

    const existing = await prisma.agencyBankAccounts.findUnique({
      where: { id },
    });
    if (!existing) return next(new ValidationError("Bank account not found!"));

    if (isPrimary) {
      // Unset all other primary accounts for this agency
      await prisma.agencyBankAccounts.updateMany({
        where: { agencyId: existing.agencyId },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.agencyBankAccounts.update({
      where: { id },
      data: {
        bankName,
        accountName,
        accountNumber,
        currency,
        isPrimary,
      },
    });

    res.status(200).json({
      success: true,
      account: updated,
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Delete Bank Account
export const deleteAgencyBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.agencyBankAccounts.findUnique({
      where: { id },
    });

    if (!existing) return next(new ValidationError("Bank account not found!"));

    await prisma.agencyBankAccounts.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Bank account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 🌟 Set Primary Account
export const setPrimaryAgencyBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const account = await prisma.agencyBankAccounts.findUnique({
      where: { id },
    });

    if (!account) return next(new ValidationError("Bank account not found!"));

    // Unset all others
    await prisma.agencyBankAccounts.updateMany({
      where: { agencyId: account.agencyId },
      data: { isPrimary: false },
    });

    const updated = await prisma.agencyBankAccounts.update({
      where: { id },
      data: { isPrimary: true },
    });

    res.status(200).json({
      success: true,
      account: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Get all property applications for an agency
export const getAgencyApplications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req?.agency.id;

    const applications = await prisma.propertyApplications.findMany({
      where: { agencyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, pricing: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// Approve a user’s application
export const approveApplication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const agencyId = req?.agency.id;

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
    });

    if (!application) {
      return next(new ValidationError("Application not found."));
    }

    if (application.agencyId !== agencyId) {
      return next(
        new ValidationError(
          "You are not authorized to modify this application.",
        ),
      );
    }

    const updated = await prisma.propertyApplications.update({
      where: { id },
      data: {
        agencyStatus: "APPROVED",
        overallStatus: "APPROVED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Application approved successfully.",
      updated,
    });
  } catch (error) {
    next(error);
  }
};

// Reject a user’s application
export const rejectApplication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const agencyId = req.agency.id;

    const application = await prisma.propertyApplications.findUnique({
      where: { id },
    });

    if (!application) {
      return next(new ValidationError("Application not found."));
    }

    if (application.agencyId !== agencyId) {
      return next(
        new ValidationError(
          "You are not authorized to modify this application.",
        ),
      );
    }

    const updated = await prisma.propertyApplications.update({
      where: { id },
      data: {
        agencyStatus: "REJECTED",
        overallStatus: "REJECTED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      updated,
    });
  } catch (error) {
    next(error);
  }
};

// get agency analytics
export const getAgencyAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agency.id;

    const analytics = await prisma.agencyAnalytics.findFirst({
      where: { agencies: { some: { id: agencyId } } },
    });

    if (!analytics) {
      return res
        .status(404)
        .json({ message: "No analytics found for this agency." });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalVisitors: analytics.totalVisitors,
        countryStats: analytics.countryStats || {},
        cityStats: analytics.cityStats || {},
        deviceStats: analytics.deviceStats || {},
        lastVisitedAt: analytics.lastVisitedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🧠 Get tasks with agent progress
export const getAgentTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res
        .status(400)
        .json({ success: false, message: "agentId is required" });
    }

    // Fetch all tasks
    const tasks = await prisma.tasks.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Fetch agent progress
    const progress = await prisma.agentTaskProgress.findMany({
      where: { agentId },
      include: { task: true },
    });

    const completedIds = new Set(
      progress.filter((p: any) => p.completed).map((p: any) => p.taskId),
    );

    // Merge progress into task list
    const enrichedTasks = tasks.map((task: any) => ({
      ...task,
      status: completedIds.has(task.id) ? "completed" : "pending",
    }));

    const pending = enrichedTasks.filter((t: any) => t.status === "pending");
    const completed = enrichedTasks.filter(
      (t: any) => t.status === "completed",
    );

    res.status(200).json({
      success: true,
      data: {
        all: enrichedTasks,
        pending,
        completed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Mark task as completed
export const completeAgentTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId, taskId } = req.body;

    if (!agentId || !taskId) {
      return res
        .status(400)
        .json({ success: false, message: "agentId and taskId are required" });
    }

    const task = await prisma.tasks.findUnique({ where: { id: taskId } });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const existing = await prisma.agentTaskProgress.findFirst({
      where: { agentId, taskId },
    });

    let updated;
    if (existing) {
      updated = await prisma.agentTaskProgress.update({
        where: { id: existing.id },
        data: { completed: true, completedAt: new Date() },
      });
    } else {
      updated = await prisma.agentTaskProgress.create({
        data: { agentId, taskId, completed: true, completedAt: new Date() },
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
