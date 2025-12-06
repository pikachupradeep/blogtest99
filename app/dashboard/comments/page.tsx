// app/admin/comments/page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import {
  getAllCommentsWithUsers,
  updateComment,
  adminDeleteComment,
  type AdminComment
} from '@/actions/comment-actions';
import { FiEdit2, FiTrash2, FiMessageSquare, FiSearch, FiX, FiSave, FiClock, FiFileText, FiUser } from 'react-icons/fi';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await getAllCommentsWithUsers();
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

  const handleEditComment = (comment: AdminComment) => {
    setEditingCommentId(comment.$id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const saveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      setError('Comment content cannot be empty');
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
      const result = await adminDeleteComment(commentToDelete);
      if (result.success) {
        setComments(prev => prev.filter(comment => comment.$id !== commentToDelete));
        closeDeleteDialog();
      } else {
        setError(result.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Failed to delete comment');
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

  // Filter comments based on search term
  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.post?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Comment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all comments across your blog - {comments.length} total comments
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search comments, authors, or posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 font-mono">
            {error}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-mono">
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

        {/* Comments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-mono">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-mono">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-mono">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-mono">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-mono">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComments.map((comment) => (
                  <tr key={comment.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-pre-wrap">
                      {editingCommentId === comment.$id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveEdit(comment.$id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-mono"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors font-mono"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white max-w-md font-mono">
                          {comment.content}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {comment.author?.image ? (
                          <img
                            src={comment.author.image}
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium font-mono">
                            {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {comment.author?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {comment.author?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FiFileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white max-w-xs truncate font-mono">
                          {comment.post?.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDate(comment.$createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {editingCommentId === comment.$id ? (
                          <div className="text-xs text-gray-500 font-mono">
                            Editing...
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(comment.$id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-mono">
                {searchTerm ? 'No matching comments found' : 'No comments yet'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-mono">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredComments.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
            Showing {filteredComments.length} of {comments.length} comments
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
}