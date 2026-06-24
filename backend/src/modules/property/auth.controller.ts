import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../../utils/auth.helper";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../../utils/cookies/setCookie";
// import { sendLog } from "@packages/utils/logs/send-logs";
import { sendEmail } from "../../utils/sendMail";
import { AuthError, NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    // sendLog({
    //   type: "info",
    //   message: `OTP requested for ${email}`,
    //   source: "auth-service",
    // });

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

// verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.users.count();

    // sendLog({
    //   type: "success",
    //   message: `New user verified & registered: ${email}`,
    //   source: "auth-service",
    // });

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(userCount === 0 && { role: "admin" }), // assign role admin if it's the first user
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, isMobile } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return next(new AuthError("User doesn't exists!"));

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      // sendLog({
      //   type: "error",
      //   message: `Login failed: Invalid password for ${email}`,
      //   source: "auth-service",
      // });
      return next(new AuthError("Invalid email or password"));
    }

    // sendLog({
    //   type: "success",
    //   message: `User login successful: ${email}`,
    //   source: "auth-service",
    // });

    res.clearCookie("agent-access-token");
    res.clearCookie("agent-refresh-token");

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1h",
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // avatar: user?.imageUrl || null,
      },
      accessToken: isMobile ? accessToken : undefined,
      refreshToken: isMobile ? refreshToken : undefined,
    });
  } catch (error) {
    return next(error);
  }
};

// log out user
export const logOutUser = async (req: any, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(201).json({
    success: true,
  });
};

// update user password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("all fields are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError("new passwords do not match"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the current password",
        ),
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return next(new AuthError("user not found or password not set"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordCorrect) {
      return next(new AuthError("current password is incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// login admin
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return next(new AuthError("User doesn't exists!"));

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    const isAdmin = user.role === "admin";

    if (!isAdmin) {
      // sendLog({
      //   type: "error",
      //   message: `Admin login failed for ${email} — not an admin`,
      //   source: "auth-service",
      // });
      return next(new AuthError("Invalid access!"));
    }

    // sendLog({
    //   type: "success",
    //   message: `Admin login successful: ${email}`,
    //   source: "auth-service",
    // });

    res.clearCookie("agent-access-token");
    res.clearCookie("agent-refresh-token");

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1h",
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["agent-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(new ValidationError("Unauthorized! No refresh token."));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
    }

    let account;
    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "agent") {
      account = await prisma.agents.findUnique({
        where: { id: decoded.id },
        include: { agency: true },
      });
    }

    if (!account) {
      return next(new AuthError("Forbidden! User/Agent not found"));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" },
    );

    if (decoded.role === "user" || decoded.role === "admin") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "agent") {
      setCookie(res, "agent-access-token", newAccessToken);
    }

    req.role = decoded.role;

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    // await sendLog({
    //   type: "success",
    //   message: `User data retrieved ${user?.email}`,
    //   source: "auth-service",
    // });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// get logged in admin
export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    // await sendLog({
    //   type: "success",
    //   message: `Admin data retrieved ${user?.email}`,
    //   source: "auth-service",
    // });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

// Verify forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

// Reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return next(new ValidationError("Email and new password are required!"));

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User not found!"));

    // compare new password with the exisiting one
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password!",
        ),
      );
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};

// register a new agent
export const registerAgent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "agent");
    const { name, email } = req.body;

    const exisitingAgent = await prisma.agents.findUnique({
      where: { email },
    });

    if (exisitingAgent) {
      throw new ValidationError("Agent already exists with this email!");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "agent-activation");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

// verify agent with OTP
export const verifyAgent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phoneNumber, country } = req.body;

    if (!email || !otp || !password || !name || !phoneNumber || !country) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingAgent = await prisma.agents.findUnique({
      where: { email },
    });

    if (existingAgent)
      return next(new ValidationError("Agent already exists with this email!"));

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await prisma.roles.findUnique({
      where: { name: "AGENT" },
    });

    const agent = await prisma.agents.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phoneNumber,
        role: { connect: { id: defaultRole.id } },
      },
    });

    // ✅ Assign all tasks to the agent
    const tasks = await prisma.tasks.findMany();

    const agentTasks = tasks.map((task: any) => ({
      agentId: agent.id,
      taskId: task.id,
      completed: false,
    }));

    await (prisma as any).agentTaskProgress.createMany({
      data: agentTasks,
      // skipDuplicates is not accepted by current Prisma/DB typings here, use prisma cast to any to bypass the TS error
      skipDuplicates: true, // avoids duplicates if seeding again
    });

    res.status(201).json({ agent, message: "Agent registered successfully!" });
  } catch (error) {
    next(error);
  }
};

