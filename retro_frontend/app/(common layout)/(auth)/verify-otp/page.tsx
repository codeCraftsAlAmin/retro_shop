import OtpPage from "@/components/modules/auth/VerifyOtp";
interface VerifyOtpPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function verifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  const { email } = await searchParams;
  return <OtpPage email={email} />;
}
