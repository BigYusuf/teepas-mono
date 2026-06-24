
import { NextFunction, Response } from "express";
import { ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";

// register invite agent
export const registerInvitedAgent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  // try {
  //   const { inviteToken, password, name, phoneNumber, country } = req.body;
  //   if (!inviteToken || !password || !name || !phoneNumber) {
  //     return next(new ValidationError("Missing required fields"));
  //   }
  //   // 1️⃣ Validate invite token
  //   const invite = await prisma.agencyInvites.findUnique({
  //     where: { token: inviteToken },
  //     include: {
  //       agency: {
  //         include: {
  //           owner: true, // 🟢 fetch agency owner info
  //         },
  //       },
  //     },
  //   });
  //   if (!invite || invite.expiresAt < new Date()) {
  //     return next(new ValidationError("Invalid or expired invite token"));
  //   }
  //   // 2️⃣ Check if user already exists
  //   const existingAgent = await prisma.agents.findUnique({
  //     where: { email: invite.email },
  //   });
  //   if (existingAgent) {
  //     return next(new ValidationError("Agent already exists with this email"));
  //   }
  //   // 3️⃣ Get assigned role from invite
  //   const role = await prisma.roles.findUnique({
  //     where: { id: invite.roleId },
  //   });
  //   if (!role) {
  //     return next(new ValidationError("Invalid role specified in invite"));
  //   }
  //   // 4️⃣ Create new agent
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const newAgent = await prisma.agents.create({
  //     data: {
  //       name,
  //       email: invite.email,
  //       phoneNumber,
  //       country,
  //       password: hashedPassword,
  //       agencyId: invite.agencyId,
  //       roleId: role.id,
  //       status: "ACTIVE",
  //     },
  //     include: {
  //       role: true,
  //       agency: true,
  //     },
  //   });
  //   // 5️⃣ Mark invite as used
  //   await prisma.agencyInvites.update({
  //     where: { id: invite.id },
  //     data: { used: true },
  //   });
  //   const agency = invite.agency;
  //   // 6️⃣ Notify the new agent (already present ✅)
  //   // await sendEmail(
  //   //   newAgent.email,
  //   //   "Verify Your Email",
  //   //   "agency-direct-invite-registered",
  //   //   {
  //   //     agentName: newAgent.name,
  //   //     agencyName: agency.name,
  //   //     inviterName: agency.name,
  //   //     agentEmail: newAgent.email,
  //   //     manageLink: `${process.env.APP_URL}/dashboard/agency/agents`,
  //   //     dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
  //   //   }
  //   // );
  //   // await sendNotifyEmail(
  //   //   newAgent.email,
  //   //   `Welcome to ${agency.name} on Teepas!`,
  //   //   "agency-direct-invite-registered",
  //   //   {
  //   //     agentName: newAgent.name,
  //   //     agencyName: agency.name,
  //   //     inviterName: agency.name,
  //   //     agentEmail: newAgent.email,
  //   //     manageLink: `${process.env.APP_URL}/dashboard/agency/agents`,
  //   //     dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
  //   //   },
  //   //   newAgent.id
  //   // );
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
  //   res.status(201).json({
  //     success: true,
  //     message: "Agent registered successfully via invite",
  //     agent: newAgent,
  //   });
  // } catch (error) {
  //   return next(error);
  // }
};
