import { NextFunction, Request, Response } from "express";

import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error-handler";
import { imagekit } from "../../libs/imagekit";
import crypto from "crypto";
// import { sendNotifyEmail } from "../services/notification";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";

// get agency staffs
export const getAgencyStaffs = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const agencyId = req?.agent?.agency?.id;

  try {
    if (!agencyId) {
      return next(new NotFoundError("Agency not found for this agent"));
    }
    // Fetch all agents under this agency
    const agents = await prisma.agents.findMany({
      where: { agencyId, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isDeleted: true,
        status: true,
        role: { select: { name: true, description: true } },
      },
    });
    if (agents.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No staffs found for this agency.",
      });
    }
    return res
      .status(200)
      .json({ success: true, data: agents, message: "All staffs fetched" });
  } catch (error) {
    return next(error);
  }
};

// send invite to new agent
export const inviteAgent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agent?.agencyId;
    const inviter = req.agent;
    const { email, role } = req.body;

    if (!agencyId || !email) {
      return next(new ValidationError("Agency ID and email are required!"));
    }

    // 1️⃣ Validate agency
    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    // 2️⃣ Prevent inviting yourself
    if (inviter.email === email) {
      return next(new ValidationError("You cannot invite yourself!"));
    }

    // 3️⃣ Check if email already belongs to an agent
    const existingAgent = await prisma.agents.findUnique({
      where: { email },
    });

    if (existingAgent?.agencyId === agencyId) {
      return next(
        new ValidationError("This agent already belongs to your agency!"),
      );
    }

    // 4️⃣ Delete any expired invites to keep the table clean
    // await prisma.agencyInvites.deleteMany({
    //   where: { expiresAt: { lt: new Date() } },
    // });

    // 5️⃣ Prevent duplicate active invite
    const activeInvite = await prisma.agencyInvites.findFirst({
      where: {
        email,
        agencyId,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeInvite) {
      return next(
        new ValidationError("An active invite already exists for this agent!"),
      );
    }

    // 6️⃣ Generate token and expiry
    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 7️⃣ Create invite record
    await prisma.agencyInvites.create({
      data: {
        email,
        token,
        agencyId,
        role: role || null,
        expiresAt,
        invitedById: inviter.id,
      },
    });

    // 8️⃣ Build invite link
    const inviteLink = `${
      process.env.CLIENT_URL || "http://localhost:3001"
    }/signup?invite=${token}`;

    // 9️⃣ Send email to invited agent
    // await sendNotifyEmail(
    //   email,
    //   `You're invited to join ${agency.name}`,
    //   "agency-invitation",
    //   {
    //     name: "Agent",
    //     inviterName: req?.agent?.name || agency.name,
    //     agencyName: agency.name,
    //     inviteLink,
    //   },
    //   inviter.id,
    // );

    // // 🔔 Notify inviter (confirmation)
    // await sendNotifyEmail(
    //   inviter.email,
    //   `You have invited a new agent to join ${agency.name}`,
    //   "agency-invite-sent",
    //   {
    //     name: "Agent",
    //     inviterName: req?.agent?.name || agency.name,
    //     inviterId: inviter.id,
    //     agencyName: agency.name,
    //     agentEmail: email,
    //     manageLink: `${
    //       process.env.CLIENT_URL || "http://localhost:3001"
    //     }/staffs/invitations`,
    //     cancelLink: `${
    //       process.env.CLIENT_URL || "http://localhost:3001"
    //     }/staffs/invitations/cancel?token=${token}`,
    //     agentName: email,
    //   },
    // );

    return res.status(200).json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Error sending agent invite:", error);
    next(error);
  }
};

// ban or unban agent
export const toggleAgentStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.params;
    const { action } = req.body; // "ban" or "unban"
    const agencyId = req.agent.agencyId; // assuming req.agent is the logged-in agency member

    // 1️⃣ Prevent user from banning/unbanning themselves
    if (req.agent.id === agentId) {
      return res
        .status(400)
        .json({ message: "You cannot change your own status" });
    }

    // 2️⃣ Fetch the target agent
    const agent = await prisma.agents.findFirst({
      where: { id: agentId, agencyId },
      include: {
        ownedAgency: true, // check if this agent is the owner
      },
    });

    if (!agent) {
      return res
        .status(404)
        .json({ message: "Agent not found in your agency" });
    }

    // 3️⃣ Check if the target is the agency owner
    if (agent.ownedAgency) {
      return res.status(403).json({
        message: "You cannot change the status of the agency owner",
      });
    }

    // 4️⃣ Determine new status
    const newStatus =
      action === "ban"
        ? "SUSPENDED"
        : action === "unban"
          ? "ACTIVE"
          : agent.status;

    // 5️⃣ Update the agent
    const updatedAgent = await prisma.agents.update({
      where: { id: agent.id },
      data: { status: newStatus },
    });

    return res.json({
      message: `Agent ${action === "ban" ? "banned" : "unbanned"} successfully`,
      agent: updatedAgent,
    });
  } catch (error) {
    return next(error);
  }
};

