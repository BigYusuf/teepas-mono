import { CookieOptions, Response } from "express";
import { calculateExpirationDate } from "./date-time";
import { config } from "../../shared/configs/app.config";

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
  type?: "user" | "admin";
};

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production" ? true : false,
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: "/api", //REFRESH_PATH,
  };
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
  const expiresIn = config.JWT.EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: "/",
  };
};

export const setAuthenticationCookies = ({
  res,
  accessToken,
  refreshToken,
  type = "user",
}: CookiePayloadType): Response =>
  type === "admin"
    ? res
        .cookie("adminAccessToken", accessToken, getAccessTokenCookieOptions())
        .cookie(
          "adminRefreshToken",
          refreshToken,
          getRefreshTokenCookieOptions(),
        )
    : res
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (
  res: Response,
  type: "user" | "admin" = "user",
): Response =>
  type === "admin"
    ? res.clearCookie("adminAccessToken").clearCookie("adminRefreshToken", {
        path: "/api", //REFRESH_PATH,
      })
    : res.clearCookie("accessToken").clearCookie("refreshToken", {
        path: "/api", // REFRESH_PATH,
      });
