// components/authorDashboard/navbar/navbar.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { FaUserCircle, FaBookmark, FaFileAlt, FaCog, FaPlus } from "react-icons/fa";
import Image from "next/image";

interface NavbarProps {
  userId: string;
}

const Navbar = async ({ userId }: NavbarProps) => {
  const cookieStore = await cookies();
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const sessionCookie = cookieStore.get(`a_session_${projectId}`);
  const hasSession = !!sessionCookie?.value;

  return (
    <div className="flex flex-col pt-26 items-center bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Top Bar */}
      <div className="min-h-[70px] w-full flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image className='h-12 hidden dark:block w-auto object-cover' src="/logowhite.png" alt="logo" width={400} height={400} />
            <Image className='h-12 dark:hidden w-auto object-cover' src="/logodark.png" alt="logo" width={400} height={400} />
          </div>
          <h1 className="text-xl font-bold bg-linear-to-r from-gray-800 dark:from-gray-100 to-gray-600 dark:to-gray-300 bg-clip-text text-transparent">
            Fount Study
          </h1>
        </div>

      
      </div>

      {/* Navigation Bar */}
      <div className="min-h-[60px] w-full flex items-center gap-1 px-6 bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:to-gray-800/80 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/authDashboard/posts"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm"
        >
          <FaFileAlt className="w-4 h-4" />
          <span className="text-sm font-medium">My Posts</span>
        </Link>

        <Link
          href="/authDashboard/posts/create"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800 hover:shadow-sm"
        >
          <FaPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Create Post</span>
        </Link>

        <Link
          href="/authDashboard/save"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm"
        >
          <FaBookmark className="w-4 h-4" />
          <span className="text-sm font-medium">Saved</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800 hover:shadow-sm"
        >
          <FaUserCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;