// change agent roles in agency
export const updateAgentRole = async (req: any, res: Response) => {
  try {
    const { agentId } = req.params;
    const { roleName } = req.body; // roleId from roles table
    const agencyId = req.agent.agencyId;

    // Ensure the requester is part of the agency
    const requester = await prisma.agents.findUnique({
      where: { id: req.agent.id },
      include: { agency: { include: { owner: true } } },
    });

    if (!requester || requester.agencyId !== agencyId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Fetch target agent
    const target = await prisma.agents.findFirst({
      where: { id: agentId, agencyId },
      include: { role: true, agency: { include: { owner: true } } },
    });

    if (!target) {
      return res
        .status(404)
        .json({ message: "Agent not found in this agency" });
    }

    // ❌ Prevent changing owner’s role
    if (target.id === target.agency.ownerId) {
      return res
        .status(403)
        .json({ message: "You cannot change the owner's role" });
    }

    // ❌ Prevent agents from changing their own role
    if (target.id === requester.id) {
      return res
        .status(403)
        .json({ message: "You cannot change your own role" });
    }

    // Fetch the new role
    const newRole = await prisma.roles.findUnique({
      where: { name: roleName },
    });

    if (!newRole) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // ✅ Authorization rules
    const canManageTeam = await prisma.rolePermissions.findFirst({
      where: {
        roleId: requester.roleId,
        permission: { name: "manage_team" },
      },
    });

    if (!canManageTeam && requester.id !== requester.agency.ownerId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to change roles" });
    }

    // Update the role
    const updated = await prisma.agents.update({
      where: { id: target.id },
      data: { roleId: newRole?.id },
      include: { role: true },
    });

    // ───────────────────────────────
    // 🔔 NOTIFICATIONS
    // ───────────────────────────────

    // const agencyName = requester.agency.name;

    // // 1️⃣ Notify the agent (email + in-app)
    // await sendNotifyEmail(
    //   target.email,
    //   `Your role has been changed to ${newRole.name}`,
    //   "agent-role-updated",
    //   {
    //     name: target.name,
    //     newRole: newRole.name,
    //     agencyName,
    //     changedBy: requester.name,
    //   },
    // );

    // // 2️⃣ Notify the owner (email + in-app) — unless owner is the one who made the change
    // if (requester.id !== requester.agency.owner.id) {
    //   await sendNotifyEmail(
    //     requester.agency.owner.email,
    //     `An agent's role was changed in ${agencyName}`,
    //     "agent-role-updated-owner",
    //     {
    //       name: requester.agency.owner.name,
    //       changedAgent: target.name,
    //       newRole: newRole.name,
    //       changedBy: requester.name,
    //       agencyName,
    //     },
    //   );
    // }

    return res.json({
      message: "Agent role updated successfully",
      agent: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating agent role" });
  }
};
// remove agent from agency
export const removeAgentFromAgency = async (req: any, res: Response) => {
  try {
    const { agentId } = req.params;
    const requester = req.agent;
    const agencyId = requester.agencyId;

    if (!agencyId) {
      return res
        .status(400)
        .json({ message: "You are not part of any agency" });
    }

    // 🧩 Fetch agent + role info
    const agent = await prisma.agents.findFirst({
      where: { id: agentId, agencyId },
      include: { role: true },
    });

    if (!agent) {
      return res
        .status(404)
        .json({ message: "Agent not found or not part of your agency" });
    }

    // 🚫 Prevent removing yourself
    if (requester.id === agentId) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    // 🚫 Prevent removing owners
    if (agent.role?.name === "AGENCY_OWNER") {
      return res
        .status(403)
        .json({ message: "You cannot remove the agency owner" });
    }

    // 🚫 Prevent same-level removals
    if (requester.role?.name === agent.role?.name) {
      return res.status(403).json({
        message: "You cannot remove another agent with the same role",
      });
    }

    // ✅ Proceed with safe transaction
    await prisma.$transaction(async (tx: any) => {
      // Remove agent from agency
      await tx.agents.update({
        where: { id: agentId },
        data: {
          agencyId: null,
          roleId: null,
          status: "INACTIVE",
        },
      });

      // Clean up assignments (optional)
      await tx.properties.updateMany({
        where: { agentId },
        data: { agentId: null },
      });

      // // Log the removal
      // await tx.activityLogs.create({
      //   data: {
      //     actorId: requester.id,
      //     targetId: agent.id,
      //     agencyId,
      //     type: "AGENT_REMOVED",
      //     details: `Agent ${agent.name || agent.email} was removed from agency.`,
      //   },
      // });
    });

    // // 🔔 Notify the removed agent
    // await sendNotifyEmail(
    //   agent.email,
    //   `You have been removed from ${requester.agency?.name || "your agency"}`,
    //   "agent-removed-from-agency",
    //   {
    //     name: agent.name,
    //     agencyName: requester.agency?.name,
    //     removedBy: requester.name,
    //     date: new Date().toISOString(),
    //   },
    //   requester.id,
    // );

    // 🔔 Notify the agency owner
    const owner = await prisma.agents.findFirst({
      where: { agencyId, role: { name: "AGENCY_OWNER" } },
    });

    // if (owner) {
    //   await sendNotifyEmail(
    //     owner.email,
    //     `${agent.name || "An agent"} was removed from your agency`,
    //     "agent-removed-notification",
    //     {
    //       agentName: agent.name,
    //       name: owner.name,
    //       removedBy: requester.name,
    //       agencyName: requester.agency?.name,
    //       date: new Date().toISOString(),
    //     },
    //     requester.id,
    //   );
    // }

    return res.json({
      message: `✅ Agent ${agent.name || ""} removed from agency successfully`,
    });
  } catch (error) {
    console.error("Error removing agent:", error);
    return res
      .status(500)
      .json({ message: "❌ Error removing agent from agency" });
  }
};

// delete agency (soft delete)
export const deleteAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent?.id;

    // Find agent with agency
    const agent = await prisma.agents.findUnique({
      where: { id: agentId },
      include: { agency: true },
    });

    if (!agent || !agent.agency) {
      return next(new NotFoundError("Agent or Agency not found"));
    }

    // 28 days from now
    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 28);

    // Soft delete both agent and agency
    await prisma.$transaction([
      prisma.agents.update({
        where: { id: agentId },
        data: {
          isDeleted: true,
          deletedAt,
        },
      }),
      prisma.agencies.update({
        where: { id: agent.agency.id },
        data: {
          isDeleted: true,
          deletedAt,
        },
      }),
    ]);

    return res.status(200).json({
      message:
        "Agency and agent marked for deletion. Will be permanently removed in 28 days.",
    });
  } catch (error) {
    return next(error);
  }
};

