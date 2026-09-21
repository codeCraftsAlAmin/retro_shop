import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.types";
import { IVerifyResponse } from "@/types/auth.types";
import {
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import axios from "axios";
import { redirect } from "next/navigation";

export default async function OtpAction(
  payload: IVerifyEmailPayload,
): Promise<IVerifyResponse | ApiErrorResponse> {
  try {
    const parsedPayload = verifyEmailZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
      const firstError =
        parsedPayload.error.issues[0]?.message || "Invalid Input";

      return {
        ok: false,
        message: firstError,
      };
    }

    await httpClient.httpPost<IVerifyResponse>(
      "auth/email-otp/verify-email",
      parsedPayload.data,
    );
  } catch (error: unknown) {
    // handle axios/api errors
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        message: error.response?.data?.message ?? "Email verification failed",
      };
    }
    // handle unexpected errors
    return {
      ok: false,
      message: "Email verification failed",
    };
  }
  redirect("/login");
}
