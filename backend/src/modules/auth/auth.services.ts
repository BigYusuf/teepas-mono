import jwt from "jsonwebtoken";
import { Response } from "express";

import { setCookie } from "../../utils/cookies/setCookie";

type AuthRole = "user" | "agent" | "admin";

interface TokenPayload {
  id: string;
  role: AuthRole;
  agencyId?: string | null;
  membershipId?: string | null;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "1h",
    },
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const issueAuthTokens = (
  res: Response,
  payload: TokenPayload,
  isMobile = false,
) => {
  const { accessToken, refreshToken } = generateTokens(payload);

  // Clear existing cookies
  [
    "access_token",
    "refresh_token",
    "agent_access_token",
    "agent_refresh_token",
  ].forEach((cookie) => res.clearCookie(cookie));

  setCookie(
    res,
    payload.role == "agent" ? "agent_access_token" : "access_token",
    accessToken,
  );
  setCookie(
    res,
    payload.role == "agent" ? "agent_refresh_token" : "refresh_token",
    refreshToken,
  );

  return {
    accessToken: isMobile ? accessToken : undefined,
    refreshToken: isMobile ? refreshToken : undefined,
  };
};
