import {
  OrderStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";

const getDashboardStatsData = async (user: IRequestUserInterface) => {
  let stateData;

  switch (user.role) {
    case Role.ADMIN:
      stateData = await getAdminStatsData();
      break;

    case Role.SELLER:
      stateData = await getSellerStatsData(user);
      break;

    default:
      throw new AppError(401, "Invalid user role");
  }

  return stateData;
};

const getAdminStatsData = async () => {
  const [
    userCount,
    categoryCount,
    productCount,
    orderCount,
    reviewCount,
    revenueCount,
  ] = await Promise.all([
    // total users
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),

    // total categories
    prisma.productCategory.count(),

    // total products
    prisma.product.count({
      where: { isDeleted: false },
    }),

    // total orders
    prisma.order.groupBy({
      by: ["orderStatus"],
      _count: true,
    }),

    // total reviews
    prisma.review.count(),

    // total revenue
    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    getAdminPieChartData(),
  ]);

  return {
    totalCustomersCount:
      userCount.find((user) => user.role === Role.CUSTOMER)?._count || 0,

    totalSellersCount:
      userCount.find((user) => user.role === Role.SELLER)?._count || 0,

    totalCategoryCount: categoryCount,

    totalProductCount: productCount,

    totalCancelledOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.CANCELLED)
        ?._count || 0,

    totalPendingOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.PENDING)
        ?._count || 0,

    totalDeliveredOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.DELIVERED)
        ?._count || 0,

    totalShippedOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.SHIPPED)
        ?._count || 0,

    totalProcessingOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.PROCESSING)
        ?._count || 0,

    totalReviewCount: reviewCount,

    totalRevenueCount: revenueCount._sum?.totalAmount || 0,
  };
};

const getSellerStatsData = async (user: IRequestUserInterface) => {
  const [categoryCount, productCount, orderCount, reviewCount, revenueCount] =
    await Promise.all([
      // total categories
      prisma.product.groupBy({
        where: {
          sellerId: user.userId,
          isDeleted: false,
        },
        by: ["categoryId"],
      }),

      // total products
      prisma.product.count({
        where: { isDeleted: false, sellerId: user.userId },
      }),

      // total orders
      prisma.order.groupBy({
        where: {
          orderItems: {
            some: {
              productVariant: {
                product: {
                  sellerId: user.userId,
                },
              },
            },
          },
        },
        by: ["orderStatus"],
        _count: true,
      }),

      // total reviews
      prisma.review.count({
        where: {
          product: {
            sellerId: user.userId,
          },
        },
      }),

      // total revenue
      prisma.orderItem.findMany({
        where: {
          productVariant: {
            product: {
              sellerId: user.userId,
            },
          },
          order: {
            paymentStatus: PaymentStatus.PAID,
          },
        },
        select: {
          price: true,
          quantity: true,
        },
      }),

      getSellerPieChartData(user),
    ]);

  const totlaSellerRevenue = revenueCount.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);

  return {
    totalCategoryCount: categoryCount.length,

    totalProductCount: productCount,

    totalCancelledOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.CANCELLED)
        ?._count || 0,

    totalPendingOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.PENDING)
        ?._count || 0,

    totalDeliveredOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.DELIVERED)
        ?._count || 0,

    totalShippedOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.SHIPPED)
        ?._count || 0,

    totalProcessingOrderCount:
      orderCount.find((order) => order.orderStatus === OrderStatus.PROCESSING)
        ?._count || 0,

    totalReviewCount: reviewCount,

    totalRevenueCount: totlaSellerRevenue,
  };
};

// pie charts
const getAdminPieChartData = async () => {
  const countOrder = await prisma.order.groupBy({
    by: ["orderStatus"],
    _count: {
      id: true,
    },
  });

  const satusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "#f59e0b",
    [OrderStatus.PROCESSING]: "#3b82f6",
    [OrderStatus.DELIVERED]: "#10b981",
    [OrderStatus.CANCELLED]: "#ef4444",
    [OrderStatus.SHIPPED]: "#8b5cf6",
  };

  return countOrder.map((order) => ({
    label: order.orderStatus,
    value: order._count.id,
    color: satusColors[order.orderStatus] || "#6B7280",
  }));
};

const getSellerPieChartData = async (user: IRequestUserInterface) => {
  // total orders
  const countOrder = await prisma.orderItem.findMany({
    where: {
      productVariant: {
        product: {
          sellerId: user.userId,
        },
      },
    },
    include: {
      order: {
        select: { orderStatus: true },
      },
    },
  });

  const statusCountMap = countOrder.reduce(
    (acc, item) => {
      const status = item.order.orderStatus;

      acc[status] = (acc[status] || 0) + 1;

      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  const satusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "#f59e0b",
    [OrderStatus.PROCESSING]: "#3b82f6",
    [OrderStatus.DELIVERED]: "#10b981",
    [OrderStatus.CANCELLED]: "#ef4444",
    [OrderStatus.SHIPPED]: "#8b5cf6",
  };

  return Object.entries(statusCountMap).map(([status, count]) => ({
    label: status,
    value: count,
    color: satusColors[status as OrderStatus] || "#6B7280",
  }));
};

// bar charts
// const getAdminBarChartData = async () => {
  
// };

export const statsService = {
  getDashboardStatsData,
};
