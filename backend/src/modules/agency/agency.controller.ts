import { NextFunction, Request, Response } from "express";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../error-handler";
import prisma from "../../libs/prisma";
import {
  markAgencyTaskCompleted,
  markTaskCompleted,
} from "../../middleware/markTask";
import { issueAuthTokens } from "../auth/auth.services";
import { getPagination, getPaginationMeta } from "../../utils/paginations";
import redis from "../../libs/redis";
import { uploadFile } from "../../common/helper/imagekit.helper";

// create a new agency
export const createAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent?.id;

    if (!agentId) {
      return next(new ValidationError("You must register as an agent first."));
    }

    const { name, bio, category } = req.body;

    if (!name || !bio || !category) {
      return next(new ValidationError("All fields are required!"));
    }

    const ownerRole = await prisma.roles.findUnique({
      where: { key: "AGENCY_OWNER" },
    });

    if (!ownerRole) {
      return next(new ValidationError("Owner role is not configured."));
    }

    // Create agency, credits wallet, contact info, and owner membership
    // atomically — either the whole agency exists in a usable state, or
    // none of it does.
    const { agency, membership } = await prisma.$transaction(async (tx) => {
      // Count check happens inside the transaction to avoid a
      // check-then-create race between concurrent requests.
      const existingAgencyCount = await tx.agencyMembership.count({
        where: { agentId, roleId: ownerRole.id },
      });

      if (existingAgencyCount >= 5) {
        throw new ValidationError("Maximum number of agencies reached!");
      }

      const agency = await tx.agencies.create({
        data: {
          name,
          bio,
          category,
        },
      });

      await tx.agencyCredits.create({
        data: {
          agencyId: agency.id,
          balance: 0,
        },
      });

      const membership = await tx.agencyMembership.create({
        data: {
          role: { connect: { id: ownerRole.id } },
          agent: { connect: { id: agentId } },
          agency: { connect: { id: agency.id } },
        },
      });

      return { agency, membership };
    });

    // Task completion is idempotent and non-critical to the agency
    // existing — run it after commit so a task-service hiccup never
    // rolls back a successfully created agency. Log rather than fail
    // the request if it errors.
    try {
      await markTaskCompleted(
        { agentId, agencyId: agency.id },
        "CREATE_OR_JOIN_AGENCY",
      );
    } catch (taskError) {
      console.error("Failed to mark CREATE_OR_JOIN_AGENCY task:", taskError);
    }

    const tokens = issueAuthTokens(
      res,
      {
        id: agentId,
        role: "agent",
        agencyId: agency.id,
        membershipId: membership.id,
      },
      req.body.isMobile,
    );

    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      data: agency,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;

    const agency = await prisma.agencies.findFirst({
      where: {
        id: agencyId,
        isDeleted: false,
      },
      include: {
        media: true,
        contact: true,
        addresses: true,

        followers: {
          select: {
            id: true,
          },
        },

        properties: {
          where: {
            isDeleted: false,
          },
          take: 6,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            units: {
              include: {
                images: {
                  where: { isCover: true },
                  take: 1,
                },
                listings: {
                  where: { status: "ACTIVE" },
                  orderBy: { publishedAt: "desc" },
                  take: 1,
                  include: { pricing: true },
                },
              },
            },
          },
        },

        reviews: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },

        memberships: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!agency) {
      return next(new NotFoundError("Agency not found."));
    }

    // Real total across all properties, not just the 6 fetched for preview
    const [totalProperties, totalActiveListings, totalReviewsCount, ratingAgg] =
      await Promise.all([
        prisma.properties.count({
          where: { agencyId, isDeleted: false },
        }),
        prisma.listings.count({
          where: {
            status: "ACTIVE",
            unit: { property: { agencyId, isDeleted: false } },
          },
        }),
        prisma.agencyReviews.count({ where: { agencyId } }),
        prisma.agencyReviews.aggregate({
          where: { agencyId },
          _avg: { rating: true },
        }),
      ]);

    return res.status(200).json({
      success: true,

      agency: {
        ...agency,

        stats: {
          followers: agency.followers.length,
          activeAgents: agency.memberships.length,
          totalProperties,
          totalActiveListings,
          totalReviews: totalReviewsCount,
          averageRating: ratingAgg._avg.rating ?? 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Switch Agency
export const switchAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const { membershipId } = req.body;

  const membership = await prisma.agencyMembership.findFirst({
    where: {
      id: membershipId,
      agentId: req.agent.id,
    },
  });

  if (!membership) {
    return next(new ValidationError("Membership not found."));
  }

  const tokens = issueAuthTokens(
    res,
    {
      id: req.agent.id,
      role: "agent",
      agencyId: membership.agencyId,
      membershipId: membership.id,
    },
    req.body.isMobile,
  );

  return res.status(200).json({
    message: "Agency switched successfully.",
    ...tokens,
  });
};

export const updateAgentRole = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.params;
    const { roleId } = req.body;

    const agency = req.agency;
    const requester = req.membership;

    const targetMembership = await prisma.agencyMembership.findFirst({
      where: {
        agencyId: agency.id,
        agentId,
      },
      include: {
        agent: true,
        role: true,
      },
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "Agent not found in this agency.",
      });
    }

    // Prevent changing yourself
    if (targetMembership.agentId === requester.agentId) {
      return res.status(403).json({
        message: "You cannot change your own role.",
      });
    }

    // Prevent changing owner
    if (targetMembership.role.key === "AGENCY_OWNER") {
      return res.status(403).json({
        message: "You cannot change the owner's role.",
      });
    }

    const newRole = await prisma.agencyRoles.findFirst({
      where: {
        id: roleId,
        agencyId: agency.id,
      },
    });

    if (!newRole) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    await prisma.agencyMembership.update({
      where: {
        id: targetMembership.id,
      },
      data: {
        roleId,
      },
    });

    // Email notifications stay exactly the same
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
      message: "Agent role updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAgentStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.params;
    const { action } = req.body;

    const requester = req.membership;
    const agency = req.agency;

    if (!["ban", "unban"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action.",
      });
    }

    // Prevent banning yourself
    if (requester.agentId === agentId) {
      return res.status(400).json({
        message: "You cannot change your own status.",
      });
    }

    const membership = await prisma.agencyMembership.findFirst({
      where: {
        agencyId: agency.id,
        agentId,
      },
      include: {
        role: true,
        agent: true,
      },
    });

    if (!membership) {
      return res.status(404).json({
        message: "Agent not found in this agency.",
      });
    }

    // Prevent banning the owner
    if (membership.role.key === "AGENCY_OWNER") {
      return res.status(403).json({
        message: "You cannot change the owner's status.",
      });
    }

    const updated = await prisma.agencyMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        status: action === "ban" ? "SUSPENDED" : "ACTIVE",
      },
      include: {
        role: true,
        agent: true,
      },
    });

    // Email notifications stay here

    return res.json({
      message: `Agent ${
        action === "ban" ? "banned" : "unbanned"
      } successfully.`,
      membership: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeAgentFromAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agentId } = req.params;

    const requester = req.membership;
    const agency = req.agency;

    const membership = await prisma.agencyMembership.findFirst({
      where: {
        agencyId: agency.id,
        agentId,
      },
      include: {
        role: true,
        agent: true,
      },
    });

    if (!membership) {
      return res.status(404).json({
        message: "Agent not found.",
      });
    }

    // Prevent removing yourself
    if (membership.agentId === requester.agentId) {
      return res.status(400).json({
        message: "You cannot remove yourself.",
      });
    }

    // Prevent removing owner
    if (membership.role.key === "AGENCY_OWNER") {
      return res.status(403).json({
        message: "You cannot remove the agency owner.",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Delete membership permanently
      await tx.agencyMembership.delete({
        where: {
          id: membership.id,
        },
      });

      // Unassign properties within this agency
      await tx.properties.updateMany({
        where: {
          agencyId: agency.id,
          agentId,
        },
        data: {
          agentId: null,
        },
      });

      // Activity log (optional)
    });

    // Email notifications remain here
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
    // // notify agency email
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
    //
    return res.json({
      message: `${membership.agent.name} removed from the agency successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agency = req.agency;

    if (!agency) {
      return next(new NotFoundError("Agency not found."));
    }

    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 28);

    await prisma.agencies.update({
      where: {
        id: agency.id,
      },
      data: {
        isDeleted: true,
        deletedAt,
      },
    });

    return res.status(200).json({
      message:
        "Agency marked for deletion. It will be permanently removed in 28 days.",
    });
  } catch (error) {
    next(error);
  }
};

export const restoreAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agency = await prisma.agencies.findUnique({
      where: {
        id: req.agency.id,
      },
    });

    if (!agency) {
      return next(new NotFoundError("Agency not found."));
    }

    if (!agency.isDeleted || !agency.deletedAt) {
      return next(new ForbiddenError("Agency is not marked for deletion."));
    }

    if (new Date() > agency.deletedAt) {
      return next(
        new ForbiddenError("The 28-day recovery period has expired."),
      );
    }

    await prisma.agencies.update({
      where: {
        id: agency.id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: "Agency restored successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAgencyPerformance = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agency?.id;

    if (!agencyId) {
      return next(new NotFoundError("No agency selected."));
    }

    const members = await prisma.agencyMembership.findMany({
      where: {
        agencyId,
      },
      select: {
        agentId: true,
      },
    });

    const agentIds = members.map((m) => m.agentId);

    const [propertiesCount, applicationsCount, transactionsCount, leadsCount] =
      await Promise.all([
        prisma.properties.count({
          where: {
            agencyId,
          },
        }),

        prisma.propertyApplications.count({
          where: {
            agencyId,
          },
        }),

        prisma.propertyTransactions.count({
          where: {
            agencyId,
          },
        }),

        prisma.conversationGroup.count({
          where: {
            participants: {
              some: {
                agentId: {
                  in: agentIds,
                },
              },
            },
          },
        }),
      ]);

    return res.status(200).json({
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

export const getMyAgencyReviews = async (
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

    const [reviews, stats] = await Promise.all([
      prisma.agencyReviews.findMany({
        where: { agencyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.agencyReviews.aggregate({
        where: { agencyId },
        _avg: {
          rating: true,
        },
        _count: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      avgRating: Number((stats._avg.rating ?? 0).toFixed(1)),
      pagination: getPaginationMeta(page, limit, stats._count),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgencyPictures = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { editType, imageUrl } = req.body;

    if (!editType || !imageUrl) {
      return next(new ValidationError("Missing required fields!"));
    }

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const updateField =
      editType === "cover"
        ? { coverBanner: imageUrl }
        : editType === "logo"
          ? { logoUrl: imageUrl }
          : { avatar: imageUrl };

    const agency = await prisma.agencyMedia.update({
      where: {
        agencyId: req.agency.id,
      },
      data: updateField,
      select: {
        id: true,
        avatar: true,
        coverBanner: true,
        logoUrl: true,
      },
    });

    await markTaskCompleted(
      { agentId: req.agent.id, agencyId: req.agency.id },
      "UPLOAD_AGENCY_LOGO",
    );

    return res.status(200).json({
      success: true,
      message: `${editType} updated successfully.`,
      agency,
    });
  } catch (error) {
    next(error);
  }
};

// ── CORE PROFILE ──────────────────────────────────────────────────────────
export const editAgencyProfile = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, category, operatingAreas } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const existingAgency = await prisma.agencies.findUnique({
      where: { id: req.agency.id },
    });

    if (!existingAgency) {
      return next(new NotFoundError("Agency not found."));
    }

    const agency = await prisma.agencies.update({
      where: { id: req.agency.id },
      data: { name, bio, category, operatingAreas },
    });

    // "Complete Agency Profile" = core identity fields are all filled in
    if (agency.name && agency.bio && agency.category) {
      await markAgencyTaskCompleted(req.agency.id, "COMPLETE_AGENCY_PROFILE");
    }

    return res.status(200).json({
      success: true,
      message: "Agency profile updated successfully.",
      agency,
    });
  } catch (error) {
    next(error);
  }
};

// ── CONTACT ───────────────────────────────────────────────────────────────
export const editAgencyContact = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, phone, website } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const contact = await prisma.agencyContact.upsert({
      where: { agencyId: req.agency.id },
      update: { email, phone, website },
      create: {
        agencyId: req.agency.id,
        email,
        phone,
        website,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Agency contact updated successfully.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
// ── SUPPORT ───────────────────────────────────────────────────────────────
export const editAgencySupport = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { supportEmail, supportPhone, openingHours } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const support = await prisma.agencySupport.upsert({
      where: { agencyId: req.agency.id },
      update: { supportEmail, supportPhone, openingHours },
      create: {
        agencyId: req.agency.id,
        supportEmail,
        supportPhone,
        openingHours,
      },
    });

    if (support.supportEmail || support.supportPhone) {
      await markAgencyTaskCompleted(
        req.agency.id,
        "ADD_AGENCY_SUPPORT_CONTACT",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Agency support updated successfully.",
      data: support,
    });
  } catch (error) {
    next(error);
  }
};

// ── MEDIA ─────────────────────────────────────────────────────────────────
export const editAgencyMedia = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { avatar, coverBanner, logoUrl, videoIntro, socialLinks } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const media = await prisma.agencyMedia.upsert({
      where: { agencyId: req.agency.id },
      update: { avatar, coverBanner, logoUrl, videoIntro, socialLinks },
      create: {
        agencyId: req.agency.id,
        avatar,
        coverBanner,
        logoUrl,
        videoIntro,
        socialLinks,
      },
    });

    if (media.logoUrl) {
      await markAgencyTaskCompleted(req.agency.id, "UPLOAD_AGENCY_LOGO");
    }

    return res.status(200).json({
      success: true,
      message: "Agency media updated successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
};

// ── BUSINESS DETAILS ─────────────────────────────────────────────────────
export const editAgencyBusinessDetails = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      commissionRate,
      servicesOffered,
      yearEstablished,
      businessRegNumber,
      taxId,
    } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const businessDetails = await prisma.agencyBusinessDetails.upsert({
      where: { agencyId: req.agency.id },
      update: {
        commissionRate,
        servicesOffered,
        yearEstablished,
        businessRegNumber,
        taxId,
      },
      create: {
        agencyId: req.agency.id,
        commissionRate,
        servicesOffered,
        yearEstablished,
        businessRegNumber,
        taxId,
      },
    });

    // No task currently maps to this — add one to defaultTasks (e.g.
    // "ADD_BUSINESS_DETAILS") if you want it to award points/credits too.

    return res.status(200).json({
      success: true,
      message: "Agency business details updated successfully.",
      businessDetails,
    });
  } catch (error) {
    next(error);
  }
};

// top agencies
export const topAgencies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt((req.query.limit as string) || "10");
    const cacheKey = `top:agencies:${limit}`;

    // 🔹 1️⃣ Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔹 2️⃣ Fetch grouped transactions for agencies with revenue
    const transactions = await prisma.propertyTransactions.groupBy({
      by: ["agencyId", "type"],
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    });

    let allAgencyIds = [...new Set(transactions.map((t: any) => t.agencyId))];

    // 🔹 3️⃣ Fallback: if no transaction data (e.g. in dev)
    if (allAgencyIds.length === 0) {
      const fallbackAgencies = await prisma.agencies.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          logoUrl: true,
          verified: true,
          followers: { select: { id: true } },
          propertyAnalytics: {
            select: { views: true, inquiries: true, saved: true },
          },
        },
      });

      const fallbackResult = {
        success: true,
        topAgencies: fallbackAgencies.map((agency: any) => ({
          id: agency.id,
          name: agency.name,
          logoUrl: agency.logoUrl || agency.avatar,
          verified: agency.verified,
          totalRevenue: 0,
          totalsByType: {},
          followersCount: agency.followers.length,
          totalViews: agency.propertyAnalytics.reduce(
            (sum: any, a: any) => sum + (a.views || 0),
            0,
          ),
          totalInquiries: agency.propertyAnalytics.reduce(
            (sum: any, a: any) => sum + (a.inquiries || 0),
            0,
          ),
        })),
      };

      // cache fallback for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(fallbackResult));
      return res.status(200).json(fallbackResult);
    }

    // 🔹 4️⃣ Get agency details for those with transactions
    const agencies = await prisma.agencies.findMany({
      where: { id: { in: allAgencyIds }, isDeleted: false },
      select: {
        id: true,
        name: true,
        avatar: true,
        logoUrl: true,
        verified: true,
        followers: { select: { id: true } },
        propertyAnalytics: {
          select: { views: true, inquiries: true, saved: true },
        },
      },
    });

    // 🔹 5️⃣ Merge analytics with transaction revenue
    const enriched = agencies.map((agency: any) => {
      const agencyTx = transactions.filter(
        (t: any) => t.agencyId === agency.id,
      );

      const totalRevenue = agencyTx.reduce(
        (acc: any, t: any) => acc + (t._sum.amount || 0),
        0,
      );

      const totalsByType = agencyTx.reduce(
        (acc: any, t: any) => ({
          ...acc,
          [t.type.toLowerCase()]:
            (acc[t.type.toLowerCase()] || 0) + (t._sum.amount || 0),
        }),
        {},
      );

      const totalViews = agency.propertyAnalytics.reduce(
        (sum: any, a: any) => sum + (a.views || 0),
        0,
      );

      const totalInquiries = agency.propertyAnalytics.reduce(
        (sum: any, a: any) => sum + (a.inquiries || 0),
        0,
      );

      return {
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logoUrl || agency.avatar,
        verified: agency.verified,
        totalRevenue,
        totalsByType,
        followersCount: agency.followers.length,
        totalViews,
        totalInquiries,
      };
    });

    // 🔹 6️⃣ Sort by total revenue
    const sorted = enriched.sort(
      (a: any, b: any) => b.totalRevenue - a.totalRevenue,
    );

    const result = {
      success: true,
      topAgencies: sorted.slice(0, limit),
    };

    // 🔹 7️⃣ Cache result for 10 minutes
    await redis.setex(cacheKey, 600, JSON.stringify(result));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching top agencies:", error);
    next(error);
  }
};

// ------ documents ---------
// Upload or update agency documents (with ImageKit)

export const uploadAgencyDocuments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      businessCertificate,
      proofOfAddress,
      ownerIdCard,
      insuranceDocument,
      signedAgreement,
    } = req.body;

    if (!req.agency) {
      return next(new NotFoundError("No agency selected."));
    }

    const agencyId = req.agency.id;

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new NotFoundError("Agency not found!"));

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
    let isNew = false;

    if (existing) {
      document = await prisma.agencyDocuments.update({
        where: { agencyId },
        data: { ...uploadedDocs },
      });
    } else {
      isNew = true;
      document = await prisma.agencyDocuments.create({
        data: {
          agencyId,
          ...uploadedDocs,
        },
      });
    }

    // ✅ Auto-complete task — this is an AGENCY-target task, so it's keyed
    // off agencyId, not an owner/agent id.
    await markAgencyTaskCompleted(agencyId, "UPLOAD_AGENCY_DOCUMENTS");

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: "Documents uploaded successfully!",
      document,
    });
  } catch (error) {
    console.error("Document upload failed:", error);
    next(error);
  }
};

// Get all agency documents (admin)
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

// Get documents by agencyId
export const getAgencyDocuments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agencyId = req.agency.id;

    const documents = await prisma.agencyDocuments.findMany({
      where: { agencyId },
    });

    if (!documents) {
      return next(new ValidationError("Agency documents not found!"));
    }

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// Get documents by docId
export const getSingleDocument = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params.id;

    const document = await prisma.agencyDocuments.findUnique({
      where: { id },
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

// get filtered agencys
export const getFilteredAgencies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [agencies, total] = await Promise.all([
      prisma.agencies.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          agents: true,
          followers: true,
          properties: true,
        },
      }),
      prisma.agencies.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      agencies,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
