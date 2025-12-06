import Link from "next/link";
import { cookies, headers } from 'next/headers';
import CreateButton from "@/components/button/CreateButton";
import { 
  FaUserCircle, 
  FaBookmark, 
  FaFileAlt,
  FaCog
} from 'react-icons/fa';

interface NavbarProps {
  userId: string;
}

const Navbar = async ({ userId }: NavbarProps) => {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Get current path to check if we're on create post page
  const pathname = headersList.get('x-invoke-path') || '';
  const isCreatePage = pathname === '/authDashboard/posts/create';
  
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const sessionCookie = cookieStore.get(`a_session_${projectId}`);
  const hasSession = !!sessionCookie?.value;

  return (
    <div className="flex flex-col pt-26 items-center bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Top Bar */}
      <div className="min-h-[70px] w-full flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            BlogStudio
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <FaUserCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {hasSession ? 'Welcome back!' : 'Hello, Guest'}
            </span>
          </div>
          
          <Link 
            href="/authDashboard/profile" 
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <FaCog className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="min-h-[60px] w-full flex justify-between items-center px-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:to-gray-800/80 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Link 
            href={`/authDashboard/posts`}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm"
          >
            <FaFileAlt className="w-4 h-4" />
            <span className="text-sm font-medium">My Posts</span>
          </Link>
          
          <Link 
            href={`/authDashboard/save`}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm"
          >
            <FaBookmark className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </Link>
          
          <Link 
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800 hover:shadow-sm"
          >
            <FaUserCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </div>
        
        {/* Hide CreateButton when on create post page */}
        {!isCreatePage && (
          <CreateButton href="/authDashboard/posts/create">
            Create Post
          </CreateButton>
        )}
      </div>
    </div>
  );
}

export default Navbar;