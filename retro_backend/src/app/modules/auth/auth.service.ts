import { ISignInEmail, ISignUpEmail } from "./auth.interface";
import AppError from "../../middleware/appError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { UserStatus } from "../../../generated/prisma/enums";

const signUpService = async (payload: ISignUpEmail) => {
  const { name, email, password } = payload;

  // check if user already exist
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(status.BAD_REQUEST, "User already exists");
  }

  // create user account
  const authData = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  const userId = authData.user?.id;

  if (!userId) {
    throw new AppError(status.BAD_REQUEST, "User not created");
  }

  try {
    // create customer profile in database
    await prisma.$transaction(async (tx) => {
      await tx.customer.create({
        data: {
          name,
          email,
          userId,
          phone: authData.user?.phone || null,
          address: "",
        },
      });
    });
    return { ...authData };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(status.INTERNAL_SERVER_ERROR, "User not created");
  }
};

const signInService = async (payload: ISignInEmail) => {
  const { email, password } = payload;

  try {
    // sign in user
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!result) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to sign in");
    }

    if (result.user.status === UserStatus.BANNED || result.user.isDeleted) {
      throw new AppError(
        status.FORBIDDEN,
        "Your account has been banned or deleted. Please contact support for assistance.",
      );
    }

    return { ...result };
  } catch (error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
  }
};

const signOutService = async (sessionToken: string) => {
  // verify session
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

export const authService = {
  signUpService,
  signInService,
  signOutService,
};
