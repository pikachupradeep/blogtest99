import { notFound } from 'next/navigation';
import { getPostsByCategoryAction, getPostLikesInfoAction } from '@/actions/postActions';
import { getCategoriesAction } from '@/actions/category-actions';
import Link from 'next/link';
import { 
  FiHome, 
  FiBook, 
  FiFolder, 
  FiUser, 
  FiEye, 
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiSearch,
  FiTrendingUp
} from 'react-icons/fi';
import LikeButton from '@/components/blog/LikeButton';
import Image from 'next/image';

interface Author {
  name: string;
  image: string;
  id: string;
}

interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  views: number;
  status: string;
  category_name: string;
  author: Author;
}

interface Category {
  $id: string;
  name: string;
  image?: string;
}

interface PostsResponse {
  success: boolean;
  data?: Post[];
  message?: string;
}

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { name: categoryName } = await params;

  try {
    const categoriesData = await getCategoriesAction() as any[];
    const currentCategory = categoriesData.find(
      (category: any) => category.name?.toLowerCase() === categoryName.toLowerCase()
    );

    const postsResult = await getPostsByCategoryAction(categoryName) as PostsResponse;
    
    if (!postsResult.success || !postsResult.data) {
      console.log('Category not found or no posts:', categoryName);
      notFound();
    }

    const posts = postsResult.data.filter((post: Post) => post.status === 'published');
    const displayCategoryName = categoryName.replace(/-/g, ' ');

    // ✅ FIX: Fetch all likes data BEFORE rendering (not in map)
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await getPostLikesInfoAction(post.$id);
        const readingTime = Math.ceil((post.description?.split(/\s+/).length || 0) / 200);
        
        return {
          ...post,
          likesInfo,
          readingTime
        };
      })
    );

    return (
      <div className="min-h-screen pt-16 bg-linear-to-br from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 font-mono">
        {/* Dynamic Hero Section with Category Image */}
        <div className="relative text-white overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {currentCategory?.image ? (
              <>
                {/* Category Image Background */}
                <img
                  src={currentCategory.image}
                  alt={displayCategoryName}
                  className="w-full h-full object-cover"
                  style={{margin:'0'}}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/50 to-gray-600/30 backdrop-blur-[1px]"></div>
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10  dark:bg-black/60"></div>
              </>
            ) : (
              /* Fallback Gradient Background */
              <div className="w-full h-full bg-linear-to-r from-blue-500 to-purple-600"></div>
            )}
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-white/80 mb-8">
              <Link href="/" className="flex items-center hover:text-white transition-colors">
                <FiHome className="w-4 h-4 mr-2" />
                Home
              </Link>
              <FiArrowRight className="w-3 h-3" />
              <Link href="/category" className="flex items-center hover:text-white transition-colors">
                <FiBook className="w-4 h-4 mr-2" />
                Category
              </Link>
              <FiArrowRight className="w-3 h-3" />
              <span className="flex items-center text-white font-medium">
                <FiFolder className="w-4 h-4 mr-2" />
                <h1 className='capitalize'>{displayCategoryName}</h1>
              </span>
            </nav>

            {/* Hero Content */}
            <div className="text-center max-w-4xl mx-auto">
              {/* Main Title */}
              <h1 className="text-4xl capitalize md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
                {displayCategoryName}
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/90 mb-6 font-light drop-shadow">
                Explore {postsWithLikes.length} Articles
              </p>

              {/* Description */}
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Discover the latest stories, insights, and tutorials about {displayCategoryName}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 drop-shadow">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <FiBook className="w-5 h-5" />
                  <span className="font-medium">{postsWithLikes.length} Articles</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">
                    {new Set(postsWithLikes.map((post) => post.author.id)).size} Authors
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <FiTrendingUp className="w-5 h-5" />
                  <span className="font-medium">
                    {postsWithLikes.reduce((total, post) => total + (post.views || 0), 0).toLocaleString()} Views
                  </span>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="mt-12 animate-bounce">
                <FiArrowRight className="w-6 h-6 mx-auto transform rotate-90 text-white/60 drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              LATEST_ARTICLES
            </h2>
            <p className="text-gray-600 dark:text-gray-300 font-mono max-w-2xl mx-auto">
              Discover the most recent publications in {displayCategoryName}
            </p>
          </div>

          {/* Posts Grid */}
          {postsWithLikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {postsWithLikes.map((post) => (
                <article 
                  key={post.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-400 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  {post.thumbnail && (
                    <div className="w-full h-40">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        style={{margin: '0'}}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title and Description */}
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-mono leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed font-mono flex-1">
                      {post.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2 items-center space-x-2">
                        {/* Author Avatar */}
                        {post.author.image ? (
                          <img
                            src={post.author.image}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-600 dark:border-blue-400 shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 font-mono">
                          {post.author.name}
                        </span>
                      </div>

                      {/* Like Button - Using pre-fetched data */}
                      <LikeButton 
                        postId={post.$id}
                        initialLikeCount={post.likesInfo.likeCount}
                        initialUserLiked={post.likesInfo.userLiked}
                        compact={true}
                      />
                    </div>

                    {/* Stats and Date */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <div className="flex items-center">
                          <FiEye className="w-3 h-3 mr-1" />
                          <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="w-3 h-3 mr-1" />
                          <span>{post.readingTime}m</span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          <span>{new Date(post.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/category/${categoryName.toLowerCase()}/${post.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium group/link font-mono"
                      >
                        Read
                        <FiArrowRight className="w-3 h-3 ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-mono">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 font-mono text-sm">
                No published articles in {displayCategoryName} yet.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium font-mono text-sm"
              >
                <FiBook className="w-3 h-3 mr-1" />
                Browse Posts
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { name: categoryName } = await params;
  const displayCategoryName = categoryName.replace(/-/g, ' ');

  return {
    title: `${displayCategoryName} - Blog Category`,
    description: `Explore our collection of ${displayCategoryName} articles, tutorials, and insights.`,
  };
}