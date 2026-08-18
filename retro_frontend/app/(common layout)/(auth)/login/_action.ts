"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { setCookie } from "@/lib/cookieUtils";
import setTokenInCookies from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginAction(
  payload: ILoginPayload,
): Promise<ILoginResponse | ApiErrorResponse> {
  const parsedPayload = loginZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid Input";

    return {
      ok: false,
      message: firstError,
    };
  }

  try {
    const response = await httpClient.httpPost<ILoginResponse>(
      "auth/sign-in/email",
      parsedPayload.data,
    );

    // console.log("response data ✨✨🧨", response.data);

    const { token } = response.data as unknown as ILoginResponse;
    // console.log("better auth token ~ ✨✨✨🧨", token);

    // setCookie("better-auth.session_token", token, 60 * 60 * 24);
    // setTokenInCookies("better-auth.session_token", token, 60 * 60 * 24);

    const cookieStore = await cookies();
    cookieStore.set("better-auth.session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    redirect("/dashboard");
  } catch (error: any) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return {
      ok: false,
      message: `Login failed: ${error.message}`,
    };
  }
}
