import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { ICreateOrderPayload } from "./order.interface";
import {
  OrderStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Order, Prisma } from "../../../generated/prisma/client";
import {
  orderFilterableFields,
  orderIncludingConfig,
  orderSearchedFields,
} from "./order.constant";

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
    throw new AppError(
      status.NOT_FOUND,
      "Customer profile not found for this user",
    );
  }

  // when payload is empty
  if (!payload.orderItems || payload.orderItems.length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "No items provided to create an order",
    );
  }

  // create order part
  const result = await prisma.$transaction(async (tx) => {
    let calculateTotalAmount = 0;
    const itemsToCreate = [];

    // find the product variant and check stock
    for (const item of payload.orderItems) {
      const variants = await tx.productVariant.findUnique({
        where: {
          id: item.productVariantId,
        },
        include: {
          product: {
            select: {
              tags: true,
            },
          },
        },
      });

      if (!variants) {
        throw new AppError(status.NOT_FOUND, "Item not found");
      }

      if (variants.stock < item.quantity) {
        throw new AppError(
          status.BAD_REQUEST,
          `Insufficient stock for variant. Available: ${variants.stock}, Requested: ${item.quantity}`,
        );
      }

      // tag validation
      const availableTags = variants.product.tags;

      if (availableTags.length > 0) {
        if (!item.selectedTag) {
          throw new AppError(status.BAD_REQUEST, "Please select a tag");
        }

        if (!availableTags.includes(item.selectedTag)) {
          throw new AppError(status.BAD_REQUEST, "Invalid tag selected");
        }
      }

      await tx.productVariant.update({
        where: {
          id: item.productVariantId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      calculateTotalAmount =
        calculateTotalAmount + variants.price * item.quantity;

      itemsToCreate.push({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: variants.price,
        selectedTag: item.selectedTag ?? null,
      });
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
      selectedTag: item.selectedTag,
    }));

    await tx.orderItem.createMany({
      data: createOrderItem,
    });

    // noew clear the cart
    await tx.cart.deleteMany({
      where: {
        customerId,
      },
    });

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

const getAllOrdersService = async (
  user: IRequestUserInterface,
  query: IQueryParams,
) => {
  // verify user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      customers: true,
      admins: true,
      sellers: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  let whereConditions: Prisma.OrderWhereInput = {};

  // for seller
  if (userData.role === Role.SELLER) {
    const sellerId = userData.sellers[0]?.id;

    if (!sellerId) {
      throw new AppError(
        status.NOT_FOUND,
        "Seller profile not found for this user",
      );
    }

    whereConditions = {
      orderItems: {
        some: {
          productVariant: {
            product: {
              sellerId: sellerId,
            },
          },
        },
      },
    };
  }

  // for customer
  if (userData.role === Role.CUSTOMER) {
    const customerId = userData.customers[0]?.id;

    if (!customerId) {
      throw new AppError(
        status.NOT_FOUND,
        "Customer profile not found for this user",
      );
    }

    whereConditions = {
      customerId: customerId,
    };
  }

  const orderItemsInclude = {
    orderItems: {
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                name: true,
                teamName: true,
                year: true,
                brand: true,
              },
            },
          },
        },
      },
    },
  };

  if (query.contactNumber && typeof query.contactNumber === "string") {
    whereConditions.contactNumber = query.contactNumber;
    delete query.contactNumber;
  }

  const queryBuilders = new QueryBuilder<
    Order,
    Prisma.OrderWhereInput,
    Prisma.OrderInclude
  >(prisma.order, query, {
    searchableFields: orderSearchedFields,
    filterableFields: orderFilterableFields,
  });

  const result = await queryBuilders
    .where(whereConditions)
    .search()
    .filter()
    .sort()
    .include(orderItemsInclude)
    .dynamicInclude(orderIncludingConfig)
    .fields()
    .pagination()
    .execute();

  return result;
};

const updateOrderService = async (
  orderId: string,
  user: IRequestUserInterface,
  payload: { orderStatus: OrderStatus },
) => {
  // find the user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      customers: true,
      sellers: true,
      admins: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  // find the order
  const existOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!existOrder) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  if (
    existOrder.orderStatus === OrderStatus.CANCELLED ||
    existOrder.orderStatus === OrderStatus.DELIVERED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Completed or cancelled orders cannot be updated",
    );
  }

  // for seller and admin
  if (userData.role === Role.SELLER) {
    const sellerId = userData.sellers[0]?.id;

    if (!sellerId) {
      throw new AppError(
        status.NOT_FOUND,
        "Seller profile not found for this user",
      );
    }

    // find the own order by seller
    const isOwnOrder = existOrder.orderItems.some(
      (item) => item.productVariant.product.sellerId === sellerId,
    );

    if (!isOwnOrder) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized to update order");
    }
  }

  const updateStatus = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      orderStatus: payload.orderStatus,
      paymentStatus:
        payload.orderStatus === OrderStatus.DELIVERED
          ? PaymentStatus.PAID
          : existOrder.paymentStatus,
    },
  });
  return updateStatus;
};

const cancelOrderService = async (
  orderId: string,
  user: IRequestUserInterface,
  payload: { orderStatus: OrderStatus },
) => {
  // find the user
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      customers: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  // find the order
  const existOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        select: {
          productVariantId: true,
          quantity: true,
        },
      },
    },
  });

  if (!existOrder) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  if (
    existOrder.orderStatus === OrderStatus.CANCELLED ||
    existOrder.orderStatus === OrderStatus.DELIVERED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Completed or cancelled orders cannot be updated",
    );
  }

  // verify customer
  if (existOrder.customerId !== userData.customers[0]?.id) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized to update order");
  }

  const isValidCurrStatus =
    existOrder.orderStatus === OrderStatus.PENDING ||
    existOrder.orderStatus === OrderStatus.PROCESSING;

  if (payload.orderStatus === OrderStatus.CANCELLED && isValidCurrStatus) {
    await prisma.$transaction(async (tx) => {
      // update order
      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          orderStatus: payload.orderStatus,
        },
      });

      // update inventory
      for (const item of existOrder.orderItems) {
        await tx.productVariant.update({
          where: {
            id: item.productVariantId,
          },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    });
  }
};

export const orderService = {
  createOrderService,
  getAllOrdersService,
  updateOrderService,
  cancelOrderService,
};
