
//login/page.tsx

import EmailOTPLogin from "@/components/OTP/emailOtp";




export const metadata = {
  title: 'Secure Login - Email OTP',
  description: 'Secure authentication with Email OTP',
};

export default function LoginPage() {
  return <EmailOTPLogin />;
}