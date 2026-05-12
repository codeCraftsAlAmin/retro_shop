import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IUpdateProfile } from "../../interfaces/updateProfile.interface";

const updateMyProfileService = async (
  user: IRequestUserInterface,
  payload: IUpdateProfile,
) => {
  const adminData = await prisma.admin.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!adminData) {
    throw new AppError(status.UNAUTHORIZED, "Admin not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedAdmin;
    // update seller profile
    if (payload && Object.keys(payload).length > 0) {
      updatedAdmin = await tx.admin.update({
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
        name: payload.name ?? adminData.name,
        phone: payload.phone ?? adminData.phone,
        gender: payload.gender ?? adminData.gender,
        profilePhoto: payload.profilePhoto ?? adminData.profilePhoto,
      };

      await tx.user.update({
        where: {
          id: adminData.userId,
        },
        data: {
          name: userData.name,
          phone: userData.phone,
          gender: userData.gender,
          image: userData.profilePhoto,
        },
      });
    }

    return updatedAdmin;
  });

  return result;
};

export const adminService = {
  updateMyProfileService,
};
