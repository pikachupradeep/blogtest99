//components/Comment/CommentCount.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { getCommentCount } from '@/actions/comment-actions';

interface CommentCountProps {
  postId: string;
}

const CommentCount: React.FC<CommentCountProps> = ({ postId }) => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const result = await getCommentCount(postId);
        if (result.success) {
          setCount(result.count);
        }
      } catch (error) {
        console.error('Error loading comment count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommentCount();
  }, [postId]);

  if (isLoading) {
    return (
      <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mr-1"></div>
        ...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-gray-600 dark:text-gray-400 text-sm">
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {count} {count === 1 ? 'comment' : 'comments'}
    </span>
  );
};

export default CommentCount;