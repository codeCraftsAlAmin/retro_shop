"use client";

import OtpAction from "@/app/(common layout)/(auth)/verify-otp/_action";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";

interface OtpPageProps {
  email?: string;
}

export default function OtpPage({ email }: OtpPageProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: IVerifyEmailPayload) => OtpAction(payload),
  });

  const form = useForm({
    defaultValues: {
      otp: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);

      if (!email) {
        setServerError("Email is missing.");
        return;
      }

      const result = await mutateAsync({
        email,
        otp: value.otp,
      });

      if (result && !result.ok) {
        setServerError(result.message || "Email verification failed");
      }
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to
          </p>
          <p className="break-all text-sm font-medium text-foreground">
            {email ?? "your email address"}
          </p>
        </div>

        <form
          method="POST"
          action="#"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="otp"
            validators={{
              onChange: verifyEmailZodSchema.shape.otp,
            }}
          >
            {(field) => (
              <div className="flex flex-col items-center gap-2">
                <InputOTP
                  maxLength={6}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={isPending}
                  aria-label="One-time verification code"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="size-11 text-lg sm:size-12"
                    />
                    <InputOTPSlot
                      index={1}
                      className="size-11 text-lg sm:size-12"
                    />
                    <InputOTPSlot
                      index={2}
                      className="size-11 text-lg sm:size-12"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="size-11 text-lg sm:size-12"
                    />
                    <InputOTPSlot
                      index={4}
                      className="size-11 text-lg sm:size-12"
                    />
                    <InputOTPSlot
                      index={5}
                      className="size-11 text-lg sm:size-12"
                    />
                  </InputOTPGroup>
                </InputOTP>

                {/* {field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )} */}
              </div>
            )}
          </form.Field>

          {serverError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                isPending={isSubmitting || isPending}
                pendingLabel="Verifying..."
                disabled={!canSubmit}
              >
                Verify Email
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
