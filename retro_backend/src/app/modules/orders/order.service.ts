import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { Role } from "../../../generated/prisma/enums";
import { ICreateOrderPayload } from "./order.interface";

const createOrderService = async (
  user: IRequestUserInterface,
  payload: ICreateOrderPayload,
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      customers: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  // user role can't be seller
  if (userData.role === Role.SELLER) {
    throw new AppError(status.FORBIDDEN, "Seller can't create order");
  }

  // create order part
  const result = await prisma.$transaction(async (tx) => {
    // cart
    const createCart = await tx.cart.create({
      data: {
        customerId: userData.customers[0]?.id as string,
        quantity: payload.carts[0].quantity,
        productVariantId: payload.carts[0].productVariantId,
      },
    });

    // order
    const createOrder = await tx.order.create({
      data: {
        customerId: userData.customers[0]?.id as string,
        totalAmount: payload.order.totalAmount,
        contactNumber: payload.order.contactNumber,
        deliveryAddress: payload.order.deliveryAddress,
        orderStatus: payload.order.orderStatus,
        paymentStatus: payload.order.paymentStatus,
      },
    });

    // order item
    const createOrderItem = await tx.orderItem.create({
      data: {
        orderId: createOrder.id,
        productVariantId: payload.orderItems[0].productVariantId,
        quantity: payload.orderItems[0].quantity,
        price: payload.orderItems[0].price,
      },
    });

    return {
      createCart,
      createOrder,
      createOrderItem,
    };
  });

  if (!result) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create order");
  }

  return result;
};

export const orderService = {
  createOrderService,
};
