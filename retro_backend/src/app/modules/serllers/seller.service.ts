import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IUpdateProfile } from "../../interfaces/updateProfile.interface";

const updateMyProfileService = async (
  user: IRequestUserInterface,
  payload: IUpdateProfile,
) => {
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.UNAUTHORIZED, "Seller not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedSeller;
    // update seller profile
    if (payload && Object.keys(payload).length > 0) {
      updatedSeller = await tx.seller.update({
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
        name: payload.name ?? sellerData.name,
        phone: payload.phone ?? sellerData.phone,
        gender: payload.gender ?? sellerData.gender,
        profilePhoto: payload.profilePhoto ?? sellerData.profilePhoto,
      };

      await tx.user.update({
        where: {
          id: sellerData.userId,
        },
        data: {
          name: userData.name,
          phone: userData.phone,
          gender: userData.gender,
          image: userData.profilePhoto,
        },
      });
    }

    return updatedSeller;
  });

  return result;
};

export const sellerService = {
  updateMyProfileService,
};
