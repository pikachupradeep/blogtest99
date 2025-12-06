// app/user/[userId]/layout.tsx

import UserNavbar from "@/components/userDashboard/navbar/navbar"


export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}) {
  // Await the params
  const { userId } = await params
  
  return (
    <>
      <UserNavbar userId={userId} />
      {children}
    </>
  )
}