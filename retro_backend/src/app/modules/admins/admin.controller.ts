import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { adminService } from "./admin.service";

const updateMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const payload = {
      ...req.body,
      profilePhoto: req.file?.path,
    };
    const result = await adminService.updateMyProfileService(user!, payload);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Your profile updated successfully",
      data: result,
    });
  },
);

export const adminController = {
  updateMyProfileController,
};