// restore agency
export const restoreAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent?.id;

    // Find agent with agency
    const agent = await prisma.agents.findUnique({
      where: { id: agentId },
      include: { agency: true },
    });

    if (!agent || !agent.agency) {
      return next(new NotFoundError("Agent or Agency not found"));
    }

    if (!agent.isDeleted || !agent.deletedAt || !agent.agency.isDeleted) {
      return next(
        new ForbiddenError("Agent or Agency is not marked for deletion"),
      );
    }

    const now = new Date();
    const deletedAt = new Date(agent.deletedAt);

    if (now > deletedAt) {
      return next(
        new ForbiddenError(
          "Cannot restore. The 28-day recovery period has expired.",
        ),
      );
    }

    // Restore both agent and Agency
    await prisma.$transaction([
      prisma.agents.update({
        where: { id: agentId },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      }),
      prisma.agencies.update({
        where: { id: agent.agency.id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      }),
    ]);

    return res.status(200).json({
      message: "Agency and agent have been successfully restored.",
    });
  } catch (error) {
    return next(error);
  }
};

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

// get my reviews - GET /agent/agency/reviews
export const getMyAgencyReviews = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await prisma.agents.findUnique({
      where: { id: req.agent?.id },
      select: { agencyId: true },
    });

    if (!agent?.agencyId) {
      return res.status(404).json({
        success: false,
        message: "No agency found for this agent.",
      });
    }

    const reviews = await prisma.agencyReviews.findMany({
      where: { agencyId: agent.agencyId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) /
          reviews.length
        : 0;

    res.status(200).json({
      success: true,
      avgRating,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// get team members - GET /agent/agency/team
export const getMyAgencyTeam = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await prisma.agents.findUnique({
      where: { id: req.agent?.id },
      select: { agencyId: true },
    });

    if (!agent?.agencyId) {
      return res.status(404).json({
        success: false,
        message: "No agency found for this agent.",
      });
    }

    const team = await prisma.agents.findMany({
      where: { agencyId: agent.agencyId },
      include: {
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      team,
      count: team.length,
    });
  } catch (error) {
    next(error);
  }
};

// update avatar & cover photo
export const updateProfilePictures = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { editType, imageUrl } = req.body;

    if (!editType || !imageUrl) {
      return next(new ValidationError("Missing required fields!"));
    }

    // Ensure the user is authenticated
    if (!req.agent?.id) {
      return next(new AuthError("Only agents can update profile pictures!"));
    }

    // Determine update field (avatar or cover)
    const updateField =
      editType === "cover" ? { coverBanner: imageUrl } : { avatar: imageUrl };

    // Update agent's profile
    const updatedAgent = await prisma.agencies.update({
      where: { ownerId: req.agent.id },
      data: updateField,
      select: {
        id: true,
        avatar: true,
        coverBanner: true,
      },
    });

    // ✅ Auto-complete task
    await markTaskCompleted(req.agent?.id, "agency-image");

    res.status(200).json({
      success: true,
      message: `${
        editType === "cover" ? "Cover photo" : "Avatar"
      } updated successfully!`,
      updatedAgent,
    });
  } catch (error) {
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
    await markTaskCompleted(req.agent.id, "update-avatar");

    res.status(200).json({
      success: true,
      message: "Agent avatar updated successfully!",
      updatedAgent,
    });
  } catch (error) {
    return next(error);
  }
};

// edit agent profile
export const editAgentProfile = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      openingHours,
      website,
      socialLinks,
      email,
      phone,
      commissionRate,
      servicesOffered,
      yearEstablished,
      businessRegNumber,
      taxId,
    } = req.body;

    if (!name || !bio || !openingHours) {
      return next(new ValidationError("Please fill all the required fields!"));
    }

    if (!req.agent?.id) {
      return next(new AuthError("Only agents can edit their profile!"));
    }

    const existingAgency = await prisma.agencies.findUnique({
      where: { ownerId: req.agent.id },
    });

    if (!existingAgency) {
      return next(new ValidationError("Agency not found for this agent!"));
    }

    // Track which tasks should be marked as completed
    const tasksToMark: string[] = [];

    // Compare fields before updating
    if (email && email !== existingAgency.email)
      tasksToMark.push("agency-contact");
    if (phone && phone !== existingAgency.phone)
      tasksToMark.push("agency-contact");
    if (commissionRate && commissionRate !== existingAgency.commissionRate)
      tasksToMark.push("agency-details");
    if (
      servicesOffered &&
      JSON.stringify(servicesOffered) !==
        JSON.stringify(existingAgency.servicesOffered)
    )
      tasksToMark.push("agency-details");
    if (yearEstablished && yearEstablished !== existingAgency.yearEstablished)
      tasksToMark.push("agency-details");
    if (
      businessRegNumber &&
      businessRegNumber !== existingAgency.businessRegNumber
    )
      tasksToMark.push("agency-details");
    if (taxId && taxId !== existingAgency.taxId)
      tasksToMark.push("agency-details");

    // Update agency data
    const updatedAgency = await prisma.agencies.update({
      where: { ownerId: req.agent.id },
      data: {
        name,
        bio,
        openingHours,
        website,
        socialLinks,
        email,
        phone,
        commissionRate,
        servicesOffered,
        yearEstablished,
        businessRegNumber,
        taxId,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        addresses: true,
        openingHours: true,
        website: true,
        socialLinks: true,
        email: true,
        phone: true,
        commissionRate: true,
        servicesOffered: true,
        yearEstablished: true,
        businessRegNumber: true,
        taxId: true,
        avatar: true,
        coverBanner: true,
        logoUrl: true,
        updatedAt: true,
      },
    });

    // ✅ Mark only tasks whose fields were updated
    for (const taskKey of tasksToMark) {
      await markTaskCompleted(req.agent.id, taskKey);
    }

    res.status(200).json({
      success: true,
      message: "Agency profile updated successfully!",
      updatedAgency,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /agent/agency/performance
// GET /agent/agency/performance
export const getMyAgencyPerformance = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await prisma.agents.findUnique({
      where: { id: req.agent?.id },
      select: { agencyId: true },
    });

    if (!agent?.agencyId) {
      return res.status(404).json({
        success: false,
        message: "No agency found for this agent.",
      });
    }

    // Fetch all agents in the same agency
    const agencyAgents = await prisma.agents.findMany({
      where: { agencyId: agent.agencyId },
      select: { id: true },
    });

    const agentIds = agencyAgents.map((a: any) => a.id);

    // Count related data
    const [propertiesCount, applicationsCount, transactionsCount, leadsCount] =
      await Promise.all([
        prisma.properties.count({ where: { agencyId: agent.agencyId } }),
        prisma.propertyApplications.count({
          where: { agencyId: agent.agencyId },
        }),
        prisma.propertyTransactions.count({
          where: { agencyId: agent.agencyId },
        }),
        prisma.conversationGroup.count({
          where: {
            participantIds: { hasSome: agentIds }, // any agent in the conversation
          },
        }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProperties: propertiesCount,
        totalApplications: applicationsCount,
        totalTransactions: transactionsCount,
        totalLeads: leadsCount,
      },
    });
  } catch (error) {
    next(error);
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    const agentId = req.agent.id;

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
  } catch (error) {}
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

// Helper function to upload base64 file to ImageKit
const uploadFile = async (file: string, name: string, agencyId: string) => {
  if (!file) return null;
  const uploadResponse = await imagekit.upload({
    file,
    fileName: `${agencyId}_${name}_${Date.now()}`,
    folder: `/agency-documents/${agencyId}`,
  });
  return uploadResponse.url;
};

/**
 * Upload or update agency documents (with ImageKit)
 */
export const uploadAgencyDocuments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      agencyId,
      businessCertificate,
      proofOfAddress,
      ownerIdCard,
      insuranceDocument,
      signedAgreement,
    } = req.body;

    if (!agencyId) {
      return next(new ValidationError("Agency ID is required!"));
    }

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    // Upload files if provided
    const uploadedDocs: any = {};
    if (businessCertificate)
      uploadedDocs.businessCertificate = await uploadFile(
        businessCertificate,
        "businessCertificate",
        agencyId,
      );
    if (proofOfAddress)
      uploadedDocs.proofOfAddress = await uploadFile(
        proofOfAddress,
        "proofOfAddress",
        agencyId,
      );
    if (ownerIdCard)
      uploadedDocs.ownerIdCard = await uploadFile(
        ownerIdCard,
        "ownerIdCard",
        agencyId,
      );
    if (insuranceDocument)
      uploadedDocs.insuranceDocument = await uploadFile(
        insuranceDocument,
        "insuranceDocument",
        agencyId,
      );
    if (signedAgreement)
      uploadedDocs.signedAgreement = await uploadFile(
        signedAgreement,
        "signedAgreement",
        agencyId,
      );

    // Check if documents already exist
    const existing = await prisma.agencyDocuments.findUnique({
      where: { agencyId },
    });

    let document;
    if (existing) {
      document = await prisma.agencyDocuments.update({
        where: { agencyId },
        data: { ...uploadedDocs },
      });
    } else {
      document = await prisma.agencyDocuments.create({
        data: {
          agencyId,
          ...uploadedDocs,
        },
      });
    }

    // ✅ Auto-complete task
    await markTaskCompleted(agency?.ownerId, "agency-documents");

    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully!",
      document,
    });
  } catch (error) {
    console.error("Document upload failed:", error);
    next(error);
  }
};

