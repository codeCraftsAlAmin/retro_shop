import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IUpdateProfile } from "../../interfaces/updateProfile.interface";
import { Role } from "../../../generated/prisma/enums";

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

const updateUserRoleService = async (id: string, payload: Role) => {
  // find user
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  if (userData.role === Role.ADMIN) {
    throw new AppError(status.FORBIDDEN, "You can not update admin role");
  }

  // customer to seller
  if (userData.role === Role.CUSTOMER && payload === Role.SELLER) {
    await prisma.$transaction(async (tx) => {
      // update user role
      await tx.user.update({
        where: {
          email: userData.email,
        },
        data: {
          role: Role.SELLER,
        },
      });

      // create seller profile
      await tx.seller.create({
        data: {
          userId: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          profilePhoto: userData.image,
        },
      });

      // delete customer profile
      await tx.customer.delete({
        where: {
          email: userData.email,
        },
      });
    });
  }

  // customer to admin
  if (userData.role === Role.CUSTOMER && payload === Role.ADMIN) {
    await prisma.$transaction(async (tx) => {
      // update user role
      await tx.user.update({
        where: {
          email: userData.email,
        },
        data: {
          role: Role.ADMIN,
        },
      });

      // create admin profile
      await tx.admin.create({
        data: {
          userId: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          profilePhoto: userData.image,
        },
      });

      // delete customer profile
      await tx.customer.delete({
        where: {
          email: userData.email,
        },
      });
    });
  }

  // seller to admin
  if (userData.role === Role.SELLER && payload === Role.ADMIN) {
    await prisma.$transaction(async (tx) => {
      // update user role
      await tx.user.update({
        where: {
          email: userData.email,
        },
        data: {
          role: Role.ADMIN,
        },
      });

      // create admin profile
      await tx.admin.create({
        data: {
          userId: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          profilePhoto: userData.image,
        },
      });

      // delete seller profile
      await tx.seller.delete({
        where: {
          email: userData.email,
        },
      });
    });
  }

  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return result;
};

export const adminService = {
  updateMyProfileService,
  updateUserRoleService,
};
