import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Gender, Role, UserStatus } from "../../generated/prisma/enums";
import { bearer } from "better-auth/plugins";

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
  plugins: [bearer()],

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
