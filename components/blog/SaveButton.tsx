// components/blog/SaveButton.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { savePost, unsavePost, isPostSaved } from '@/actions/saved-posts-actions';
import { BsFillBookmarkHeartFill } from "react-icons/bs";
import { FiBookmark } from "react-icons/fi";

interface SaveButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
}

const SaveButton: React.FC<SaveButtonProps> = ({ postId, size = 'md' }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [postId]);

  const checkIfSaved = async () => {
    try {
      const result = await isPostSaved(postId);
      if (result.success) {
        setIsSaved(result.isSaved);
      }
    } catch (error) {
      console.error('Error checking if post is saved:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isActionLoading) return;
    
    setIsActionLoading(true);
    try {
      if (isSaved) {
        const result = await unsavePost(postId);
        if (result.success) {
          setIsSaved(false);
        }
      } else {
        const result = await savePost(postId);
        if (result.success) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors`}
      >
        <div className={`${iconSizes[size]} border-2 border-gray-400 border-t-transparent rounded-full animate-spin`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={isActionLoading}
      className={`
        ${sizeClasses[size]} 
        rounded-full flex items-center justify-center transition-all duration-200
        ${isSaved 
          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
        ${isActionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
      `}
      title={isSaved ? 'Remove from saved' : 'Save post'}
    >
      {isActionLoading ? (
        <div className={`${iconSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      ) : isSaved ? (
        <BsFillBookmarkHeartFill className={iconSizes[size]} />
      ) : (
        <FiBookmark className={iconSizes[size]} />
      )}
    </button>
  );
};

export default SaveButton;