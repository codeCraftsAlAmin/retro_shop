import status from "http-status";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IReview } from "./review.interface";
import { OrderStatus, Role, UserStatus } from "../../../generated/prisma/enums";

const createReview = async (
  productId: string,
  user: IRequestUserInterface,
  payload: IReview,
) => {
  // find user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      customers: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const customerId = userData?.customers[0]?.id;

  if (!customerId) {
    throw new AppError(status.NOT_FOUND, "Customer profile not found");
  }

  // only active user can give review
  if (
    userData.isDeleted === true ||
    !userData.emailVerified ||
    userData.status !== UserStatus.ACTIVE
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to give review",
    );
  }

  // find product
  const isProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!isProduct) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  // only delivered product can be rated
  const isDelivered = await prisma.product.findUnique({
    where: {
      id: productId,
      variants: {
        some: {
          orderItems: {
            some: {
              order: {
                orderStatus: OrderStatus.DELIVERED,
                customerId,
              },
            },
          },
        },
      },
    },
  });

  if (!isDelivered) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review delivered products",
    );
  }

  // avoid spam rating
  const existingRating = await prisma.review.findFirst({
    where: {
      productId: productId,
      userId: userData.id,
      rating: {
        gt: 0,
      },
    },
  });

  if (existingRating) {
    throw new AppError(status.BAD_REQUEST, "You already rated this product");
  }

  // create review
  const result = await prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      productId,
      userId: userData.id,
    },
  });

  // calculate avg rating
  const avgRating = await prisma.review.aggregate({
    where: {
      productId,
      rating: { gt: 0 },
    },
    _avg: {
      rating: true,
    },
  });

  return {
    ...result,
    avgRating: avgRating._avg.rating || 0,
  };
};

const updateReview = async (
  reviewId: string,
  user: IRequestUserInterface,
  comment: string,
) => {
  // find user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find review
  const isReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!isReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // check if review is owned by user
  if (isReview.userId !== userData.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this review",
    );
  }

  // update review
  const result = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      comment,
    },
  });

  return result;
};

const getAllReviews = async () => {
  const result = await prisma.$transaction(async (tx) => {
    const reviews = await tx.review.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        product: {
          select: {
            name: true,
            id: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const reviewCount = await tx.review.count({
      where: {
        isDeleted: false,
      },
    });

    return {
      reviews,
      reviewCount,
    };
  });

  return result;
};

const deleteReview = async (reviewId: string, user: IRequestUserInterface) => {
  // find user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find review
  const isReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!isReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (isReview.userId !== userData.id && userData.role !== Role.ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this review",
    );
  }

  // delete review
  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      isDeleted: true,
    },
  });
};

const replyReview = async (
  parentId: string,
  user: IRequestUserInterface,
  comment: string,
) => {
  // find user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find review
  const isReview = await prisma.review.findUnique({
    where: {
      id: parentId,
    },
  });

  if (!isReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  // reply review
  const result = await prisma.review.create({
    data: {
      comment,
      userId: userData.id,
      parentId,
      productId: isReview.productId,
    },
  });

  return result;
};

export const reviewService = {
  createReview,
  updateReview,
  getAllReviews,
  deleteReview,
  replyReview,
};
