import { Response } from "express";
import * as jwt from "jsonwebtoken";

type TokenPayload = {
  id: string;
  type: string;
  roles?: string[];
  tenantId?: string | null;
  reauthAt?: any | null;
};

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env["ACCESS_TOKEN_SECRET"]!, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(
    {
      id: payload.id,
      type: payload.type,
      tenantId: payload.tenantId || null,
    },
    process.env["REFRESH_TOKEN_SECRET"]!,
    {
      expiresIn: "7d",
    },
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env["ACCESS_TOKEN_SECRET"]!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env["REFRESH_TOKEN_SECRET"]!);
};

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
