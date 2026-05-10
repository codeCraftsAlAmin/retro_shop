import { Response } from "express";
import { cookieHelpers } from "./cookie";

// set better auth session
const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieHelpers.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, // 1day
  });
};

export const tokenHelpers = {
  setBetterAuthSessionCookie,
};
