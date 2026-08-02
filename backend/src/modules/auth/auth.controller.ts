import { NextFunction, Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../../utils/auth.helper";
import { markTaskCompleted } from "../../middleware/markTask";
import { issueAuthTokens } from "./auth.services";
// import { sendNotifyEmail } from "../services/notification";

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

    const tokens = issueAuthTokens(
      res,
      {
        id: user.id,
        role: "user",
      },
      req.body.isMobile,
    );

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // avatar: user?.imageUrl || null,
      },
      ...tokens,
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
    const tokens = issueAuthTokens(
      res,
      {
        id: user.id,
        role: "admin",
      },
      req.body.isMobile,
    );
    res.status(200).json({
      message: "Login successful!",
      data: { id: user.id, email: user.email, name: user.name },
      ...tokens,
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
    const token =
      req.cookies["refresh_token"] ||
      req.cookies["agent-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ValidationError("Unauthorized! No refresh token."));
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as {
      id: string;
      role: "user" | "agent" | "admin";
      agencyId?: string | null;
      membershipId?: string | null;
    };

    let account;

    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
      });
    } else {
      account = await prisma.agents.findUnique({
        where: {
          id: decoded.id,
        },
      });
      const membership = await prisma.agencyMembership.findFirst({
        where: {
          id: decoded.membershipId as string,
          agencyId: decoded.agencyId as string,
          agentId: decoded.id as string,
        },
      });

      if (decoded.membershipId && decoded.agencyId && !membership) {
        return next(new AuthError("Invalid membership."));
      }
    }

    if (!account) {
      return next(new AuthError("Forbidden! Account not found."));
    }

    const isMobile = Boolean(req.headers.authorization?.startsWith("Bearer "));

    const tokens = issueAuthTokens(
      res,
      {
        id: decoded.id,
        role: decoded.role,
        agencyId: decoded.agencyId ?? null,
        membershipId: decoded.membershipId ?? null,
      },
      isMobile,
    );

    return res.status(200).json({
      success: true,
      ...tokens,
    });
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

    const agent = await prisma.agents.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phoneNumber,
      },
    });

    // ✅ Assign all tasks to the agent
    const tasks = await prisma.tasks.findMany();

    const agentTasks = tasks.map((task: any) => ({
      agentId: agent.id,
      taskId: task.id,
    }));

    await (prisma as any).agentTaskProgress.createMany({
      data: agentTasks,
      // skipDuplicates is not accepted by current Prisma/DB typings here, use prisma cast to any to bypass the TS error
      skipDuplicates: true, // avoids duplicates if seeding again
    });

    const tokens = issueAuthTokens(
      res,
      {
        id: agent.id,
        role: "agent",
        agencyId: null,
        membershipId: null,
      },
      req.body.isMobile,
    );

    await markTaskCompleted(
      { agentId: agent.id, agencyId: undefined },
      "VERIFY_ACCOUNT",
    );

    res.status(201).json({
      message: "Agent registered successfully!",
      data: agent,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// 🏦 Create Agency Bank Account
export const createAgencyBankAccount = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bankName, accountName, accountNumber, currency, isPrimary } =
      req.body;
    const agencyId = req.agency.id ?? undefined;
    const agentId = req.agent.id ?? undefined;

    if (!bankName || !accountName || !accountNumber) {
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
    await markTaskCompleted({ agentId, agencyId }, "ADD_BANK_ACCOUNT");

    res.status(201).json({
      success: true,
      bankAccount,
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
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        memberships: {
          select: {
            id: true,
            agencyId: true,
            agency: { select: { name: true, id: true } },
            role: {
              select: { name: true, id: true, description: true, key: true },
            },
          },
        },
      },
    });

    if (!agent) return next(new ValidationError("Invalid email or password!"));

    // Verify password
    const isMatch = await bcrypt.compare(password, agent.password!);
    if (!isMatch)
      return next(new ValidationError("Invalid email or password!"));

    const membership = agent.memberships[0];

    const tokens = issueAuthTokens(
      res,
      {
        id: agent.id,
        role: "agent",
        agencyId: membership?.agency.id ?? null,
        membershipId: membership?.id ?? null,
      },
      isMobile,
    );
    // send response
    res.status(200).json({
      message: "Login successful!",
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        memberships: agent.memberships || {},
      },

      ...tokens,
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
