// // import { notify } from "@packages/utils/notify";

// export const sendNotifyOTP = async (
//   name: string,
//   email: string,
//   otp: string,
//   template: string,
//   id?: string
// ) => {
//   await notify({
//     receiverId: email,
//     creatorId: id || "system",
//     receiverEmail: email,
//     title: "Verify Your Email",
//     message: `Hi ${name}, use this code to verify your account.`,
//     channels: ["email"],
//     emailTemplate: template,
//     meta: { name, otp, email },
//   });
// };

// export const sendNotifyAgentInvite = async (
//   email: string,
//   name: string,
//   inviterName: string,
//   agencyName: string,
//   inviteLink: string,
//   id?: string
// ) => {
//   await notify({
//     receiverId: email,
//     creatorId: id || "system",
//     receiverEmail: email,
//     title: `You're invited to join ${agencyName}`,
//     message: `${inviterName} has invited you to join ${agencyName} on Teepas.`,
//     channels: ["email", "inapp"],
//     redirect_link: inviteLink,
//     emailTemplate: "agency-invitation",
//     meta: {
//       name,
//       inviterName,
//       agencyName,
//       inviteLink,
//     },
//   });
// };

// export const sendNotifyEmail = async (
//   email: string,
//   subject: string,
//   template: string,
//   meta: Record<string, any>,
//   id?: string
// ) => {
//   await notify({
//     creatorId: id || "system",
//     receiverId: meta?.id || email,
//     receiverEmail: email,
//     title: subject,
//     message: subject,
//     channels: ["email", "inapp"],
//     emailTemplate: template,
//     meta,
//   });
// };

// export const sendNotifyAgencyInvite = async (
//   inviterId: string,
//   inviterEmail: string,
//   agentName: string,
//   agencyName: string,
//   agentEmail: string,
//   inviterName: string
// ) => {
//   await notify({
//     creatorId: "system",
//     receiverId: inviterId, // agency admin
//     receiverEmail: inviterEmail,
//     title: "Agent Invitation Sent",
//     message: `You have invited ${agentName} to join ${agencyName}.`,
//     channels: ["email", "inapp"],
//     emailTemplate: "agency-invite-sent",
//     meta: {
//       inviterName,
//       agentName,
//       agentEmail,
//       agencyName,
//       manageLink: `${process.env.APP_URL}/agency/invitations`,
//       cancelLink: `${process.env.APP_URL}/agency/invitations/cancel?email=${agentEmail}`,
//     },
//   });
// };
