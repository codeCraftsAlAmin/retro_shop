import { ISignUpEmail } from "./auth.interface";
import AppError from "../../middleware/appError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { Gender, Role, UserStatus } from "../../../generated/prisma/enums";

const signUpService = async (payload: ISignUpEmail) => {
  const { name, email, password } = payload;
  try {
    // check if user already exist
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError(status.BAD_REQUEST, "User already exists");
    }

    // use transaction to create user and customer profile
    const result = await prisma.$transaction(async (tx) => {
      const data = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      const userId = data.user?.id;

      if (!userId) {
        throw new AppError(status.BAD_REQUEST, "User not created");
      }

      // create user profile in database
      await tx.customer.create({
        data: {
          name,
          email,
          userId,
          phone: data.user?.phone,
          gender: data.user?.gender as Gender,
          isDeleted: data.user?.isDeleted as boolean,
          deletedAt: data.user?.deletedAt as Date,
        },
      });

      return data;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  signUpService,
};
