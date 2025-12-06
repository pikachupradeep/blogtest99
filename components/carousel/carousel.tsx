// File: components/InfiniteMovingPosts.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { FaEye, FaClock, FaHeart, FaBook, FaChevronDown } from 'react-icons/fa';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { getAllPublishedPostsAction, getPostLikesInfoAction } from '@/actions/postActions';
import SaveButton from '@/components/blog/SaveButton';
import { motion } from 'framer-motion';

interface Post {
  $id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  thumbnail?: string;
  category: { name: string; id: string };
  author: { name: string; image: string; id: string };
  views: number;
  $createdAt: string;
  likeCount?: number;
  isLoadingLikes?: boolean;
}

const InfiniteMovingPosts = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await getAllPublishedPostsAction();
      
      if (result.success && result.data) {
        const initialPosts = result.data.map((post: any) => ({
          $id: post.$id,
          title: post.title || 'Untitled Post',
          description: post.description || 'No description available',
          slug: post.slug || '',
          content: post.content || '',
          thumbnail: post.thumbnail,
          category: post.category || { name: 'Blog', id: '' },
          author: post.author || { name: 'Author', image: '', id: '' },
          views: post.views || 0,
          $createdAt: post.$createdAt,
          likeCount: 0,
          isLoadingLikes: true
        }));

        setPosts(initialPosts);
        setLoading(false);

        // Load likes in background
        initialPosts.forEach(async (post) => {
          try {
            const likesInfo = await getPostLikesInfoAction(post.$id);
            setPosts(prev => prev.map(p => 
              p.$id === post.$id 
                ? { ...p, likeCount: likesInfo.likeCount || 0, isLoadingLikes: false }
                : p
            ));
          } catch (error) {
            console.error('Error fetching like info:', error);
            setPosts(prev => prev.map(p => 
              p.$id === post.$id 
                ? { ...p, likeCount: 0, isLoadingLikes: false }
                : p
            ));
          }
        });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateReadingTime = (content: string) => {
    if (!content) return 0;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  // Duplicate posts for seamless infinite scroll
  const duplicatedPosts = [...posts, ...posts];

  // Don't render anything on server side to avoid hydration issues
  if (!isMounted) {
    return (
      <section className="relative py-12 bg-white dark:bg-gray-900 overflow-hidden font-mono">
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-800 rounded-xl mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <FaBook className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              LATEST <span className="text-blue-600 dark:text-blue-400">BLOG POSTS</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover stories, tutorials, and insights from our blog
            </p>
          </div>
          {/* Loading skeleton for posts */}
          <div className="mt-10">
            <div className="flex overflow-hidden">
              <div className="flex gap-4 py-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-shrink-0 w-[280px] mx-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse"
                  >
                    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                    <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 bg-white dark:bg-gray-900 overflow-hidden font-mono">
      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-800 rounded-xl mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <FaBook className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            LATEST <span className="text-blue-600 dark:text-blue-400">BLOG POSTS</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover stories, tutorials, and insights from our blog
          </p>
        </div>

        {/* Moving posts carousel */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10"></div>
          
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div 
              className="flex py-4 animate-infinite-scroll"
              style={{ 
                animation: 'infinite-scroll 35s linear infinite',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animationPlayState = 'paused';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animationPlayState = 'running';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.animationPlayState = 'paused';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.animationPlayState = 'running';
              }}
            >
              {duplicatedPosts.map((post, index) => (
                <motion.div 
                  key={`${post.$id}-${index}`}
                  initial={{ y: 20, opacity: 0, scale: 0.98 }}
                  whileInView={{ y: 0, opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  className="flex-shrink-0 w-[280px] mx-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col"
                >
                  {/* Save Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <SaveButton postId={post.$id} size="sm" />
                  </div>

                  {/* Image Section - Smaller */}
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden rounded-lg mb-3 relative">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FaBook className="text-3xl text-gray-400 dark:text-gray-500" />
                    )}
                    {/* Category Badge - Smaller */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="bg-blue-100 dark:bg-blue-900/90 text-blue-800 dark:text-blue-300 text-[10px] font-medium px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {post.category?.name?.toUpperCase() || 'BLOG'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Post Content - Compact */}
                  <div className="flex-grow">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 font-mono leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2 font-mono leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Author and Stats - Compact */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      {/* Author Info - Compact */}
                      <div className="flex items-center gap-2">
                        {post.author?.image ? (
                          <img
                            src={post.author.image}
                            alt={post.author.name}
                            className="w-6 h-6 rounded-full object-cover border border-blue-500 dark:border-blue-400"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-400 dark:border-gray-600">
                            <FiUser className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white font-mono leading-none">
                            {post.author?.name?.split(' ')[0] || 'AUTHOR'}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-none">
                            {formatDate(post.$createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Stats - Compact */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Views">
                          <FaEye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono text-[10px]">{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Likes">
                          <FaHeart className="w-3 h-3 text-red-500 dark:text-red-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono text-[10px]">
                            {post.isLoadingLikes ? '...' : post.likeCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read More Link - Compact */}
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center justify-center gap-1.5 bg-blue-600 dark:bg-gray-800 text-white dark:text-blue-400 px-3 py-1.5 rounded-md font-bold text-xs hover:bg-blue-700 dark:hover:bg-gray-900 transition-all duration-200 group shadow-sm"
                    >
                      READ MORE
                      <FiArrowRight className="group-hover:translate-x-0.5 transition-transform w-2.5 h-2.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        

      </div>

      <style jsx global>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-infinite-scroll {
          display: flex;
          animation: infinite-scroll 35s linear infinite;
        }
        
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default InfiniteMovingPosts;