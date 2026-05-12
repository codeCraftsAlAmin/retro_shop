import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IUpdateProfile } from "../../interfaces/updateProfile.interface";

const updateMyProfileService = async (
  user: IRequestUserInterface,
  payload: IUpdateProfile,
) => {
  const customerData = await prisma.customer.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!customerData) {
    throw new AppError(status.UNAUTHORIZED, "Customer not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedCustomer;
    // update customer profile
    if (payload && Object.keys(payload).length > 0) {
      updatedCustomer = await tx.customer.update({
        where: {
          email: user.email,
        },
        data: {
          ...payload,
        },
      });
    }

    // update user profile
    if (
      payload.profilePhoto ||
      payload.name ||
      payload.gender ||
      payload.phone
    ) {
      const userData = {
        name: payload.name ?? customerData.name,
        phone: payload.phone ?? customerData.phone,
        gender: payload.gender ?? customerData.gender,
        profilePhoto: payload.profilePhoto ?? customerData.profilePhoto,
      };

      await tx.user.update({
        where: {
          id: customerData.userId,
        },
        data: {
          name: userData.name,
          phone: userData.phone,
          gender: userData.gender,
          image: userData.profilePhoto,
        },
      });
    }

    return updatedCustomer;
  });

  return result;
};

export const customerService = {
  updateMyProfileService,
};
