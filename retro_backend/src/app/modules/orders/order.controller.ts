import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { orderService } from "./order.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createOrderController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await orderService.createOrderService(user!, payload);

    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Order created successfully",
      data: result,
    });
  },
);

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;
  const result = await orderService.getAllOrdersService(
    user!,
    query as IQueryParams,
  );

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Orders fetched successfully",
    data: result,
  });
});

const updateOrderController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id;
    const payload = req.body;
    const result = await orderService.updateOrderService(
      id as string,
      user!,
      payload,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Order updated successfully",
      data: result,
    });
  },
);

export const orderController = {
  createOrderController,
  getAllOrders,
  updateOrderController,
};
