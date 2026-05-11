import { Request, Response } from "express";
import ejs from "ejs";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenHelpers } from "../../utils/token";
import { cookieHelpers } from "../../utils/cookie";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";
import { templates } from "../../utils/templates";
import AppError from "../../middleware/appError";

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

const verifyEmailController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.verifyEmailService(req.body);

    if (!result || !result.user) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Verification failed");
    }

    // set better auth token to cookie
    tokenHelpers.setBetterAuthSessionCookie(res, result.token as string);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Email verified successfully.",
      data: result,
    });
  },
);

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

const googleLoginController = catchAsync(
  async (req: Request, res: Response) => {
    // redirect path
    const redirectPath = req.query.redirect || "/";

    // callback url
    const callbackUrl = `${envVars.BETTER_AUTH_URL}/api/auth/google/success?redirect=${redirectPath}`;

    // get html content
    const htmlContent = ejs.render(templates.googleRedirect, {
      betterAuthUrl: envVars.BETTER_AUTH_URL,
      callbackUrl: callbackUrl,
    });

    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  },
);

const googleSuccessController = catchAsync(
  async (req: Request, res: Response) => {
    // redirect path
    const redirectPath = (req.query.redirect as string) || "/";

    // get session token
    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/login?error=session_token_missing`,
      );
    }

    // verify session
    const session = await auth.api.getSession({
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!session || !session.user) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/login?error=session_token_missing`,
      );
    }

    const result = await authService.googleSuccessService(session);

    // set cookie
    tokenHelpers.setBetterAuthSessionCookie(res, result.token as string);

    // redirect
    const isValidRedirectPath =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//");

    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
  },
);

const googleErrorController = catchAsync(
  async (req: Request, res: Response) => {
    const error = (req.query.error as string) || "oauth_failed";

    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
  },
);

const changePasswordController = catchAsync(
  async (req: Request, res: Response) => {
    // get session token from cookie
    const sessionToken = req.cookies["better-auth.session_token"];

    const result = await authService.changePasswordService(
      req.body,
      sessionToken,
    );

    // set token to cookie
    tokenHelpers.setBetterAuthSessionCookie(res, result.token as string);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Password changed successfully",
    });
  },
);

const forgetPasswordRequestController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.forgetPasswordRequestService(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message:
        "Password reset request sent successfully. Please check your email for the verification code.",
      data: result,
    });
  },
);

const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.resetPasswordService(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Password reset successfully",
    });
  },
);

export const authController = {
  signUpController,
  signInController,
  signOutController,
  googleLoginController,
  googleSuccessController,
  googleErrorController,
  verifyEmailController,
  changePasswordController,
  forgetPasswordRequestController,
  resetPasswordController,
};
