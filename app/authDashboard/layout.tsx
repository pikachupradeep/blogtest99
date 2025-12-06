// app/user/[userId]/layout.tsx
import Navbar from '@/components/authorDashboard/navbar/navbar'

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
      <Navbar userId={userId} />
      {children}
    </>
  )
}