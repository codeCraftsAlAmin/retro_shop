import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Gender, Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import AppError from "../middleware/appError";
import status from "http-status";
import { waitUntil } from "@vercel/functions";
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // google login configuration only for customers
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,

      mapProfileToUser: (profile) => {
        return {
          ...profile,
          role: Role.CUSTOMER,
          gender: Gender.OTHER,
          status: UserStatus.ACTIVE,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  // additational fields
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
        defaultValue: Gender.OTHER,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: Role.CUSTOMER,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: UserStatus.ACTIVE,
      },
      isDeleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  // plugins helps to add extra features such as use Bearer token
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        // email verification
        if (type === "email-verification") {
          // find user
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            throw new AppError(status.NOT_FOUND, "User not found");
          }

          // no need to send verification for admin
          if (user.role === Role.ADMIN) return;

          // send
          waitUntil(
            sendEmail({
              to: email,
              subject: "Email Verification",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            }),
          );
        }

        // forget pass req
        if (type === "forget-password") {
          //find user
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            throw new AppError(status.NOT_FOUND, "User not found");
          }
          // console.log("Sending email to forget password", email);
          waitUntil(
            sendEmail({
              to: email,
              subject: "Forget Password",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            }),
          );
        }
      },
      expiresIn: 60 * 2, // 2mins
      otpLength: 6,
    }),
  ],

  // better-auth session configuration
  session: {
    expiresIn: 60 * 60 * 24, // 1d
    updatedAt: 60 * 60 * 24, // 1d
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1d
    },
  },
});
