import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenHelpers } from "../../utils/token";
import { cookieHelpers } from "../../utils/cookie";

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

const signInController = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.signInService(req.body);

  tokenHelpers.setBetterAuthSessionCookie(res, result.token as string);

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "User signed in successfully.",
    data: result,
  });
});

const signOutController = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];

  const result = await authService.signOutService(sessionToken as string);

  cookieHelpers.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "User signed out successfully.",
    data: result,
  });
});

export const authController = {
  signUpController,
  signInController,
  signOutController,
};
