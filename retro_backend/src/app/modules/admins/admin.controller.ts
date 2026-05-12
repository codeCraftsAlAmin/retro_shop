import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { adminService } from "./admin.service";
import { Role } from "../../../generated/prisma/enums";

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

const updateUserRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const result = await adminService.updateUserRoleService(
      id as string,
      role as Role,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "User role updated successfully",
      data: result,
    });
  },
);

export const adminController = {
  updateMyProfileController,
  updateUserRoleController,
};
