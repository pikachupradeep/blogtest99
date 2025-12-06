import AnalyticsDashboard from "@/components/analytics/Analytics";

export default function AdminPostsPage() {
  return (
    <div className="max-w-7xl mx-auto pt-6">
      <div className="px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage and observe all your data.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}