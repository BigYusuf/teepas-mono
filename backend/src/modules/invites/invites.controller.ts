import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";

import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";
import { getPagination, getPaginationMeta } from "../../utils/paginations";
import { issueAuthTokens } from "../auth/auth.services";
import { generateToken } from "../../common/helper/generate.keys";

// send invite to new agent
export const inviteAgent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inviter = req.agent;
    const { email, roleId } = req.body;

    const agencyId = req.agency?.id;

    if (!agencyId || !email || !roleId) {
      return next(new ValidationError("Agency, email and role are required!"));
    }

    // Validate agency
    const agency = await prisma.agencies.findUnique({
      where: {
        id: agencyId,
      },
    });

    if (!agency) {
      return next(new ValidationError("Agency not found!"));
    }

    // Validate role belongs to agency
    const agencyRole = await prisma.agencyRoles.findFirst({
      where: {
        id: roleId,
        agencyId,
      },
    });

    if (!agencyRole) {
      return next(new ValidationError("Invalid role selected."));
    }

    // Prevent inviting yourself
    if (inviter.email.toLowerCase() === email.toLowerCase()) {
      return next(new ValidationError("You cannot invite yourself!"));
    }

    // Check if agent already exists
    const existingAgent = await prisma.agents.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        memberships: true,
      },
    });

    if (existingAgent) {
      const alreadyMember = existingAgent.memberships.some(
        (membership) =>
          membership.agencyId === agencyId && membership.status !== "INACTIVE",
      );

      if (alreadyMember) {
        return next(
          new ValidationError("This agent already belongs to your agency!"),
        );
      }
    }

    // Remove expired invites (optional)
    // await prisma.agencyInvites.updateMany({
    //   where: {
    //     expiresAt: { lt: new Date() },
    //     status: "PENDING",
    //   },
    //   data: {
    //     status: "EXPIRED",
    //   },
    // });

    // Check active invite
    const activeInvite = await prisma.agencyInvites.findFirst({
      where: {
        email: email.toLowerCase(),
        agencyId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (activeInvite) {
      return next(
        new ValidationError(
          "An active invitation already exists for this email.",
        ),
      );
    }

    const token = generateToken();

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.agencyInvites.create({
      data: {
        email: email.toLowerCase(),
        token,
        agencyId,
        roleId,
        invitedById: inviter.id,
        expiresAt,
      },
    });

    const inviteLink = `${
      process.env.CLIENT_URL || "http://localhost:3001"
    }/signup?invite=${token}`;

    // await sendNotifyEmail(
    //   email,
    //   `You're invited to join ${agency.name}`,
    //   "agency-invitation",
    //   {
    //     name: "Agent",
    //     inviterName: inviter.name || agency.name,
    //     agencyName: agency.name,
    //     inviteLink,
    //   },
    //   inviter.id,
    // );

    // await sendNotifyEmail(
    //   inviter.email,
    //   `You have invited a new agent to join ${agency.name}`,
    //   "agency-invite-sent",
    //   {
    //     name: inviter.name,
    //     inviterName: inviter.name,
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

    return res.status(200).json({
      message: "Invitation sent successfully!",
    });
  } catch (error) {
    console.error("Error sending agent invite:", error);
    next(error);
  }
};

export const getInvitationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    const invite = await prisma.agencyInvites.findUnique({
      where: {
        token,
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!invite) {
      return next(new NotFoundError("Invitation not found."));
    }

    if (invite.status !== "PENDING") {
      return next(new ValidationError("Invitation is no longer valid."));
    }

    if (invite.expiresAt < new Date()) {
      return next(new ValidationError("Invitation has expired."));
    }

    const existingAgent = await prisma.agents.findUnique({
      where: {
        email: invite.email,
      },
      select: {
        id: true,
      },
    });

    return res.status(200).json({
      success: true,
      valid: true,
      agentExists: !!existingAgent,
      email: invite.email,
      agency: invite.agency,
      role: invite.role,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyInvitations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const where: any = {
      email: req.agent.email,
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const [invites, total] = await Promise.all([
      prisma.agencyInvites.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyInvites.count({ where }),
    ]);

    return res.json({
      success: true,
      pagination: getPaginationMeta(page, limit, total),
      invitations: invites,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password, name, phoneNumber, country, isMobile } = req.body;

    if (!token || !password) {
      return next(
        new ValidationError("Invitation token and password are required."),
      );
    }

    const invite = await prisma.agencyInvites.findUnique({
      where: {
        token,
      },
      include: {
        agency: true,
      },
    });

    if (!invite) {
      return next(new NotFoundError("Invitation not found."));
    }

    if (invite.status !== "PENDING") {
      return next(new ValidationError("Invitation has already been used."));
    }

    if (invite.expiresAt < new Date()) {
      return next(new ValidationError("Invitation has expired."));
    }

    let agent: any = await prisma.agents.findUnique({
      where: {
        email: invite.email,
      },
    });

    // Existing agent
    if (agent) {
      const isMatch = await bcrypt.compare(password, agent.password);

      if (!isMatch) {
        return next(new ValidationError("Incorrect password."));
      }
    }

    // New agent
    if (!agent) {
      if (!name || !phoneNumber || !country) {
        return next(
          new ValidationError("Name, phone number and country are required."),
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      agent = await prisma.agents.create({
        data: {
          name,
          email: invite.email,
          phoneNumber,
          country,
          password: hashedPassword,
        },
      });

      const tasks = await prisma.tasks.findMany();
      await prisma.agentTaskProgress.createMany({
        data: tasks.map((task) => ({
          agentId: agent.id,
          taskId: task.id,
        })),
      });
    }

    const alreadyMember = await prisma.agencyMembership.findFirst({
      where: {
        agencyId: invite.agencyId,
        agentId: agent.id,
      },
    });

    if (alreadyMember) {
      return next(new ValidationError("You already belong to this agency."));
    }

    const membership = await prisma.$transaction(async (tx) => {
      const membership = await tx.agencyMembership.create({
        data: {
          agencyId: invite.agencyId,
          roleId: invite.roleId,
          agentId: agent.id,
          invitedById: invite.invitedById,
        },
      });

      await tx.agencyInvites.update({
        where: {
          id: invite.id,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      return membership;
    });

    await markTaskCompleted(agent.id, "join-agency");

    const tokens = issueAuthTokens(
      res,
      {
        id: agent.id,
        role: "agent",
        agencyId: invite.agencyId,
        membershipId: membership.id,
      },
      isMobile,
    );

    // Notifications...
    //   // 7️⃣ 🆕 Notify the agency owner
    //   if (agency?.owner) {
    //     // await sendNotifyEmail(
    //     //   agency.owner.email,
    //     //   `New Agent Joined Your Agency`,
    //     //   "new-agent-joined-agency", // 👈 create this email template
    //     //   {
    //     //     ownerName: agency.owner.name,
    //     //     agentName: newAgent.name,
    //     //     agentEmail: newAgent.email,
    //     //     agencyName: agency.name,
    //     //     roleName: role.name,
    //     //     dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
    //     //   },
    //     //   agency.owner.id
    //     // );
    //     // await sendEmail(
    //     //   agency.owner.email,
    //     //   `New Agent Joined Your Agency`,
    //     //   "new-agent-joined-agency", // 👈 create this email template
    //     //   {
    //     //     ownerName: agency.owner.name,
    //     //     agentName: newAgent.name,
    //     //     agentEmail: newAgent.email,
    //     //     agencyName: agency.name,
    //     //     roleName: role.name,
    //     //     dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
    //     //   }
    //     // );
    //   }

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully.",
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { invitationId } = req.params;

    const invite = await prisma.agencyInvites.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invite) {
      return next(new NotFoundError("Invitation not found."));
    }

    // if (invite.email !== req.agent.email) {
    //   return next(new ForbiddenError("Unauthorized."));
    // }

    if (invite.status !== "PENDING") {
      return next(
        new ValidationError("Invitation has already been processed."),
      );
    }

    await prisma.agencyInvites.update({
      where: {
        id: invite.id,
      },
      data: {
        status: "DECLINED",
      },
    });

    // Notifications...

    return res.json({
      success: true,
      message: "Invitation rejected.",
    });
  } catch (error) {
    next(error);
  }
};

export const listAgencyInvitations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agency?.id;

    if (!agencyId) {
      return next(new NotFoundError("No agency selected."));
    }
    const { page, limit, skip } = getPagination(req.query);

    const where: any = {
      agencyId,
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.search) {
      where.email = {
        contains: req.query.search,
        mode: "insensitive",
      };
    }

    const [invitations, total] = await Promise.all([
      prisma.agencyInvites.findMany({
        where,
        include: {
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyInvites.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      invitations,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getAgencyInvitation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { invitationId } = req.params;

    const invitation = await prisma.agencyInvites.findFirst({
      where: {
        id: invitationId,
        agencyId: req.agency.id,
      },
      include: {
        role: true,
      },
    });

    if (!invitation) {
      return next(new NotFoundError("Invitation not found."));
    }

    return res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeInvitation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { invitationId } = req.params;
    const agencyId = req?.agency?.id;
    if (!agencyId) {
      return next(new NotFoundError("Agency not found for this agent"));
    }
    const invitation = await prisma.agencyInvites.findFirst({
      where: {
        id: invitationId,
        agencyId,
      },
    });

    if (!invitation) {
      return next(new NotFoundError("Invitation not found."));
    }

    if (invitation.status !== "PENDING") {
      return next(
        new ValidationError("Only pending invitations can be revoked."),
      );
    }

    await prisma.agencyInvites.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "REVOKED",
      },
    });

    // await sendNotifyEmail(
    //   invitation.email,
    //   "Invitation Revoked",
    //   "agency-invitation-revoked",
    //   {
    //     agencyName: req.agency.name,
    //   },
    //   req.agent.id,
    // );

    return res.status(200).json({
      success: true,
      message: "Invitation revoked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const resendInvitation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { invitationId } = req.params;

    const invitation = await prisma.agencyInvites.findFirst({
      where: {
        id: invitationId,
        agencyId: req.agency.id,
      },
      include: {
        agency: true,
      },
    });

    if (!invitation) {
      return next(new NotFoundError("Invitation not found."));
    }

    if (invitation.status !== "PENDING") {
      return next(
        new ValidationError("Only pending invitations can be resent."),
      );
    }

    const token = generateToken();

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updatedInvite = await prisma.agencyInvites.update({
      where: {
        id: invitation.id,
      },
      data: {
        token,
        expiresAt,
      },
    });

    const inviteLink = `${
      process.env.CLIENT_URL || "http://localhost:3001"
    }/signup?invite=${token}`;

    // await sendNotifyEmail(
    //   invitation.email,
    //   `You're invited to join ${invitation.agency.name}`,
    //   "agency-invitation",
    //   {
    //     name: "Agent",
    //     inviterName: req.agent.name,
    //     agencyName: invitation.agency.name,
    //     inviteLink,
    //   },
    //   req.agent.id,
    // );

    return res.status(200).json({
      success: true,
      message: "Invitation resent successfully.",
      invitation: updatedInvite,
    });
  } catch (error) {
    next(error);
  }
};
