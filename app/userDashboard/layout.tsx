import UserNavbar from "@/components/userDashboard/navbar/navbar"
import { cookies } from "next/headers"

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{}>
}) {
  // Await the params (will be empty object {})
  await params
  
  // Get userId from session instead of params
  const cookieStore = await cookies()
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  const sessionCookie = cookieStore.get(`a_session_${projectId}`)
  
  // Extract actual userId from your auth system
  // This is a placeholder - replace with your actual user ID extraction logic
  const userId = sessionCookie?.value ? "current-user-id" : "guest-user"
  
  return (
    <>
      <UserNavbar userId={userId} />
      {children}
    </>
  )
}