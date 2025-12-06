// In your page component

import UserPosts from "@/components/authorDashboard/posts/CurrentUserPosts";


export default function DashboardPage() {
  return (
    <div className="dark:bg-gray-900 px-4 pt-8">
      <UserPosts />
    </div>
  );
}