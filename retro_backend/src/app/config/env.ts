import dotenv from "dotenv";
dotenv.config();

interface envConfig {
  PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CLOUDINARY_KEY_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_SEC: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SMTP_PASS: string;
  SMTP_USER: string;
  GEMINI_API_KEY: string;
}

const envVariables = (): envConfig => {
  const requiredVariables = [
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NODE_ENV",
    "FRONTEND_URL",
    "CLOUDINARY_KEY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_SEC",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SMTP_PASS",
    "SMTP_USER",
    "GEMINI_API_KEY",
  ];

  requiredVariables.forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`Missing required environment variable: ${v}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    NODE_ENV: process.env.NODE_ENV as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    CLOUDINARY_KEY_NAME: process.env.CLOUDINARY_KEY_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_SEC: process.env.CLOUDINARY_SEC as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_USER: process.env.SMTP_USER as string,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
  };
};

export const envVars = envVariables();
