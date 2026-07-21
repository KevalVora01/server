export const env = {
  PORT: Number(process.env.PORT) || 5000,

  CLIENT_URL: process.env.CLIENT_URL,

  NODE_ENV: process.env.NODE_ENV || "development",

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

  DATABASE_URL:
    process.env.DATABASE_URL,

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET!,

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET!,

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  SMTP_HOST:
    process.env.SMTP_HOST,

  SMTP_PORT:
    Number(process.env.SMTP_PORT) || 587,

  SMTP_USER:
    process.env.SMTP_USER,

  SMTP_PASSWORD:
    process.env.SMTP_PASSWORD,

  SMTP_FROM_NAME:
    process.env.SMTP_FROM_NAME,

  SMTP_FROM_EMAIL:
    process.env.SMTP_FROM_EMAIL,

  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME,

  CLOUDINARY_API_KEY:
    process.env.CLOUDINARY_API_KEY,

  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET,

  STRIPE_SECRET_KEY:
    process.env.STRIPE_SECRET_KEY,

  STRIPE_WEBHOOK_SECRET:
    process.env.STRIPE_WEBHOOK_SECRET,

  SOCIETY_NAME:
    process.env.SOCIETY_NAME || "My Society",

  SOCIETY_ADDRESS:
    process.env.SOCIETY_ADDRESS || "123 Main St, City, Country",
};