// app/authDashboard/layout.tsx

import Navbar from "@/components/authorDashboard/navbar/navbar";


export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{}>; // 🔥 required for validation
}) {

  const resolvedParams = await params; // still must await even if empty {}

  return (
    <>
      <Navbar userId={""} /> 
      {children}
    </>
  );
}
