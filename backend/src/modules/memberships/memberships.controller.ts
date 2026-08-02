import { NextFunction, Request, Response } from "express";

import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";
import { getPagination, getPaginationMeta } from "../../utils/paginations";

export const joinAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;
    const { message } = req.body;

    const agentId = req.agent.id;

    // Verify agency exists
    const agency = await prisma.agencies.findUnique({
      where: {
        id: agencyId,
        isDeleted: false,
      },
    });

    if (!agency) {
      return next(new NotFoundError("Agency not found."));
    }

    // Already a member?
    const membership = await prisma.agencyMembership.findFirst({
      where: {
        agencyId,
        agentId,
      },
    });

    if (membership) {
      return next(
        new ValidationError("You are already a member of this agency."),
      );
    }

    // Existing pending request?
    const existingRequest = await prisma.agencyJoinRequests.findFirst({
      where: {
        agencyId,
        agentId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return next(
        new ValidationError(
          "You already have a pending request for this agency.",
        ),
      );
    }

    const request = await prisma.agencyJoinRequests.create({
      data: {
        agencyId,
        agentId,
        message,
      },
    });

    // ----------------------------------------
    // Notify owner/admin (leave commented)
    // ----------------------------------------

    // const admins = ...

    // await sendNotifyEmail(...)

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully.",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const listJoinRequests = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agency.id;

    const { page, limit, skip } = getPagination(req.query);

    const where: any = {
      agencyId,
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.search) {
      where.agent = {
        OR: [
          {
            name: {
              contains: req.query.search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: req.query.search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    const [requests, total] = await Promise.all([
      prisma.agencyJoinRequests.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              country: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyJoinRequests.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      requests,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getJoinRequest = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.agencyJoinRequests.findFirst({
      where: {
        id: requestId,
        agencyId: req.agency.id,
      },
      include: {
        agent: true,
      },
    });

    if (!request) {
      return next(new NotFoundError("Join request not found."));
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const approveJoinRequest = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;
    const { roleId } = req.body;

    const agencyId = req.agency.id;

    const request = await prisma.agencyJoinRequests.findFirst({
      where: {
        id: requestId,
        agencyId,
      },
      include: {
        agent: true,
      },
    });

    if (!request) {
      return next(new NotFoundError("Join request not found."));
    }

    if (request.status !== "PENDING") {
      return next(
        new ValidationError("This request has already been processed."),
      );
    }

    const role = await prisma.agencyRoles.findFirst({
      where: {
        id: roleId,
        agencyId,
      },
    });

    if (!role) {
      return next(new ValidationError("Invalid role selected."));
    }

    const existingMembership = await prisma.agencyMembership.findFirst({
      where: {
        agencyId,
        agentId: request.agentId,
      },
    });

    if (existingMembership) {
      return next(new ValidationError("Agent already belongs to this agency."));
    }

    const membership = await prisma.$transaction(async (tx) => {
      const membership = await tx.agencyMembership.create({
        data: {
          agencyId,
          roleId,
          agentId: request.agentId,
          invitedById: req.agent.id,
        },
      });

      await tx.agencyJoinRequests.update({
        where: {
          id: request.id,
        },
        data: {
          status: "ACCEPTED",
          reviewedAt: new Date(),
          reviewedById: req.agent.id,
        },
      });

      return membership;
    });

    await markTaskCompleted(request.agentId, "join-agency");

    // refresh agent JWT next login
    // notify agent

    return res.status(200).json({
      success: true,
      message: "Join request approved successfully.",
      membership,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectJoinRequest = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.agencyJoinRequests.findFirst({
      where: {
        id: requestId,
        agencyId: req.agency.id,
      },
      include: {
        agent: true,
      },
    });

    if (!request) {
      return next(new NotFoundError("Join request not found."));
    }

    if (request.status !== "PENDING") {
      return next(
        new ValidationError("This request has already been processed."),
      );
    }

    await prisma.agencyJoinRequests.update({
      where: {
        id: request.id,
      },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: req.agent.id,
      },
    });

    // await sendNotifyEmail(
    //   request.agent.email,
    //   `Your request to join ${req.agency.name} was declined`,
    //   "join-request-rejected",
    //   {
    //     agencyName: req.agency.name,
    //     name: request.agent.name,
    //   },
    //   req.agent.id,
    // );

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelJoinRequest = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.agencyJoinRequests.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return next(new NotFoundError("Join request not found."));
    }

    if (request.agentId !== req.agent.id) {
      return next(
        new ForbiddenError("You are not allowed to cancel this request."),
      );
    }

    if (request.status !== "PENDING") {
      return next(
        new ValidationError("Only pending requests can be cancelled."),
      );
    }

    await prisma.agencyJoinRequests.update({
      where: {
        id: request.id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // ----------------------------------------
    // Optional notification
    // ----------------------------------------

    // notify agency owner/admin

    return res.status(200).json({
      success: true,
      message: "Join request cancelled successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const listMyJoinRequests = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const where: any = {
      agentId: req.agent.id,
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      prisma.agencyJoinRequests.findMany({
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyJoinRequests.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      pagination: getPaginationMeta(page, limit, total),
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const listAgencyMembers = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const where = {
      agencyId: req.agency.id,
    };

    const [members, total] = await Promise.all([
      prisma.agencyMembership.findMany({
        where,
        include: {
          role: true,
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              country: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyMembership.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: getPaginationMeta(page, limit, total),
      members,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgencyMember = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { membershipId } = req.params;

    const member = await prisma.agencyMembership.findFirst({
      where: {
        id: membershipId,
        agencyId: req.agency.id,
      },
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

        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!member) {
      return next(new NotFoundError("Member not found."));
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyAgencies = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent?.id;

    if (!agentId) {
      return next(new ValidationError("Register to be a agent first!"));
    }

    const memberships = await prisma.agencyMembership.findMany({
      where: {
        agentId,
        status: {
          not: "INACTIVE",
        },
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            avatar: true,
            logoUrl: true,
            coverBanner: true,
            verified: true,
            category: true,
            email: true,
            phone: true,
            isDeleted: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      total: memberships.length,
      data: memberships.map((membership) => ({
        membershipId: membership.id,
        joinedAt: membership.joinedAt,
        status: membership.status,
        role: membership.role,
        agency: membership.agency,
      })),
    });
  } catch (error) {
    next(error);
  }
};
