'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUserPostsAction, getPostLikesInfoAction, deletePostAction } from '@/actions/postActions';
import { FiEdit, FiEye, FiCalendar, FiFolder, FiUser, FiClock, FiHeart, FiTrash2, FiLoader, FiArrowUp, FiArrowDown, FiCheck, FiX } from 'react-icons/fi';

type Post = {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title?: string;
  description?: string;
  content?: string;
  slug?: string;
  category_id?: string;
  category_name?: string;
  profile_id?: string;
  author_id?: string;
  status?: 'pending' | 'published' | 'rejected';
  views?: number;
  bg_image?: string[];
  thumbnail?: string;
  author?: {
    name: string;
    image: string;
    id: string;
  };
  category?: {
    name: string;
    id: string;
  };
  [key: string]: any;
};

interface LikeInfo {
  likeCount: number;
  userLiked: boolean;
}

type SortField = 'title' | 'status' | 'views' | 'createdAt' | 'category';
type SortDirection = 'asc' | 'desc';

export default function UserPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesInfo, setLikesInfo] = useState<{[key: string]: LikeInfo}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUserPostsAction();
      
      if (result.success && result.data) {
        setPosts(result.data);
        
        // Fetch likes info for each post
        const likesData: {[key: string]: LikeInfo} = {};
        for (const post of result.data) {
          try {
            const likeResult = await getPostLikesInfoAction(post.$id);
            if (likeResult.success) {
              likesData[post.$id] = {
                likeCount: likeResult.likeCount || 0,
                userLiked: likeResult.userLiked || false
              };
            }
          } catch (err) {
            console.error(`Error fetching likes for post ${post.$id}:`, err);
            likesData[post.$id] = { likeCount: 0, userLiked: false };
          }
        }
        setLikesInfo(likesData);
      } else {
        setError(result.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An error occurred while fetching posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    let aValue: any = a;
    let bValue: any = b;

    if (sortField === 'title') {
      aValue = a.title || '';
      bValue = b.title || '';
    } else if (sortField === 'status') {
      aValue = a.status || 'pending';
      bValue = b.status || 'pending';
    } else if (sortField === 'views') {
      aValue = a.views || 0;
      bValue = b.views || 0;
    } else if (sortField === 'createdAt') {
      aValue = new Date(a.$createdAt);
      bValue = new Date(b.$createdAt);
    } else if (sortField === 'category') {
      aValue = a.category?.name || '';
      bValue = b.category?.name || '';
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleLike = async (postId: string) => {
    try {
      // Optimistic update
      const currentLikeInfo = likesInfo[postId] || { likeCount: 0, userLiked: false };
      const newUserLiked = !currentLikeInfo.userLiked;
      const newLikeCount = newUserLiked 
        ? currentLikeInfo.likeCount + 1 
        : Math.max(0, currentLikeInfo.likeCount - 1);

      setLikesInfo(prev => ({
        ...prev,
        [postId]: {
          likeCount: newLikeCount,
          userLiked: newUserLiked
        }
      }));

      // Call the like action
      const likeResult = await getPostLikesInfoAction(postId);
      if (likeResult.success) {
        // Update with actual server state
        setLikesInfo(prev => ({
          ...prev,
          [postId]: {
            likeCount: likeResult.likeCount || 0,
            userLiked: likeResult.userLiked || false
          }
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update on error
      fetchUserPosts(); // Refetch to get correct state
    }
  };

  const handleDeletePost = async (postId: string) => {
    const post = posts.find(p => p.$id === postId);
    
    // Check if post is published
    if (post?.status === 'published') {
      setDeleteError('Cannot delete published posts. Please unpublish the post first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPostId(postId);
      setDeleteError('');

      const result = await deletePostAction(postId);
      
      if (result.success) {
        // Remove the post from the local state
        setPosts(prev => prev.filter(post => post.$id !== postId));
        
        // Remove from likes info
        setLikesInfo(prev => {
          const newLikesInfo = { ...prev };
          delete newLikesInfo[postId];
          return newLikesInfo;
        });
      } else {
        setDeleteError(result.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setDeleteError('An error occurred while deleting the post');
    } finally {
      setDeletingPostId(null);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const getStatusColor = (status: string = 'pending') => {
    switch (status) {
      case 'published': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string = 'pending') => {
    switch (status) {
      case 'published': 
        return <FiCheck className="w-3 h-3 mr-1" />;
      case 'pending': 
        return <FiLoader className="w-3 h-3 mr-1 animate-spin" />;
      case 'rejected': 
        return <FiX className="w-3 h-3 mr-1" />;
      default: 
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getReadTime = (content: string) => {
    return content ? Math.ceil(content.split(/\s+/).length / 200) : 0;
  };

  const isDeleteDisabled = (post: Post) => {
    return post.status === 'published' || deletingPostId === post.$id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 font-mono max-w-2xl mx-auto dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-800 text-center mb-4 dark:text-red-300">{error}</p>
        <button 
          onClick={fetchUserPosts}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm dark:bg-red-700 dark:hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono mb-16 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage and track your blog content</p>
        </div>
        <div className="mt-4 sm:mt-0 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 inline-block px-4 py-2 rounded-full">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
          </div>
        </div>
      </div>

      {/* Delete Error Message */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 font-mono dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-300 text-sm">{deleteError}</p>
            <button 
              onClick={() => setDeleteError('')}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEdit className="text-gray-400 dark:text-gray-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No posts created yet</p>
          <Link 
            href="/authDashboard/posts/create"
            className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedPosts.map((post) => {
                  const postLikes = likesInfo[post.$id] || { likeCount: 0, userLiked: false };
                  const readTime = getReadTime(post.content || '');
                  const deleteDisabled = isDeleteDisabled(post);
                  
                  return (
                    <tr key={post.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Title & Description */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {post.thumbnail && (
                            <img 
                              src={post.thumbnail} 
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                              <Link 
                                href={`/blog/${post.slug || '#'}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {post.title || 'Untitled Post'}
                              </Link>
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                              {truncateText(post.description || 'No description', 80)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FiFolder className="text-gray-400 dark:text-gray-500 text-sm" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {post.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                          {post.status || 'pending'}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1" title="Views">
                            <FiEye className="text-sm" />
                            <span>{post.views || 0}</span>
                          </div>
                          <div 
                            className="flex items-center space-x-1 cursor-pointer transition-colors"
                            onClick={() => handleLike(post.$id)}
                            title="Likes"
                          >
                            <FiHeart 
                              className={`text-sm ${
                                postLikes.userLiked 
                                  ? 'text-red-500 fill-red-500 dark:text-red-400 dark:fill-red-400' 
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            />
                            <span>{postLikes.likeCount}</span>
                          </div>
                          {readTime > 0 && (
                            <div className="flex items-center space-x-1" title="Read time">
                              <FiClock className="text-sm" />
                              <span>{readTime}m</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <FiCalendar className="text-sm" />
                          <span>{formatDate(post.$createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {/* Edit Button - Disabled for published posts */}
                          <Link
                            href={
                              post.status === 'published' 
                                ? '#' 
                                : `/authDashboard/posts/edit/${post.$id}`
                            }
                            onClick={(e) => {
                              if (post.status === 'published') {
                                e.preventDefault();
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              post.status === 'published'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                            title={
                              post.status === 'published' 
                                ? 'Cannot edit published posts' 
                                : 'Edit Post'
                            }
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeletePost(post.$id)}
                            disabled={deleteDisabled}
                            className={`p-2 rounded-lg transition-colors ${
                              deleteDisabled
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={
                              post.status === 'published' 
                                ? 'Cannot delete published posts' 
                                : 'Delete Post'
                            }
                          >
                            {deletingPostId === post.$id ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Published: {posts.filter(p => p.status === 'published').length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Pending: {posts.filter(p => p.status === 'pending').length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Rejected: {posts.filter(p => p.status === 'rejected').length}</span>
                </div>
              </div>
              <div className="text-xs">
                <span className="text-amber-600 dark:text-amber-400">
                  💡 Published posts cannot be edited or deleted
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}