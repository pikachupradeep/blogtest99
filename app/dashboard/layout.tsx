import Navbar from "@/components/adminDashboard/navbar/navbar";


// app/dashboard/layout.tsx  (example)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen pt-24 bg-white dark:bg-gray-900">

        <Navbar />
      {children}
    </section>
  );
}
