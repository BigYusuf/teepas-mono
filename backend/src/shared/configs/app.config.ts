import "dotenv/config";
import { getEnv } from "../../common/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
  PORT: getEnv("PORT", "9191"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  SMTP_HOST: getEnv("SMTP_HOST"),
  SMTP_PORT: getEnv("SMTP_PORT"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  SMTP_SERVICE: getEnv("SMTP_SERVICE"),
  REDIS_DATABASE_URI: getEnv("REDIS_DATABASE_URI"),
  // EMAIL_USER: getEnv("EMAIL_USER"),
  // EMAIL_CLIENT_ID: getEnv("EMAIL_CLIENT_ID"),
  // EMAIL_CLIENT_SECRET: getEnv("EMAIL_CLIENT_SECRET"),
  // EMAIL_REDIRECT_URI: getEnv("EMAIL_REDIRECT_URI"),
  // EMAIL_REFRESH_TOKEN: getEnv("EMAIL_REFRESH_TOKEN"),
  // EMAIL_ACCESS_TOKEN: getEnv("EMAIL_ACCESS_TOKEN"),

  JWT: {
    SECRET: getEnv("ACCESS_TOKEN_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    REFRESH_SECRET: getEnv("REFRESH_TOKEN_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  },
});

export const config = appConfig();
