import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ModeToggle } from '../theme/ToggleTheme'
import { logout } from '@/actions/logout-actions'
import { getProfile } from '@/actions/profile-actions'
import { getCategoriesAction } from '@/actions/category-actions'
import { ImProfile } from "react-icons/im";
import { SheetDemo } from './Mobilenav'

// Helper function to check admin collection directly
async function checkAdminCollection(userId: string) {
  try {
    const { Client, Databases, Query } = require('node-appwrite');
    
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);
    
    const databases = new Databases(client);
    
    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_ADMIN_COLLECTION!,
      [Query.equal('userId', userId)]
    );
    
    if (response.documents.length > 0) {
      const adminDoc = response.documents[0];
      return {
        isAdmin: true,
        data: {
          $id: adminDoc.$id,
          userId: adminDoc.userId,
          name: adminDoc.name,
          role: 'admin',
          createdAt: adminDoc.$createdAt,
          updatedAt: adminDoc.$updatedAt
        }
      };
    }
    
    return { isAdmin: false, data: null };
  } catch (error) {
    console.error('Error checking admin collection:', error);
    return { isAdmin: false, data: null };
  }
}

const Navbar = async () => {
  const cookieStore = await cookies()
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  
  // Look for BOTH possible session cookies
  const allCookies = cookieStore.getAll()
  const sessionCookie = allCookies.find(cookie => 
    (cookie.name === `a_session_${projectId}` || cookie.name === 'appwrite-session') && cookie.value
  )
  
  const isAuthenticated = !!sessionCookie?.value
  
  let userName: string | null = null
  let userRole: string | null = null
  let profileImage = "/user.png"
  let categories: any[] = []

  // Fetch categories for navigation
  try {
    const categoriesResult = await getCategoriesAction()
    categories = categoriesResult || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
  }

  if (isAuthenticated && sessionCookie?.value) {
    try {
      // Get user ID from cookies first
      const userIdCookie = cookieStore.get('user-id')
      const userId = userIdCookie?.value
      
      if (userId) {
        // 👇 FIRST: Check if user is an ADMIN
        const adminCheck = await checkAdminCollection(userId)
        
        if (adminCheck.isAdmin && adminCheck.data) {
          // User is an ADMIN
          userName = adminCheck.data.name
          userRole = 'admin'
          // Admins don't have profile images in their table
          profileImage = "/user.png"
        } else {
          // 👇 SECOND: Check user profile collection (writer/reader)
          const profileResult = await getProfile()
          
          if (profileResult.success && profileResult.data) {
            const profile = profileResult.data
            userName = profile.name
            userRole = profile.role || 'reader' // 'writer' or 'reader'
            
            // Handle profile image for writers/readers
            if (profile.image && 
                profile.image.trim() !== '' && 
                profile.image !== 'undefined' && 
                profile.image !== 'null') {
              try {
                if (profile.image.startsWith('http') || profile.image.startsWith('/')) {
                  profileImage = profile.image
                } else {
                  profileImage = "/user.png"
                }
              } catch (urlError) {
                profileImage = "/user.png"
              }
            } else {
              profileImage = "/user.png"
            }
          } else {
            userName = "User"
            userRole = null
          }
        }
      } else {
        userName = "User"
        userRole = null
      }
      
    } catch (error: any) {
      console.error("Profile fetch failed:", error.message)
      userName = "User"
      userRole = null
    }
  }

  // 👇 ADDED: Dynamic profile link based on role
  const getProfileLink = () => {
    if (!userRole) return '/login'
    
    if (userRole === 'admin') {
      return '/dashboard/profile'
    } else {
      return '/profile' // For writer and reader
    }
  }
  
  const profileLink = getProfileLink()

  // Calculate how many items to show (max 5 total including static items)
  const staticItems = 5; // Fixed: Home, About, Blog, Category, Contact
  const availableCategorySlots = 5 - staticItems;
  const visibleCategories = categories.slice(0, availableCategorySlots);
  const remainingCategories = categories.slice(availableCategorySlots);

  return (
    <nav className='flex items-center dark:border-b-2 border-gray-800 z-50 fixed top-8 w-full justify-between h-[4rem] shadow-lg mt-3rem bg-gray-100 dark:bg-gray-900 px-4 transition-colors duration-300'>
      <Link href="/">
        <Image className='h-12 hidden dark:block w-auto object-cover' src="/logowhite.png" alt="logo" width={400} height={400} />
        <Image className='h-12 dark:hidden w-auto object-cover' src="/logodark.png" alt="logo" width={400} height={400} />
      </Link>

      <ul className='hidden sm:flex sm:gap-6 md:gap-10 items-center'>
        {/* Static Menu Items */}
        <Link className='text-[1rem] font-mono sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/">Home</Link>
        <Link className='text-[1rem] font-mono sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/about">About</Link>
        <Link className='text-[1rem] font-mono sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/blog">Blog</Link>
        <Link className='text-[1rem] font-mono sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/category">Category</Link>
        <Link className='text-[1rem] font-mono sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/contact">Contact</Link>
        
        {/* Visible Categories */}
        {visibleCategories.map((category) => (
          <Link 
            key={category.$id}
            className='text-[1rem] sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200'
            href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {category.name}
          </Link>
        ))}
        
        {/* More Categories Dropdown */}
        {remainingCategories.length > 0 && (
          <div className="relative group">
            <button className='text-[1rem] sm:text-[1rem] hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200 flex items-center gap-1'>
              More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
              <div className="p-2">
                {remainingCategories.map((category) => (
                  <Link 
                    key={category.$id}
                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors block"
                    href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </ul>

      <div className="z-50">
        <ModeToggle />
      </div>

      <div className="hidden sm:flex sm:items-center gap-4">
        {!isAuthenticated ? (
          <Link className='text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-800 dark:text-gray-200' href="/login">Login</Link>
        ) : (
          <div className="relative group">
            {/* 👇 UPDATED: Dynamic profile link */}
            <Link href={profileLink} className="flex items-center gap-2">
              <Image 
                className='h-[2rem] border-2 border-blue-600 dark:border-blue-400 w-[2rem] rounded-full object-cover group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors' 
                src={profileImage}  
                alt="User profile" 
                width={300} 
                height={300}  
              />
              {userName && (
                <span className="text-gray-800 dark:text-gray-200 text-lg hidden md:block">
                  <ImProfile size={25} className='text-blue-400 hidden' />
                </span>
              )}
            </Link>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
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
                  {userName && (
                    <span className="text-gray-800 dark:text-gray-200 font-sm">{userName}</span>
                  )}
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Welcome back!</span>
              </div>
              <div className="p-2">
                {/* 👇 UPDATED: Dynamic profile link in dropdown */}
                <Link 
                  href={profileLink}
                  className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2 mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <form action={logout}>
                  <button 
                    type="submit"
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sm:hidden">
        {/* 👇 UPDATED: Pass userRole and profileLink to mobile nav */}
        <SheetDemo
          isAuthenticated={isAuthenticated}
          userName={userName}
          userRole={userRole}
          profileLink={profileLink}
          profileImage={profileImage}
          categories={categories}
        />
      </div>
    </nav>
  )
}

export default Navbar