// components/navbar/Mobilenav.tsx
import { Button } from "@/components/ui/button"
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FaHome, FaInfo, FaFolder, FaEnvelope, FaUser, FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { ImProfile } from "react-icons/im"
import Link from "next/link"
import Image from "next/image"

interface SheetDemoProps {
  isAuthenticated: boolean;
  userName: string | null;
  userRole: string | null;
  profileLink: string;
  profileImage: string;
  categories: any[];
}

export function SheetDemo({ 
  isAuthenticated, 
  userName, 
  userRole, 
  profileLink, 
  profileImage, 
  categories 
}: SheetDemoProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="sm:hidden cursor-pointer border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
          <HiOutlineMenuAlt3 className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-gray-900 dark:text-white">
            <Image className="h-[2.5rem] w-auto object-cover" src="/logo.png" alt="logo" width={400} height={400} />
          </SheetTitle>
          <SheetDescription className="text-gray-600 dark:text-gray-400">
            {isAuthenticated && userName ? (
              <div className="flex items-center gap-2">
                <span>Welcome, {userName}</span>
                {userRole && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userRole === 'admin' 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      : userRole === 'writer'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  }`}>
                    {userRole}
                  </span>
                )}
              </div>
            ) : "Browse our content"}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col items-center py-4 border-b border-gray-200 dark:border-gray-700 mb-2">
          {isAuthenticated && (
            <div className="flex flex-col items-center gap-2">
              <Image 
                className="h-[4rem] w-[4rem] rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                src={profileImage}
                alt={userName || "User profile"}
                width={80}
                height={80}
              />
              {userName && (
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{userName}</div>
                  {userRole && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid gap-0 px-2 py-2">
          {/* Main Navigation - All items together */}
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
              <FaHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/about" className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
              <FaInfo className="w-4 h-4" />
              <span>About</span>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/category" className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
              <FaFolder className="w-4 h-4" />
              <span>Categories</span>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/contact" className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
              <FaEnvelope className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </SheetClose>

          {/* Categories mixed with main navigation */}
          {categories.map((category) => (
            <SheetClose key={category.$id} asChild>
              <Link 
                href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <FaFolder className="w-4 h-4 text-blue-500" />
                <span>{category.name}</span>
              </Link>
            </SheetClose>
          ))}

          {/* User Section mixed with main navigation */}
          {isAuthenticated ? (
            <>
              <SheetClose asChild>
                <Link href={profileLink} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <ImProfile className="w-4 h-4 text-blue-500" />
                  <span>Profile</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <form action="/api/logout" method="POST" className="w-full">
                  <button 
                    type="submit"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full text-left text-red-600 dark:text-red-400"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </form>
              </SheetClose>
            </>
          ) : (
            <SheetClose asChild>
              <Link href="/login" className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                <FaSignInAlt className="w-4 h-4 text-green-500" />
                <span>Login</span>
              </Link>
            </SheetClose>
          )}
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <SheetClose asChild>
            <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
              Close Menu
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SheetDemo;