import AdminPostsTable from "@/components/adminDashboard/postTable/AdminPostsTable";


export default function AdminPostsPage() {
  return (
    <div className="space-y-6 pt-6">
      <div className="px-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and approve all posts from authors.
        </p>
      </div>

      <AdminPostsTable />
    </div>
  );
}