// register invite agent
export const registerInvitedAgent = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { inviteToken, password, name, phoneNumber, country } = req.body;

    if (!inviteToken || !password || !name || !phoneNumber) {
      return next(new ValidationError("Missing required fields"));
    }

    // 1️⃣ Validate invite token
    const invite = await prisma.agencyInvites.findUnique({
      where: { token: inviteToken },
      include: {
        agency: {
          include: {
            owner: true, // 🟢 fetch agency owner info
          },
        },
      },
    });

    if (!invite || invite.expiresAt < new Date()) {
      return next(new ValidationError("Invalid or expired invite token"));
    }

    // 2️⃣ Check if user already exists
    const existingAgent = await prisma.agents.findUnique({
      where: { email: invite.email },
    });
    if (existingAgent) {
      return next(new ValidationError("Agent already exists with this email"));
    }

    // 3️⃣ Get assigned role from invite
    const role = await prisma.roles.findUnique({
      where: { id: invite.roleId },
    });

    if (!role) {
      return next(new ValidationError("Invalid role specified in invite"));
    }

    // 4️⃣ Create new agent
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAgent = await prisma.agents.create({
      data: {
        name,
        email: invite.email,
        phoneNumber,
        country,
        password: hashedPassword,
        agencyId: invite.agencyId,
        roleId: role.id,
        status: "ACTIVE",
      },
      include: {
        role: true,
        agency: true,
      },
    });

    // 5️⃣ Mark invite as used
    await prisma.agencyInvites.update({
      where: { id: invite.id },
      data: { used: true },
    });

    const agency = invite.agency;

    // 6️⃣ Notify the new agent (already present ✅)

    await sendEmail(
      newAgent.email,
      "Verify Your Email",
      "agency-direct-invite-registered",
      {
        agentName: newAgent.name,
        agencyName: agency.name,
        inviterName: agency.name,
        agentEmail: newAgent.email,
        manageLink: `${process.env.APP_URL}/dashboard/agency/agents`,
        dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
      },
    );

    // 7️⃣ 🆕 Notify the agency owner
    if (agency?.owner) {
      await sendEmail(
        agency.owner.email,
        `New Agent Joined Your Agency`,
        "new-agent-joined-agency", // 👈 create this email template
        {
          ownerName: agency.owner.name,
          agentName: newAgent.name,
          agentEmail: newAgent.email,
          agencyName: agency.name,
          roleName: role.name,
          dashboardLink: `${process.env.APP_URL}/dashboard/agency/agents`,
        },
      );
    }

    res.status(201).json({
      success: true,
      message: "Agent registered successfully via invite",
      agent: newAgent,
    });
  } catch (error) {
    return next(error);
  }
};

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

    // Check if agent exists
    const ownerAgent = await prisma.agents.findUnique({
      where: { id: agentId },
    });
    if (!ownerAgent) return next(new ValidationError("Owner agent not found!"));

    // Check if agent already owns an agency
    const existingAgency = await prisma.agencies.findFirst({
      where: { ownerId: agentId },
    });
    if (existingAgency) {
      return next(new ValidationError("Agent already owns an agency!"));
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

    // Update owner role to OWNER
    const ownerRole = await prisma.roles.findUnique({
      where: { name: "AGENCY_OWNER" },
    });
    await prisma.agents.update({
      where: { id: agentId },
      data: {
        agency: { connect: { id: agency.id } },
        role: { connect: { id: ownerRole.id } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Agency created successfully",
      agency,
    });
  } catch (error) {
    next(error);
  }
};

// create agency address
export const createAgencyAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      agencyId,
      label,
      name,
      street,
      city,
      state,
      zip,
      country,
      isDefault,
    } = req.body;

    if (
      !agencyId ||
      !label ||
      !name ||
      !street ||
      !city ||
      !zip ||
      !country ||
      !state
    ) {
      return next(new ValidationError("All fields are required!"));
    }

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    if (isDefault) {
      // Set all other addresses to false
      await prisma.agencyAddresses.updateMany({
        where: { agencyId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.agencyAddresses.create({
      data: {
        agencyId,
        label,
        name,
        street,
        city,
        zip,
        country,
        state,
        isDefault: isDefault ?? true,
      },
    });

    await markTaskCompleted(agency.ownerId, "agency-address");

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// 🏦 Create Agency Bank Account
export const createAgencyBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      agencyId,
      bankName,
      accountName,
      accountNumber,
      currency,
      isPrimary,
    } = req.body;

    if (!agencyId || !bankName || !accountName || !accountNumber) {
      return next(new ValidationError("All required fields must be provided!"));
    }

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    if (isPrimary) {
      // Unset all other primary accounts for this agency
      await prisma.agencyBankAccounts.updateMany({
        where: { agencyId },
        data: { isPrimary: false },
      });
    }

    const bankAccount = await prisma.agencyBankAccounts.create({
      data: {
        agencyId,
        bankName,
        accountName,
        accountNumber,
        currency: currency ?? "NGN",
        isPrimary: isPrimary ?? true,
      },
    });

    // ✅ Auto-complete task
    await markTaskCompleted(agency?.ownerId, "agency-banks");
    res.status(201).json({
      success: true,
      bankAccount,
    });
  } catch (error) {
    next(error);
  }
};

//Add agent to agency directly
export const addAgentToAgency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId, agentEmail } = req.body;

    if (!agencyId || !agentEmail)
      return next(
        new ValidationError("Agency ID and agent email are required!"),
      );

    // Find the agency
    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    // Find the agent
    const agent = await prisma.agents.findUnique({
      where: { email: agentEmail },
    });
    if (!agent) return next(new ValidationError("Agent not found!"));

    // Ensure agent isn’t already part of another agency
    if (agent.agencyId && agent.agencyId !== agencyId) {
      return next(
        new ValidationError("Agent already belongs to another agency!"),
      );
    }

    // Add the agent
    // resolve MEMBER role and connect relations instead of assigning scalar fields
    const memberRole = await prisma.roles.findUnique({
      where: { name: "MEMBER" },
    });
    if (!memberRole) return next(new ValidationError("Member role not found!"));

    await prisma.agents.update({
      where: { id: agent.id },
      data: {
        agency: { connect: { id: agencyId } },
        role: { connect: { id: memberRole.id } },
      },
    });

    res.status(200).json({
      success: true,
      message: `${agent.name} added to ${agency.name}`,
    });
  } catch (error) {
    next(error);
  }
};

