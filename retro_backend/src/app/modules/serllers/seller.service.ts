import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IUpdateProfile } from "../../interfaces/updateProfile.interface";
import { ISellerProduct } from "./seller.interface";

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

const createProductService = async (
  user: IRequestUserInterface,
  payload: ISellerProduct,
) => {
  // find user data
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.UNAUTHORIZED, "Seller not found");
  }

  // find category
  const category = await prisma.productCategory.findFirst({
    where: {
      name: payload.category.name,
    },
  });

  if (!category) {
    throw new AppError(status.BAD_REQUEST, "Category not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: payload.product.name,
        teamName: payload.product.teamName,
        year: payload.product.year,
        brand: payload.product.brand,
        description: payload.product.description ?? "",
        images: payload.product.images,
        sellerId: sellerData.id,
        categoryId: category.id,
      },
    });

    const newVariants = await tx.productVariant.createMany({
      data: payload.variants.map((variant) => {
        return {
          price: variant.price,
          stock: variant.stock,
          size: variant.size,
          productId: newProduct.id,
        };
      }),
    });

    return {
      newProduct,
      newVariants,
    };
  });

  return result;
};

export const sellerService = {
  updateMyProfileService,
  createProductService,
};