/**
 * Get all agency documents (admin)
 */
export const getAllAgencyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const documents = await prisma.agencyDocuments.findMany({
      orderBy: { createdAt: "desc" },
      include: { agency: true },
    });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get documents by agencyId
 */
export const getAgencyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

    const document = await prisma.agencyDocuments.findUnique({
      where: { agencyId },
    });

    if (!document) {
      return next(new ValidationError("Agency documents not found!"));
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin verify agency documents
 */
export const verifyAgencyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

    const existing = await prisma.agencyDocuments.findUnique({
      where: { agencyId },
    });
    if (!existing) return next(new ValidationError("Documents not found!"));

    const updated = await prisma.agencyDocuments.update({
      where: { agencyId },
      data: {
        verifiedByAdmin: true,
        verifiedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Agency documents verified successfully!",
      document: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all agency documents (e.g. if agency removed)
 */
export const deleteAgencyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

    const existing = await prisma.agencyDocuments.findUnique({
      where: { agencyId },
    });
    if (!existing) return next(new ValidationError("Documents not found!"));

    await prisma.agencyDocuments.delete({
      where: { agencyId },
    });

    res.status(200).json({
      success: true,
      message: "Agency documents deleted successfully!",
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
    const agencyId = req.agent?.agency.id;

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
    const agencyId = req.agent?.agency.id;

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
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

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
