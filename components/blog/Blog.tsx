// app/blog/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { getAllPublishedPostsAction, getPostLikesInfoAction } from '@/actions/postActions'
import { FiUser, FiEye, FiClock, FiArrowRight, FiBook, FiHeart, FiFilter, FiSearch } from 'react-icons/fi'
import SaveButton from '@/components/blog/SaveButton'
import { motion } from 'framer-motion'

interface Post {
  $id: string
  title: string
  description: string
  slug: string
  content: string
  thumbnail?: string
  category: { name: string; id: string }
  author: { name: string; image: string; id: string }
  views: number
  $createdAt: string
  likeCount?: number
  isLoadingLikes?: boolean
}

const BlogPage = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Fetch all posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const result = await getAllPublishedPostsAction()
        
        if (result.success && result.data) {
          const initialPosts = result.data.map((post: any) => ({
            $id: post.$id,
            title: post.title || 'Untitled Post',
            description: post.description || 'No description available',
            slug: post.slug || '',
            content: post.content || '',
            thumbnail: post.thumbnail,
            category: post.category || { name: 'Uncategorized', id: '' },
            author: post.author || { name: 'Unknown Author', image: '', id: '' },
            views: post.views || 0,
            $createdAt: post.$createdAt,
            likeCount: 0,
            isLoadingLikes: true
          }))
          
          setAllPosts(initialPosts)
          setPosts(initialPosts)
          setLoading(false)

          // Load likes in background
          initialPosts.forEach(async (post) => {
            try {
              const likesInfo = await getPostLikesInfoAction(post.$id)
              setAllPosts(prev => prev.map(p => 
                p.$id === post.$id 
                  ? { ...p, likeCount: likesInfo.likeCount || 0, isLoadingLikes: false }
                  : p
              ))
            } catch (error) {
              console.error('Error fetching like info for post:', post.$id, error)
              setAllPosts(prev => prev.map(p => 
                p.$id === post.$id 
                  ? { ...p, likeCount: 0, isLoadingLikes: false }
                  : p
              ))
            }
          })

        } else {
          setError(result.message || 'Failed to load posts')
          setLoading(false)
        }
      } catch (err) {
        setError('An error occurred while fetching posts')
        console.error('Error fetching posts:', err)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Extract unique categories and authors
  const categories = useMemo(() => {
    const uniqueCategories = ['all', ...new Set(allPosts.map(post => post.category.name))];
    return uniqueCategories.sort();
  }, [allPosts]);

  const authors = useMemo(() => {
    const uniqueAuthors = ['all', ...new Set(allPosts.map(post => post.author.name))];
    return uniqueAuthors.sort();
  }, [allPosts]);

  // Apply filters
  const filteredPosts = useMemo(() => {
    if (!allPosts.length) return allPosts;

    let filtered = [...allPosts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query) ||
        post.category.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.category.name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Author filter
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(post => 
        post.author.name.toLowerCase() === selectedAuthor.toLowerCase()
      );
    }

    // Sort filter
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    return filtered;
  }, [allPosts, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Update displayed posts when filters change
  useEffect(() => {
    setPosts(filteredPosts);
  }, [filteredPosts]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const calculateReadingTime = (content: string) => {
    if (!content) return 0
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedAuthor('all')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-mono">BLOG_POSTS</h1>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">LOADING_CONTENT...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 animate-pulse">
                <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-3 font-mono">ERROR</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg font-mono text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              TRY_AGAIN
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-mono">BLOG_POSTS</h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mb-6">
            DISCOVER_STORIES_TUTORIALS_INSIGHTS
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="SEARCH_POSTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ALL_CATEGORIES</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Author Filter */}
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ALL_AUTHORS</option>
              {authors.filter(author => author !== 'all').map(author => (
                <option key={author} value={author}>
                  {author.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">NEWEST</option>
              <option value="oldest">OLDEST</option>
              <option value="popular">MOST_LIKED</option>
              <option value="views">MOST_VIEWED</option>
            </select>
          </div>

          {/* Filter Status and Clear */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <div>
                {posts.length} {posts.length === 1 ? 'POST' : 'POSTS'} DISPLAYED
              </div>
              {(searchQuery || selectedCategory !== 'all' || selectedAuthor !== 'all') && (
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                  <FiFilter className="w-3 h-3" />
                  <span>FILTERS ACTIVE</span>
                </div>
              )}
            </div>
            
            {(searchQuery || selectedCategory !== 'all' || selectedAuthor !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-mono px-3 py-1 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
              >
                CLEAR_FILTERS
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.$id}
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ 
                once: false,
                amount: 0.2,
                margin: "0px 0px -50px 0px"
              }}
              transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.6
              }}
              whileHover={{
                y: -4,
                transition: { 
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.2
                }
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-700/30 transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 relative"
            >
              {/* Save Button */}
              <div className="absolute top-2 right-2 z-10">
                <SaveButton postId={post.$id} size="sm" />
              </div>

              {/* Image Section */}
              <motion.div 
                className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {post.thumbnail ? (
                  <motion.img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <FiBook className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                )}
              </motion.div>

              {/* Content Section */}
              <div className="p-3 flex flex-col flex-grow">
                {/* Category */}
                <motion.div 
                  className="mb-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-mono px-1.5 py-0.5 rounded">
                    {post.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                  </span>
                </motion.div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                  <motion.h2 
                    className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-mono line-clamp-2 leading-tight"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {post.title}
                  </motion.h2>
                </Link>

                {/* Description */}
                <motion.p 
                  className="text-gray-600 sm:text-[15px] dark:text-gray-300 text-xs font-mono mb-3 line-clamp-2 flex-grow leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {post.description}
                </motion.p>

                {/* Author and Stats */}
                <motion.div 
                  className="flex items-center justify-between mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-2">
                    {post.author?.image ? (
                      <motion.img
                        src={post.author.image}
                        alt={post.author.name}
                        className="w-8 h-8 object-cover border-2 border-blue-600 dark:border-blue-500"
                        style={{borderRadius: "200px"}}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <motion.div 
                        className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <FiUser className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </motion.div>
                    )}
                    <div>
                      <p className="text-xs mb-2 font-medium text-gray-900 dark:text-white font-mono leading-none">
                        {post.author?.name?.split(' ')[0] || 'UNKNOWN'}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                        {formatDate(post.$createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-1">
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiEye className="w-3 h-3 text-green-500 dark:text-green-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{post.views}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiHeart className="w-3 h-3 text-red-500 dark:text-red-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {post.isLoadingLikes ? (
                          <motion.div 
                            className="w-4 h-2 bg-gray-200 dark:bg-gray-600 rounded"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          ></motion.div>
                        ) : (
                          post.likeCount
                        )}
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiClock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{calculateReadingTime(post.content)}m</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Read More */}
                <motion.div 
                  className="flex justify-center items-center pt-2 border-t border-gray-100 dark:border-gray-700"
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono text-xs transition-colors"
                  >
                    <motion.span
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      READ_MORE
                    </motion.span>
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiArrowRight className="w-2.5 h-2.5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiFilter className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-mono">NO_POSTS_FOUND</h3>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-mono text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              CLEAR_ALL_FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage