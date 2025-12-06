// components/saved/SavedPostsClient.tsx

'use client';

import { useState } from 'react';
import { unsavePost, type SavedPostWithDetails } from '@/actions/saved-posts-actions';
import { FiBookmark, FiUser, FiArrowLeft, FiEye, FiHeart, FiClock, FiTrash2, FiArrowRight, FiFolder } from 'react-icons/fi';
import Link from 'next/link';
import SaveButton from '@/components/blog/SaveButton';

interface SavedPostsClientProps {
  initialSavedPosts: SavedPostWithDetails[];
}

export default function SavedPostsClient({ initialSavedPosts }: SavedPostsClientProps) {
  const [savedPosts, setSavedPosts] = useState<SavedPostWithDetails[]>(initialSavedPosts);
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);

  const handleRemovePost = async (savedPostId: string, postId: string) => {
    setRemovingPostId(savedPostId);
    try {
      const result = await unsavePost(postId);
      if (result.success) {
        setSavedPosts(prev => prev.filter(post => post.$id !== savedPostId));
      }
    } catch (error) {
      console.error('Error removing saved post:', error);
    } finally {
      setRemovingPostId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    if (!content) return 0;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-mono">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-mono">SAVED_POSTS</h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mb-3">
            YOUR_COLLECTION_OF_SAVED_ARTICLES
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {savedPosts.length} {savedPosts.length === 1 ? 'POST' : 'POSTS'} SAVED
          </div>
        </div>

        {/* Saved Posts Grid - COMPACT 4-COLUMN LAYOUT */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiBookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono">NO_SAVED_POSTS</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 font-mono text-sm">NO_POSTS_SAVED_YET</p>
            <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono text-sm transition-colors">
              BROWSE_POSTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedPosts.map((savedPost) => (
              savedPost.post ? (
                <div
                  key={savedPost.$id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-700/30 transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 relative"
                >
                  {/* Remove Button - Top Right Corner */}
                  <button
                    onClick={() => handleRemovePost(savedPost.$id, savedPost.postId)}
                    disabled={removingPostId === savedPost.$id}
                    className="absolute top-2 right-2 z-10 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove from saved"
                  >
                    {removingPostId === savedPost.$id ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-3 h-3" />
                    )}
                  </button>

                  {/* Save Button - Top Left Corner */}
                  <div className="absolute top-2 left-2 z-10">
                    <SaveButton postId={savedPost.postId} size="sm" />
                  </div>

                  {/* Image Section - COMPACT */}
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {savedPost.post.thumbnail ? (
                      <img
                        src={savedPost.post.thumbnail}
                        alt={savedPost.post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <FiBookmark className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  {/* Content Section - COMPACT */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Category - NOW WITH CATEGORY DATA */}
                    <div className="mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-mono px-1.5 py-0.5 rounded">
                        {savedPost.post.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${savedPost.post.slug}`}>
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-mono line-clamp-2 leading-tight">
                        {savedPost.post.title}
                      </h2>
                    </Link>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-xs font-mono mb-3 line-clamp-2 flex-grow leading-relaxed">
                      {savedPost.post.description}
                    </p>

                    {/* Author and Stats - COMPACT LAYOUT */}
                    <div className="flex items-center justify-between mb-3">
                      {/* Author Info - WITH PROFILE PICTURE AND NAME */}
                      <div className="flex items-center gap-2">
                        {savedPost.post.author?.image ? (
                          <img
                            src={savedPost.post.author.image}
                            alt={savedPost.post.author.name}
                            className="w-8 h-8 object-cover border-2 border-blue-600 dark:border-blue-500"
                            style={{borderRadius: "200px"}}
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <FiUser className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs mb-2 font-medium text-gray-900 dark:text-white font-mono leading-none">
                            {savedPost.post.author?.name?.split(' ')[0] || 'UNKNOWN'}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                            {formatDate(savedPost.post.$createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Stats - VERTICAL COMPACT */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <FiEye className="w-3 h-3 text-green-500 dark:text-green-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{savedPost.post.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiHeart className="w-3 h-3 text-red-500 dark:text-red-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {savedPost.post.likeCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{calculateReadingTime(savedPost.post.content)}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Category and Read More - COMPACT */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <FiFolder className="w-2.5 h-2.5" />
                        <span>{savedPost.post.category?.name || 'Uncategorized'}</span>
                      </div>
                      <Link
                        href={`/blog/${savedPost.post.slug}`}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono text-xs transition-colors"
                      >
                        READ
                        <FiArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>

                    {/* Saved Date */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono text-center">
                        Saved {formatDate(savedPost.$createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={savedPost.$id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center relative border border-gray-100 dark:border-gray-700">
                  {/* Remove Button for unavailable posts */}
                  <button
                    onClick={() => handleRemovePost(savedPost.$id, savedPost.postId)}
                    disabled={removingPostId === savedPost.$id}
                    className="absolute top-2 right-2 z-10 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove from saved"
                  >
                    {removingPostId === savedPost.$id ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-3 h-3" />
                    )}
                  </button>

                  <FiBookmark className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-mono text-center mb-2">
                    POST_NO_LONGER_AVAILABLE
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                    Saved {formatDate(savedPost.$createdAt)}
                  </p>
                </div>
              )
            ))}
          </div>
        )}

        {/* Back to Blog */}
        {savedPosts.length > 0 && (
          <div className="text-center mt-6">
            <Link 
              href="/blog"
              className="inline-flex items-center bg-blue-600 dark:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-mono text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <FiArrowLeft className="w-3 h-3 mr-2" />
              BACK_TO_BLOG
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}