import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { ICreateOrderPayload } from "./order.interface";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";

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

  const customerId = userData.customers[0]?.id;

  if (!customerId) {
    throw new AppError(status.NOT_FOUND, "Customer profile not found for this user");
  }

  // when payload is empty
  if (!payload.orderItems || payload.orderItems.length === 0) {
    throw new AppError(status.BAD_REQUEST, "No items provided to create an order");
  }

  // create order part
  const result = await prisma.$transaction(async (tx) => {

    let calculateTotalAmount = 0
    const itemsToCreate = []

    // find the product variant and check stock
    for (const item of payload.orderItems) {
      const variants = await tx.productVariant.findUnique({
        where: {
          id: item.productVariantId
        }
      })

      if (!variants) {
        throw new AppError(status.NOT_FOUND, "Item not found");
      }

      if (variants.stock < item.quantity) {
        throw new AppError(status.BAD_REQUEST, `Insufficient stock for variant. Available: ${variants.stock}, Requested: ${item.quantity}`);
      }

      await tx.productVariant.update({
        where: {
          id: item.productVariantId
        },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      calculateTotalAmount = calculateTotalAmount + (variants.price * item.quantity)

      itemsToCreate.push({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: variants.price,
      })
    }


    // order
    const createOrder = await tx.order.create({
      data: {
        customerId: customerId,
        totalAmount: calculateTotalAmount,
        contactNumber: payload.order.contactNumber,
        deliveryAddress: payload.order.deliveryAddress,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    // order item
    const createOrderItem = itemsToCreate.map((item) => ({
      orderId: createOrder.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      price: item.price,
    }))

    await tx.orderItem.createMany({
      data: createOrderItem,
    })

    // noew clear the cart
    await tx.cart.deleteMany({
      where: {
        customerId
      }
    })

    return {
      order: createOrder,
      orderItemCount: createOrderItem.length,
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