// // create stripe connect account link
// export const createStripeConnectLink = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { agentId } = req.body;

//     if (!agentId) return next(new ValidationError("Agent ID is required!"));

//     const agent = await prisma.agents.findUnique({
//       where: {
//         id: agentId,
//       },
//     });

//     if (!agent) {
//       return next(new ValidationError("Agent is not available with this id!"));
//     }

//     const account = await stripe.accounts.create({
//       type: "express",
//       email: agent?.email,
//       country: "GB",
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//     });

//     await prisma.agents.update({
//       where: {
//         id: agentId,
//       },
//       data: {
//         stripeId: account.id,
//       },
//     });

//     const accountLink = await stripe.accountLinks.create({
//       account: account.id,
//       refresh_url: `http://localhost:3000/success`,
//       return_url: `http://localhost:3000/success`,
//       type: "account_onboarding",
//     });

//     res.json({ url: accountLink.url });
//   } catch (error) {
//     return next(error);
//   }
// };
export const getAllAmenities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [amenities, totalAmenities] = await Promise.all([
      prisma.amenities.findMany({
        skip,
        take: limit,
        orderBy: { category: "asc" },
      }),
      prisma.amenities.count(),
    ]);

    const totalPages = Math.ceil(totalAmenities / limit);

    res.status(200).json({
      success: true,
      data: amenities,
      meta: {
        totalAmenities,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// login agent
export const loginAgent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, isMobile } = req.body;

    if (!email || !password)
      return next(new ValidationError("Email and password are required!"));

    const agent = await prisma.agents.findUnique({
      where: { email },
      include: { agency: true, role: true },
    });
    if (!agent) return next(new ValidationError("Invalid email or password!"));

    // Verify password
    const isMatch = await bcrypt.compare(password, agent.password!);
    if (!isMatch)
      return next(new ValidationError("Invalid email or password!"));

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: agent.id, role: "agent" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" },
    );
    const refreshToken = jwt.sign(
      { id: agent.id, role: "agent" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    // store refresh token and access token
    setCookie(res, "agent-refresh-token", refreshToken);
    setCookie(res, "agent-access-token", accessToken);

    // send response
    res.status(200).json({
      message: "Login successful!",
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        agencyId: agent.agencyId || "none",
        role: agent.role,
        agencyName: agent?.agency?.name || "none",
      },

      accessToken: isMobile ? accessToken : undefined,
      refreshToken: isMobile ? refreshToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// log out agent
export const logOutAgent = async (req: any, res: Response) => {
  res.clearCookie("agent-access-token");
  res.clearCookie("agent-refresh-token");

  res.status(201).json({
    success: true,
  });
};

// get logged in agent
export const getAgent = async (req: any, res: Response, next: NextFunction) => {
  try {
    const agent = req.agent;

    res.status(201).json({
      success: true,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

// log out admin
export const logOutAdmin = async (req: any, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(201).json({
    success: true,
  });
};

// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// get user addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// fetch layout data
export const getLayoutData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const layout = await prisma.site_config.findFirst();

    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    next(error);
  }
};
