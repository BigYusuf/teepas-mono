import { NextFunction, Response } from "express";
import { ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";

// create a new agency
export const createAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, openingHours, website, category, agentId } = req.body;

    if (!name || !bio || !agentId || !openingHours || !category) {
      return next(new ValidationError("All fields are required!"));
    }

    // // Check if agent has many agency (owner)
    const ownerRole = await prisma.roles.findUnique({
      where: { key: "AGENCY_OWNER" },
    });

    if (!ownerRole) {
      return next(new ValidationError(" owns an agency!"));
    }
    // Check if agent already owns an agency
    const existingAgency = await prisma.agencyMembership.count({
      where: { agentId: agentId, roleId: ownerRole?.id },
    });

    if (existingAgency >= 5) {
      return next(new ValidationError("Maximum numbers of agencies reach!"));
    }

    // Create agency
    const agency = await prisma.agencies.create({
      data: {
        name,
        bio,
        openingHours,
        category,
        ownerId: agentId,
        website: website?.trim() || null,
        agents: {
          connect: { id: agentId },
        },
      },
    });
    // 👇 Automatically mark the "create-agency" task completed
    await markTaskCompleted(agentId, "create-agency");

    // Create associated agencyCredits
    await prisma.agencyCredits.create({
      data: {
        agencyId: agency.id,
        balance: 0, // default 0
      },
    });

    // create owner membership (OWNER)
    const membership = await prisma.agencyMembership.create({
      data: {
        role: { connect: { id: ownerRole.id } },
        agent: { connect: { id: agentId } },
        agency: { connect: { id: agency.id } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      data: agency,
    });
  } catch (error) {
    next(error);
  }
};

//Add agent to agency directly
export const addAgentToAgency = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const { agencyId, agentEmail } = req.body;

    // if (!agencyId || !agentEmail)
    //   return next(
    //     new ValidationError("Agency ID and agent email are required!"),
    //   );

    // // Find the agency
    // const agency = await prisma.agencies.findUnique({
    //   where: { id: agencyId },
    // });
    // if (!agency) return next(new ValidationError("Agency not found!"));

    // // Find the agent
    // const agent = await prisma.agents.findUnique({
    //   where: { email: agentEmail },
    // });
    // if (!agent) return next(new ValidationError("Agent not found!"));

    // // Ensure agent isn’t already part of another agency
    // if (agent.agencyId && agent.agencyId !== agencyId) {
    //   return next(
    //     new ValidationError("Agent already belongs to another agency!"),
    //   );
    // }

    // // Add the agent
    // // resolve MEMBER role and connect relations instead of assigning scalar fields
    // const memberRole = await prisma.roles.findUnique({
    //   where: { name: "MEMBER" },
    // });
    // if (!memberRole) return next(new ValidationError("Member role not found!"));

    // await prisma.agents.update({
    //   where: { id: agent.id },
    //   data: {
    //     agency: { connect: { id: agencyId } },
    //     role: { connect: { id: memberRole.id } },
    //   },
    // });

    // res.status(200).json({
    //   success: true,
    //   message: `${agent.name} added to ${agency.name}`,
    // });
  } catch (error) {
    next(error);
  }
};
