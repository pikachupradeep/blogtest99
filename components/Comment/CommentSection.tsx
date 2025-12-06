//components/Comment/CommentSection.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { createComment, deleteComment, updateComment, type Comment, getCommentsWithAuthors, type CommentWithAuthor } from '@/actions/comment-actions';
import { useRouter } from 'next/navigation';
import { FiUser, FiTrash2, FiX, FiEdit2, FiSave } from 'react-icons/fi';

interface CommentSectionProps {
  postId: string;
  currentUserId: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUserId }) => {
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const result = await getCommentsWithAuthors(postId);
      if (result.success) {
        setComments(result.comments);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createComment(postId, newComment);
      
      if (result.success && result.comment) {
        setNewComment('');
        await loadComments();
        router.refresh();
      } else {
        setError(result.message || 'Failed to add comment');
      }
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: CommentWithAuthor) => {
    setEditingCommentId(comment.$id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const saveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const result = await updateComment(commentId, editContent);
      if (result.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.$id === commentId
              ? { ...comment, content: editContent, $updatedAt: new Date().toISOString() }
              : comment
          )
        );
        cancelEdit();
        router.refresh();
      } else {
        setError(result.message || 'Failed to update comment');
      }
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const result = await deleteComment(commentToDelete);
      
      if (result.success) {
        setComments(prev => prev.filter(comment => comment.$id !== commentToDelete));
        router.refresh();
      } else {
        setError(result.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Failed to delete comment');
    } finally {
      closeDeleteDialog();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Comment
              </h3>
              <button
                onClick={closeDeleteDialog}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add a comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Posting...
              </span>
            ) : (
              'Post Comment'
            )}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No comments yet.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.$id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow"
                >
                  {/* Comment Content - TOP */}
                  <div className="mb-4">
                    {editingCommentId === comment.$id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(comment.$id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <FiSave className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                          >
                            <FiX className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed text-sm">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Comment Footer with Author Info and Actions - BOTTOM */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {/* Profile Image */}
                      {comment.author?.image ? (
                        <img
                          src={comment.author.image}
                          alt={comment.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {comment.author?.name || 'Anonymous'}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.$createdAt)}
                          {comment.$createdAt !== comment.$updatedAt && ' (edited)'}
                        </p>
                      </div>
                    </div>

                    {/* Edit and Delete Buttons - Only show if current user is the author of this comment */}
                    {currentUserId === comment.userId && editingCommentId !== comment.$id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800"
                          title="Edit comment"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(comment.$id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800"
                          title="Delete comment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentSection;