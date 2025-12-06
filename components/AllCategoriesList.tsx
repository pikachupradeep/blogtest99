// components/categories-display-server.tsx
import { getCategoriesAction } from '@/actions/category-actions';
import { getAllPublishedPostsAction } from '@/actions/postActions';
import Link from 'next/link';
import { FiFolder, FiFileText, FiArrowRight, FiBarChart2, FiGrid, FiBook, FiTrendingUp, FiStar, FiAward, FiZap } from 'react-icons/fi';

interface CategoryWithCount {
  $id: string;
  name: string;
  image?: string;
  postCount: number;
}

export default async function CategoriesDisplayServer() {
  try {
    // Fetch categories and posts in parallel
    const [categoriesData, postsResult] = await Promise.all([
      getCategoriesAction(),
      getAllPublishedPostsAction()
    ]);

    if (!postsResult.success || !postsResult.data) {
      throw new Error('Failed to fetch posts');
    }

    const publishedPosts = postsResult.data;

    // Count posts per category - using case-insensitive matching
    const categoryCounts: { [key: string]: number } = {};
    
    publishedPosts.forEach((post: any) => {
      const postCategoryName = post.category_name?.toLowerCase().trim();
      
      if (!postCategoryName) return;

      // Find matching category (case-insensitive)
      const matchingCategory = categoriesData.find(
        (category: any) => category.name.toLowerCase().trim() === postCategoryName
      );

      if (matchingCategory) {
        const categoryName = matchingCategory.name;
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    // Combine categories with their post counts
    const categoriesWithCounts: CategoryWithCount[] = categoriesData.map((category: any) => ({
      $id: category.$id,
      name: category.name,
      image: category.image,
      postCount: categoryCounts[category.name] || 0,
    }));

    // Sort by post count (highest first)
    const sortedCategories = categoriesWithCounts.sort((a, b) => b.postCount - a.postCount);
    const totalPosts = sortedCategories.reduce((sum, cat) => sum + cat.postCount, 0);
    const categoriesWithPosts = sortedCategories.filter(cat => cat.postCount > 0);

    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/20">
        {/* Enhanced Hero Section */}
        <div className="bg-gray-100 dark:bg-gray-800 min-h-[60vh] flex items-center justify-center relative overflow-hidden">
          {/* Animated Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <div className="absolute inset-0 animate-float-slow" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #000 1px, transparent 1px), radial-gradient(circle at 75% 75%, #000 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200/20 via-gray-300/30 to-gray-500/10 dark:from-gray-700/30 dark:via-gray-600/20 dark:to-gray-800/10"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-20 animate-float-medium"></div>
          <div className="absolute top-1/2 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-25 animate-float-slow"></div>
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-indigo-400 rounded-full opacity-20 animate-float-medium"></div>
          
          {/* Gradient Orbs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="relative max-w-5xl mx-auto px-4 text-center mt-8">
            {/* Enhanced Hero Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/30 dark:bg-gray-800/30 rounded-3xl mb-8 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl group hover:scale-105 transition-transform duration-300">
              <FiGrid className="w-12 h-12 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            {/* Enhanced Hero Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 font-mono leading-tight drop-shadow-sm">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                EXPLORE
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                CATEGORIES
              </span>
            </h1>
            
            {/* Enhanced Hero Subtitle */}
            <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-300 mb-10 font-mono max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
              Discover {totalPosts} articles across {categoriesWithPosts.length} active categories
            </p>
            
            {/* Enhanced Hero Stats */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-800 dark:text-gray-300">
              {[
                { icon: FiFolder, label: `${sortedCategories.length} Categories`, color: 'from-blue-500 to-cyan-500' },
                { icon: FiBook, label: `${totalPosts} Articles`, color: 'from-green-500 to-emerald-500' },
                { icon: FiTrendingUp, label: `${categoriesWithPosts.length} Active`, color: 'from-purple-500 to-pink-500' }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-mono font-semibold text-sm">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Scroll Indicator */}
            <div className="mt-16">
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-12 border-2 border-gray-700 dark:border-gray-400 rounded-full flex justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-1 h-3 bg-gray-700 dark:bg-gray-400 rounded-full mt-2 animate-bounce"></div>
                  </div>
                  <div className="absolute inset-0 w-8 h-12 border-2 border-gray-700/30 dark:border-gray-400/30 rounded-full animate-ping"></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-widest group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-300 font-mono">
                  EXPLORE BELOW
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 -mt-8 relative z-10">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { 
                count: sortedCategories.length, 
                label: 'Total Categories', 
                icon: FiFolder, 
                color: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-100 dark:bg-blue-900/20'
              },
              { 
                count: totalPosts, 
                label: 'Published Articles', 
                icon: FiBook, 
                color: 'from-green-500 to-emerald-500',
                bg: 'bg-green-100 dark:bg-green-900/20'
              },
              { 
                count: categoriesWithPosts.length, 
                label: 'Active Categories', 
                icon: FiBarChart2, 
                color: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-100 dark:bg-purple-900/20'
              }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="group relative"
              >
                {/* Card Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-3xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                
                {/* Main Card */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100/60 dark:border-gray-700/30 overflow-hidden">
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-black text-gray-900 dark:text-white font-mono mb-2 group-hover:scale-105 transition-transform duration-300">
                        {stat.count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{stat.label}</p>
                    </div>
                    <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon className={`w-7 h-7 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {sortedCategories.map((category) => (
              <Link 
                key={category.$id} 
                href={`/category/${category.name.toLowerCase()}`}
                className="block group hover:no-underline"
              >
                <div className="relative">
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/60 dark:border-gray-700/30 cursor-pointer h-full overflow-hidden group-hover:scale-105 group-hover:-translate-y-2">
                    {/* Image Section */}
                    <div className="relative h-36 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiFolder className="w-10 h-10 text-blue-400 dark:text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      
                      {/* Post Count Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`rounded-2xl px-3 py-2 flex items-center space-x-2 shadow-lg backdrop-blur-sm border ${
                          category.postCount > 0 
                            ? 'bg-green-100/90 dark:bg-green-900/80 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' 
                            : 'bg-gray-100/90 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                        }`}>
                          <FiFileText className="w-4 h-4" />
                          <span className="text-sm font-bold font-mono">
                            {category.postCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <h3 className="text-sm sm:texy-lg md:text-xl text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-mono line-clamp-2">
                        {category.name}
                      </h3>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <FiFileText className={`w-5 h-5 flex-shrink-0 ${
                            category.postCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                          <span className={`font-mono font-semibold text-sm ${
                            category.postCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className={`font-medium text-sm font-mono transition-colors ${
                          category.postCount > 0 
                            ? 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {category.postCount > 0 ? 'Browse Posts' : 'No Posts Yet'}
                        </span>
                        {category.postCount > 0 && (
                          <FiArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform duration-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Enhanced Most Popular Categories */}
          {categoriesWithPosts.length > 0 && (
            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-10 border border-blue-100 dark:border-blue-800/30 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                <div className="w-full h-full" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-white/60 dark:border-gray-700/60">
                    <FiAward className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                      Most Popular Categories
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Discover the most active and engaging topics in our community
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {categoriesWithPosts.slice(0, 3).map((category, index) => (
                    <div key={category.$id} className="group relative">
                      {/* Card Glow */}
                      <div className={`absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-blue-400' : 
                        'bg-gradient-to-r from-orange-400 to-red-400'
                      }`}></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border border-gray-100/60 dark:border-gray-700/30">
                        <div className="flex items-center space-x-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-blue-400' : 
                            'bg-gradient-to-br from-orange-400 to-red-400'
                          }`}>
                            <span className="font-bold text-lg font-mono text-white">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white font-mono truncate text-lg mb-2">
                              {category.name}
                            </h3>
                            <p className="text-green-600 dark:text-green-400 font-mono font-semibold text-sm">
                              {category.postCount} posts
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {sortedCategories.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FiFolder className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 font-mono">
                  No categories found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-mono text-lg">
                  Create your first category to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FiFolder className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 font-mono">
            Unable to load categories
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-lg mb-6">
            There was an error fetching the categories. Please try again later.
          </p>
          <button className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-2xl font-mono text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }
}