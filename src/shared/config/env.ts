import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  CLIENT_URL: process.env.CLIENT_URL,

  NODE_ENV : process.env.NODE_ENV || "development",

  DATABASE_HOST:
    process.env.DATABASE_HOST || "localhost",

  DATABASE_PORT:
    Number(process.env.DATABASE_PORT) || 5432,

  DATABASE_USER:
    process.env.DATABASE_USER || "postgres",

  DATABASE_PASSWORD:
    process.env.DATABASE_PASSWORD || "",

  DATABASE_NAME:
    process.env.DATABASE_NAME || "postgres",

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET!,

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET!,

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};