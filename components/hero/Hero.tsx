// components/hero/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaBookOpen, 
  FaUsers, 
  FaStar, 
  FaFeather,
  FaFilter,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import { getCategoriesAction } from '@/actions/category-actions';
import { getAllPublishedPostsAction } from '@/actions/postActions';

interface PostFilterProps {
  onFilterChange: (filters: {
    searchQuery: string;
    category: string;
    author: string;
    sortBy: string;
  }) => void;
}

interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: any;
}

interface Category {
  $id: string;
  name: string;
  image?: string;
}

export function HeroSection({ onFilterChange }: PostFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let categoriesData: Category[] = [];
        try {
          const categoriesResult = await getCategoriesAction();
          
          if (Array.isArray(categoriesResult)) {
            categoriesData = categoriesResult.map((doc: AppwriteDocument) => ({
              $id: doc.$id,
              name: doc.name || 'Unnamed Category',
              image: doc.image
            })).filter(category => category.name !== 'Unnamed Category');
          }
          
          setCategories(categoriesData);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setCategories([]);
        }

        try {
          const postsResult = await getAllPublishedPostsAction();
          
          if (postsResult && postsResult.success && Array.isArray(postsResult.data)) {
            setTotalPosts(postsResult.data.length);
            
            const uniqueAuthors = [...new Set(
              postsResult.data
                .map((post: any) => post.author?.name)
                .filter((name): name is string => typeof name === 'string' && name.length > 0)
            )];
            
            setAuthors(uniqueAuthors.sort());
          } else {
            setAuthors([]);
          }
        } catch (postError) {
          console.error('Error fetching posts:', postError);
          setAuthors([]);
        }
      } catch (error) {
        console.error('Error fetching data for hero section:', error);
        setError('Failed to load content');
        setCategories([]);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        searchQuery,
        category: selectedCategory,
        author: selectedAuthor,
        sortBy
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedAuthor, sortBy, onFilterChange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAuthor('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedAuthor !== 'all';

  // Grid background styles with opacity
  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, rgb(209 213 219 / 0.3) 2px, transparent 1px),
      linear-gradient(to bottom, rgb(209 213 219 / 0.3) 2px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  };

  const darkGridStyle = {
    backgroundImage: `
      linear-gradient(to right, rgb(55 65 81 / 0.2) 2px, transparent 1px),
      linear-gradient(to bottom, rgb(55 65 81 / 0.2) 2px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  };

  if (loading) {
    return (
      <div className="relative min-h-[70vh] bg-white dark:bg-gray-900 overflow-hidden font-mono border-b border-gray-200 dark:border-gray-800">
        {/* Grid Background for loading state */}
        <div 
          className="absolute inset-0 dark:hidden"
          style={gridStyle}
        ></div>
        <div 
          className="absolute inset-0 hidden dark:block"
          style={darkGridStyle}
        ></div>
        
        <div className="relative container mx-auto px-4 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
              <FaFeather className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-lg">Loading content...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[70vh] bg-white dark:bg-gray-900 overflow-hidden font-mono border-b border-gray-200 dark:border-gray-800">
        {/* Grid Background for error state */}
        <div 
          className="absolute inset-0 dark:hidden"
          style={gridStyle}
        ></div>
        <div 
          className="absolute inset-0 hidden dark:block"
          style={darkGridStyle}
        ></div>
        
        <div className="relative container mx-auto px-4 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
              <FaFeather className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70vh] py-6 pt-26  bg-gray-100 dark:bg-gray-900 overflow-hidden font-mono border-b border-gray-200 dark:border-gray-800">
      {/* Grid Background for main content - Light theme (gray-300 with 60% opacity) */}
      <div 
        className="absolute inset-0 dark:hidden"
        style={gridStyle}
      ></div>
      
      {/* Grid Background for main content - Dark theme (gray-700 with 60% opacity) */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={darkGridStyle}
      ></div>
      
      {/* Minimal overlay to keep content readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 dark:from-gray-900/10 dark:to-gray-900/5"></div>

      <div className="relative container mx-auto px-4 min-h-[70vh] flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <FaFeather className="w-10 h-10 text-gray-700 dark:text-gray-300" />
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              EXPLORE STORIES
              <span className="block text-blue-600 dark:text-blue-400 font-mono mt-4 text-4xl md:text-5xl font-bold">
                DISCOVER IDEAS
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Dive into curated content. Explore articles that inspire and transform your perspective.
            </p>
          </div>

          {/* Main Search */}
          <div className="">
            <div className="flex flex-col sm::flex-row sm:justify-center gap-6 mb-6">
              {/* Search Input */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl">
              <div className="flex items-center">
                <FaSearch className="ml-3 translate-x-8 z-50 text-gray-400 dark:text-gray-500" />
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH POSTS BY TITLE, CONTENT, OR AUTHOR..."
                className="w-full rounded-full py-4 px-10 focus:ring-4 border-2 border-blue-100 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500/70
               dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 
                transition-all duration-200 font-mono shadow-lg"
                />

                
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex -translate-x-10 items-center gap-3 w-fit mx-auto cursor-pointer dark:bg-transparent text-white hover:scale-150 dark:hover:transform-150 font-bold text-base transition-all duration-200 shadow-sm"
              >
                <FaFilter className="w-5 h-5 text-blue-600 dark:text-white" />
              
                {hasActiveFilters && (
                  <span className="">
                    <FaFilter className="w-3 h-3 text-red-800 dark:text-white" />
                  </span>
                )}
              </button>
              </div>
  </div>
</div>

            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="max-w-2xl mx-auto rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Category Filter */}
                  <div className='flex flex-col items-center'>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 font-mono">
                      CATEGORY
                    </label>
                    <div className="relative min-w-[11rem]">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 shadow dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 font-mono appearance-none"
                      >
                        <option className='text-sm' value="all">ALL CATEGORIES</option>
                        {categories.map(category => (
                          <option key={category.$id} value={category.name}>
                            {category.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Author Filter */}
                  <div className='flex flex-col items-center'>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 font-mono">
                      AUTHOR
                    </label>
                    <div className="relative min-w-[11rem]">
                      <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="w-full cursor-pointer shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 font-mono appearance-none"
                      >
                        <option value="all">ALL AUTHORS</option>
                        {authors.map(author => (
                          <option key={author} value={author}>
                            {author.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div className='flex flex-col items-center'>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 font-mono">
                      SORT BY
                    </label>
                    <div className="relative min-w-[11rem]">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full shadow bg-white cursor-pointer dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 font-mono appearance-none"
                      >
                        <option value="newest">NEWEST FIRST</option>
                        <option value="oldest">OLDEST FIRST</option>
                        <option value="popular">MOST POPULAR</option>
                        <option value="views">MOST VIEWED</option>
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 border border-red-500/20 dark:border-red-500/30"
                    >
                      <FaTimes className="w-3 h-3" />
                      <span>CLEAR FILTERS</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-8">
            <div className="flex items-center w-fit gap-3 text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <FaBookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{totalPosts} POSTS</span>
            </div>
            <div className="flex items-center w-fit gap-3 text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <FaUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{authors.length} AUTHORS</span>
            </div>
            <div className="flex items-center w-fit gap-3 text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <FaStar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{categories.length} CATEGORIES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}