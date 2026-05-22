import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { orderService } from "./order.service";

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

export const orderController = {
  createOrderController,
};
