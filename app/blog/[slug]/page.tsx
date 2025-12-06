// app/category/[name]/[slug]/page.tsx 
import { getPostBySlugAction, incrementPostViewsAction, getPostLikesInfoAction } from '@/actions/postActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiCalendar, FiUser, FiEye, FiArrowLeft, FiClock } from 'react-icons/fi'
import LikeButton from '@/components/blog/LikeButton'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params first
  const { slug } = await params
  
  // Get the post data
  const result = await getPostBySlugAction(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  // Use type assertion to handle the actual data structure
  const postData = result.data as any

  // Increment view count when page is accessed
  try {
    await incrementPostViewsAction(slug)
  } catch (viewError) {
    console.error('Error incrementing view count:', viewError)
    // Don't throw error - view counting shouldn't break the page
  }

  // Get like information for the post
  const likesInfo = await getPostLikesInfoAction(postData.$id)

  // Extract data with safe fallbacks
  const title = postData.title || 'Untitled Post'
  const description = postData.description || 'No description available'
  const content = postData.content || '<p>No content available for this post.</p>'
  const thumbnail = postData.thumbnail || postData.bg_image?.[0]
  const views = postData.views || 0
  const categoryName = postData.category?.name || 'Uncategorized'
  const authorName = postData.author?.name || 'Unknown Author'
  const authorImage = postData.author?.image
  const authorBio = postData.author?.bio
  const createdAt = postData.$createdAt || new Date().toISOString()

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown Date'
    }
  }

  // Calculate reading time safely
  const calculateReadingTime = (content: string) => {
    if (!content || typeof content !== 'string') return 1
    try {
      const wordCount = content.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200)
      return Math.max(readingTime, 1)
    } catch {
      return 1
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-24 from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Background Image */}
      {thumbnail && (
        <div className="relative min-h-[500px] bg-gray-200 dark:bg-gray-700">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${thumbnail})` }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
          </div>
          
          {/* Content Container */}
          <div className="relative pt-16 z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              {/* Category */}
              <span className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                {categoryName}
              </span>
              
              {/* Hero Title */}
              <h1 className="text-3xl sm:text-4xl max-w-3xl font-semibold font-mono mb-4">
                {title}
              </h1>
              
              {/* Description */}
              <p className="text-sm  sm:text-lg text-gray-200 dark:text-gray-300 mb-6 max-w-3xl font-mono mx-auto">
                {description}
              </p>
              
              {/* Meta Information */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-200 dark:text-gray-300">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span>{authorName}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <FiEye className="w-4 h-4 mr-2" />
                  <span>{views} views</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span>{calculateReadingTime(content)} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to All Posts
          </Link>
        </div>

        {/* Article Content */}
        <article>
          {/* Content */}
          <div className="p-0">
            {/* Like Button - Only shown if we have thumbnail hero */}
            {thumbnail && (
              <div className="flex justify-end mb-6">
                <LikeButton 
                  postId={postData.$id}
                  initialLikeCount={likesInfo.likeCount}
                  initialUserLiked={likesInfo.userLiked}
                />
              </div>
            )}

            {/* Article Content with Tiptap Styling */}
            <div 
              className="tiptap-content prose prose-lg max-w-none 
                        prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-em:text-gray-700 dark:prose-em:text-gray-300
                        prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                        prose-code:text-gray-800 dark:prose-code:text-gray-200
                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                        prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                        prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                        prose-li:text-gray-700 dark:prose-li:text-gray-300
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                        hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>

        {/* Author Bio */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {authorImage && (
              <img
                src={authorImage}
                alt={authorName}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 dark:border-blue-400"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {authorName}
              </h3>
              {authorBio ? (
                <p className="text-gray-600 dark:text-gray-300 mt-1">{authorBio}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 mt-1 italic">No bio available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}