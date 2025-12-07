// app/blog/[slug]/page.tsx
import { getPostBySlugAction, incrementPostViewsAction, getPostLikesInfoAction } from '@/actions/postActions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiCalendar, FiUser, FiEye, FiArrowLeft, FiClock, FiMessageSquare } from 'react-icons/fi'
import LikeButton from '@/components/blog/LikeButton'
import CommentSection from '@/components/Comment/CommentSection'
import CommentCount from '@/components/Comment/CommentCount'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const result = await getPostBySlugAction(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const postData = result.data as any

  try {
    await incrementPostViewsAction(slug)
  } catch (viewError) {
    console.error('Error incrementing view count:', viewError)
  }

  const likesInfo = await getPostLikesInfoAction(postData.$id)

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
  
  // Get current user ID for comment section
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('user-id')?.value || null

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown Date'
    }
  }

  const getTimeSincePublished = (dateString: string) => {
    try {
      const postDate = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - postDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffMs / (1000 * 60))

      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
      } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
      } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      } else {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
      }
    } catch {
      return 'Recently'
    }
  }

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
    <div className="min-h-screen bg-linear-to-br pt-24 from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {thumbnail && (
        <div className="relative min-h-[500px] bg-gray-200 dark:bg-gray-700">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${thumbnail})` }}
          >
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
          </div>
          
          <div className="relative pt-16 z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <span className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                {categoryName}
              </span>
              
              <h1 className="text-3xl sm:text-4xl max-w-3xl font-semibold font-mono mb-4">
                {title}
              </h1>
              
              <p className="text-sm sm:text-lg text-gray-200 dark:text-gray-300 mb-6 max-w-3xl font-mono mx-auto">
                {description}
              </p>
              
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
                <div className="flex items-center">
                  <FiMessageSquare className="w-4 h-4 mr-2" />
                  <CommentCount postId={postData.$id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to All Posts
          </Link>
        </div>

        <article>
          <div className="p-0">
            {!thumbnail && (
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
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
                <span className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  {categoryName}
                </span>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {description}
                </p>
              </div>
            )}

            <div className="flex justify-end mb-6">
              <LikeButton 
                postId={postData.$id}
                initialLikeCount={likesInfo.likeCount}
                initialUserLiked={likesInfo.userLiked}
              />
            </div>

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

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            {authorImage && (
              <img
                src={authorImage}
                alt={authorName}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 dark:border-blue-400"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {authorName}
              </h3>
              {authorBio ? (
                <p className="text-gray-600 dark:text-gray-300 mb-3">{authorBio}</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Published: {getTimeSincePublished(createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Reading time: {calculateReadingTime(content)} min
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    {formatDate(createdAt)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Discussion
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Join the conversation and share your thoughts about this post.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">
                  <CommentCount postId={postData.$id} />
                </span>
                <LikeButton 
                  postId={postData.$id}
                  initialLikeCount={likesInfo.likeCount}
                  initialUserLiked={likesInfo.userLiked}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <CommentSection 
              postId={postData.$id} 
              currentUserId={currentUserId} 
            />
          </div>
          
          {/* Comment Guidelines */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Comment Guidelines
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Be respectful and constructive</li>
              <li>Stay on topic and relevant to the post</li>
              <li>No spam or self-promotion</li>
              <li>You can edit or delete your own comments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}