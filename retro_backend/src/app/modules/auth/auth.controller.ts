import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

const signUpController = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.signUpService(req.body);

  sendResponse(res, {
    ok: true,
    statusCode: status.CREATED,
    message:
      "User registered successfully. Please check your email for the verification code.",
    data: result,
  });
});

export const authController = {
  signUpController,
};
