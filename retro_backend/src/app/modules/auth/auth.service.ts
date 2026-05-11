import {
  IChangePassword,
  IResetPassword,
  ISignInEmail,
  ISignUpEmail,
  IVerifyEmail,
} from "./auth.interface";
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

const verifyEmailService = async (payload: IVerifyEmail) => {
  const { email, otp } = payload;

  try {
    const result = await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });

    return result;
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to verify email");
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

const googleSuccessService = async (session: Record<string, any>) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // find customer
      const isCustomer = await tx.customer.findUnique({
        where: {
          email: session.user.email,
        },
      });

      // create customer profile
      if (!isCustomer) {
        await tx.customer.create({
          data: {
            userId: session.user.id,
            name: session.user.name,
            email: session.user.email,
          },
        });
      }
      return session.user;
    });
  } catch (error) {
    await auth.api.revokeSession({
      body: {
        token: session.session.token,
      },
      headers: {
        Authorization: `Bearer ${session.session.token}`,
      },
    });
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Profile creation failed. Please try again.",
    );
  }
};

const changePasswordService = async (
  payload: IChangePassword,
  sessionToken: string,
) => {
  // verify session
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const { oldPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      newPassword: newPassword,
      currentPassword: oldPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return {
    ...result,
  };
};

const forgetPasswordRequestService = async (payload: { email: string }) => {
  const { email } = payload;

  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  if (user.status === UserStatus.BANNED || user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been banned or deleted. Please contact support for assistance.",
    );
  }

  const data = await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });

  return data;
};

const resetPasswordService = async (payload: IResetPassword) => {
  const { email, otp, newPassword } = payload;

  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  if (user.status === UserStatus.BANNED || user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been banned or deleted. Please contact support for assistance.",
    );
  }

  // verify the otp
  const verifyEmailOtp = await auth.api.checkVerificationOTP({
    body: {
      email,
      type: "forget-password",
      otp,
    },
  });

  if (!verifyEmailOtp) {
    throw new AppError(status.UNAUTHORIZED, "Invalid OTP");
  }

  // reset passwrod
  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  // delete last session data
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  return result;
};

export const authService = {
  signUpService,
  signInService,
  signOutService,
  googleSuccessService,
  verifyEmailService,
  changePasswordService,
  forgetPasswordRequestService,
  resetPasswordService,
};
