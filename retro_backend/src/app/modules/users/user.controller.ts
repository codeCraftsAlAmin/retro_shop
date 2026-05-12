import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await userService.getMyProfileService(user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "My profile fetched successfully",
      data: result,
    });
  },
);

const getAllUsersController = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user;

    const result = await userService.getAllUsersService(
      query as IQueryParams,
      user!,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "All users fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const userController = {
  getMyProfileController,
  getAllUsersController,
};
