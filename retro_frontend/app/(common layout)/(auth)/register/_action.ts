"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.types";
import { IRegisterRespone } from "@/types/auth.types";
import { IRegisterPayload, registerZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";
import axios from "axios";

export default async function RegisterAction(
  payload: IRegisterPayload,
): Promise<ApiErrorResponse | ApiErrorResponse> {
  const parsedPayload = registerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid Input";

    return {
      ok: false,
      message: firstError,
    };
  }

  try {
    const response = await httpClient.httpPost<IRegisterRespone>(
      "auth/sign-up/email",
      parsedPayload.data,
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }

    return {
      ok: false,
      message: "Registration failed",
    };
  }

  redirect("/login");
}
