'use client';

import { useState, useEffect } from 'react';
import { getAllPostsForAdminAction, updatePostStatusAction, deletePostAction, debugAdminAccessAction } from '@/actions/postActions';
import Link from 'next/link';

interface Post {
  $id: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'rejected';
  views: number;
  $createdAt: string;
  author: {
    name: string;
    id: string;
  };
  category: {
    name: string;
    id: string;
  };
}

// Type for the raw data from the API
interface RawPost {
  $id: string;
  title?: string;
  slug?: string;
  status?: 'pending' | 'published' | 'rejected';
  views?: number;
  $createdAt: string;
  author?: {
    name: string;
    id: string;
  };
  category?: {
    name: string;
    id: string;
  };
}

export default function AdminPostsTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingPost, setUpdatingPost] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin posts...');
      
      const result = await getAllPostsForAdminAction();
      
      console.log('📊 Admin posts result:', {
        success: result.success,
        message: result.message,
        dataLength: result.data?.length || 0
      });
      
      if (result.success && result.data) {
        // Transform the raw data to match the Post interface
        const transformedPosts: Post[] = result.data.map((post: RawPost) => ({
          $id: post.$id,
          title: post.title || 'Untitled Post',
          slug: post.slug || 'no-slug',
          status: post.status || 'pending',
          views: post.views || 0,
          $createdAt: post.$createdAt,
          author: post.author || { name: 'Unknown Author', id: 'unknown' },
          category: post.category || { name: 'Uncategorized', id: 'unknown' }
        }));
        
        setPosts(transformedPosts);
        setError(''); // Clear any previous errors
      } else {
        setError(result.message || 'Failed to fetch posts');
        console.error('❌ Failed to fetch posts:', result.message);
      }
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setError('An error occurred while fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const runDebugCheck = async () => {
    try {
      console.log('🔍 Running admin debug check...');
      const debugResult = await debugAdminAccessAction();
      console.log('🔍 Debug result:', debugResult);
      setDebugInfo(debugResult);
      setShowDebug(true);
    } catch (err) {
      console.error('Debug check error:', err);
    }
  };

  // Filter posts based on status and search term
  const filteredPosts = posts.filter(post => {
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (postId: string, newStatus: 'pending' | 'published' | 'rejected') => {
    try {
      setUpdatingPost(postId);
      const result = await updatePostStatusAction(postId, newStatus);
      
      if (result.success) {
        // Update local state
        setPosts(posts.map(post => 
          post.$id === postId ? { ...post, status: newStatus } : post
        ));
      } else {
        alert(result.error || 'Failed to update post status');
      }
    } catch (err) {
      alert('An error occurred while updating post status');
      console.error('Error updating post status:', err);
    } finally {
      setUpdatingPost(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deletePostAction(postId);
      
      if (result.success) {
        setPosts(posts.filter(post => post.$id !== postId));
        alert('Post deleted successfully');
      } else {
        alert(result.error || 'Failed to delete post');
      }
    } catch (err) {
      alert('An error occurred while deleting post');
      console.error('Error deleting post:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      published: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium border rounded-full font-mono ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
  };

  // Get counts for each status
  const statusCounts = {
    all: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    published: posts.filter(p => p.status === 'published').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-mono">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 dark:text-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300 font-mono">Error Loading Posts</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1 font-mono">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={fetchPosts}
                className="px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              >
                Try Again
              </button>
              <button
                onClick={runDebugCheck}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                Debug Admin Access
              </button>
            </div>
            
            {showDebug && debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 font-mono">Debug Info:</h4>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                <button
                  onClick={() => setShowDebug(false)}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                >
                  Hide Debug
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden font-mono">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-mono">Posts Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
              Manage all posts, approve pending posts, and monitor post status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={fetchPosts}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 font-mono"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={runDebugCheck}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Debug Access
            </button>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && debugInfo && (
        <div className="px-6 py-4 border-b border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 font-mono">Admin Access Debug</h3>
              <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-400 font-mono">
                <p>User ID: {debugInfo.userId || 'Not found'}</p>
                <p>Admin Status: {debugInfo.isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
                {debugInfo.error && <p>Error: {debugInfo.error}</p>}
              </div>
            </div>
            <button
              onClick={() => setShowDebug(false)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts, authors, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter and Clear */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap font-mono">
                Status:
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              >
                <option value="all">All ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="published">Published ({statusCounts.published})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
              </select>
            </div>

            {(filterStatus !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filterStatus !== 'all' || searchTerm) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-mono">
                Status: {filterStatus}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-1.5 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-mono">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1.5 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Post
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Views
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white font-mono">No posts found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {posts.length === 0 
                        ? "No posts have been created yet." 
                        : "No posts match your current filters."}
                    </p>
                    {(filterStatus !== 'all' || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-xs font-mono">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          /{post.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{post.author.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{post.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {new Date(post.$createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* Status Actions */}
                      {post.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(post.$id, 'published')}
                            disabled={updatingPost === post.$id}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-mono"
                            title="Approve and publish this post"
                          >
                            {updatingPost === post.$id ? (
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            {updatingPost === post.$id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(post.$id, 'rejected')}
                            disabled={updatingPost === post.$id}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors font-mono"
                            title="Reject this post"
                          >
                            {updatingPost === post.$id ? '...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {post.status === 'published' && (
                        <button
                          onClick={() => handleStatusUpdate(post.$id, 'pending')}
                          disabled={updatingPost === post.$id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-mono"
                          title="Unpublish this post"
                        >
                          {updatingPost === post.$id ? '...' : 'Unpublish'}
                        </button>
                      )}
                      {post.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(post.$id, 'pending')}
                          disabled={updatingPost === post.$id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-mono"
                          title="Restore to pending status"
                        >
                          {updatingPost === post.$id ? '...' : 'Restore'}
                        </button>
                      )}
                      
                      {/* Edit Button */}
                      <Link
                        href={`/dashboard/posts/edit/${post.$id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-mono"
                        title="Edit this post"
                      >
                        Edit
                      </Link>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(post.$id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-mono"
                        title="Delete this post"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            Showing <span className="font-medium text-gray-900 dark:text-white">{filteredPosts.length}</span> of{' '}
            <span className="font-medium text-gray-900 dark:text-white">{posts.length}</span> posts
          </div>
          <div className="flex space-x-6 text-sm">
            <div className="flex items-center space-x-1 font-mono">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">{statusCounts.pending}</span>
              <span className="text-gray-600 dark:text-gray-400">pending</span>
            </div>
            <div className="flex items-center space-x-1 font-mono">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">{statusCounts.published}</span>
              <span className="text-gray-600 dark:text-gray-400">published</span>
            </div>
            <div className="flex items-center space-x-1 font-mono">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">{statusCounts.rejected}</span>
              <span className="text-gray-600 dark:text-gray-400">rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}