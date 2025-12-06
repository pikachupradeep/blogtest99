// components/blog/LikeButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { toggleLikeAction, getPostLikesInfoAction } from '@/actions/postActions'
import { FiHeart, FiLogIn } from 'react-icons/fi'
import Link from 'next/link'

interface LikeButtonProps {
  postId: string
  initialLikeCount?: number
  initialUserLiked?: boolean
  compact?: boolean  // Add this line
}

const LikeButton = ({ postId, initialLikeCount = 0, initialUserLiked = false, compact = false }: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [userLiked, setUserLiked] = useState(initialUserLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchLikeInfo = async () => {
      try {
        const result = await getPostLikesInfoAction(postId)
        if (result.success) {
          setLikeCount(result.likeCount || 0)
          setUserLiked(result.userLiked || false)
          setIsAuthenticated(true)
        } else if (result.error?.includes('not configured')) {
          setIsConfigured(false)
        } else if (result.error?.includes('logged in')) {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error fetching like info:', error)
        setIsConfigured(false)
      }
    }

    fetchLikeInfo()
  }, [postId])

  const handleLikeToggle = async () => {
    if (isLoading || !isClient || !isConfigured || !isAuthenticated) return

    setIsLoading(true)
    
    const previousLikeCount = likeCount
    const previousUserLiked = userLiked
    
    setUserLiked(!userLiked)
    setLikeCount(prev => userLiked ? prev - 1 : prev + 1)

    try {
      const result = await toggleLikeAction(postId)
      
      if (!result.success) {
        setUserLiked(previousUserLiked)
        setLikeCount(previousLikeCount)
        if (result.error?.includes('not configured')) {
          setIsConfigured(false)
        } else if (result.error?.includes('logged in')) {
          setIsAuthenticated(false)
        }
        console.error('Error toggling like:', result.error)
      }
    } catch (error) {
      setUserLiked(previousUserLiked)
      setLikeCount(previousLikeCount)
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <button
        disabled
        className={`flex items-center space-x-2 text-gray-500 rounded-lg border border-gray-300 bg-gray-100 ${
          compact ? 'px-3 py-1' : 'px-4 py-2'
        }`}
      >
        <FiHeart className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        <span className={compact ? 'text-xs font-medium' : 'text-sm font-medium'}>...</span>
      </button>
    )
  }

  if (!isConfigured) {
    return null
  }

  // For unauthenticated users - show like count but make it a login prompt
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className={`flex items-center space-x-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group ${
          compact ? 'px-3 py-1' : 'px-4 py-2'
        }`}
        title="Login to like posts"
      >
        <FiHeart className={`group-hover:text-red-500 transition-colors ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
          {likeCount}
        </span>
        {!compact && <FiLogIn className="w-4 h-4 text-gray-400 ml-1" />}
      </Link>
    )
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center space-x-2 rounded-lg border transition-all duration-200 ${
        userLiked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
        compact ? 'px-3 py-1' : 'px-4 py-2'
      }`}
      title={userLiked ? 'Unlike this post' : 'Like this post'}
    >
      <FiHeart 
        className={`transition-all duration-200 ${
          userLiked ? 'fill-red-600' : ''
        } ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} 
      />
      <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        {likeCount}
      </span>
    </button>
  )
}

export default LikeButton