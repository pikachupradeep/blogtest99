//comments/postTable/EditPostForm.tsx


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePostAction } from '@/actions/postActions';
import { getCategoriesAction } from '@/actions/category-actions';
import TiptapEditor from '@/components/TipTapEditor';

interface Post {
  $id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category_id: string;
  category_name?: string;
  status: 'pending' | 'published' | 'rejected';
  thumbnail?: string;
  bg_image?: string[];
}

// More flexible Category interface to match actual data
interface Category {
  $id: string;
  name: string;
  image?: string;
  // Add other possible properties from DefaultDocument
  [key: string]: any;
}

interface EditPostFormProps {
  post: any;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Transform the post data with safe defaults
  const safePost: Post = {
    $id: post?.$id || '',
    title: post?.title || '',
    slug: post?.slug || '',
    description: post?.description || '',
    content: post?.content || '',
    category_id: post?.category_id || '',
    category_name: post?.category_name || '',
    status: post?.status || 'pending',
    thumbnail: post?.thumbnail || '',
    bg_image: post?.bg_image || [],
  };

  const [formData, setFormData] = useState({
    title: safePost.title,
    slug: safePost.slug,
    description: safePost.description,
    content: safePost.content,
    category_id: safePost.category_id,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const result = await getCategoriesAction();
      
      // Transform the data to match our Category interface
      if (result && Array.isArray(result)) {
        const transformedCategories: Category[] = result.map((item: any) => ({
          $id: item.$id || '',
          name: item.name || 'Unnamed Category',
          image: item.image || '',
          // Include any other properties that might be useful
          ...item
        }));
        setCategories(transformedCategories);
      } else {
        console.error('Unexpected categories response:', result);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      thumbnail: file
    }));
  };

  const handleContentUpdate = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('postId', safePost.$id);
      submitFormData.append('title', formData.title);
      submitFormData.append('slug', formData.slug);
      submitFormData.append('description', formData.description);
      submitFormData.append('content', formData.content);
      submitFormData.append('category_id', formData.category_id);
      
      if (formData.thumbnail) {
        submitFormData.append('thumbnail', formData.thumbnail);
      }

      const result = await updatePostAction({} as any, submitFormData);

      if (result.success) {
        setSuccess(result.message || 'Post updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/posts');
        }, 2000);
      } else {
        setError(result.error || 'Failed to update post');
      }
    } catch (err) {
      setError('An error occurred while updating the post');
      console.error('Error updating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/posts');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">Edit Post</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 font-mono">Update your post information</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full font-mono ${
                  safePost.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  safePost.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {safePost.status}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400 font-mono">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 dark:text-green-400 font-mono">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="Enter post title"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="post-url-slug"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">This will be used in the URL for your post</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="Brief description of your post"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">Loading categories...</span>
                </div>
              ) : (
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.$id} value={category.$id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              {categories.length === 0 && !categoriesLoading && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400 font-mono">
                  No categories found. Please create categories first.
                </p>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Thumbnail Image
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 font-mono"
              />
              {safePost.thumbnail && !formData.thumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono">Current thumbnail:</p>
                  <img 
                    src={safePost.thumbnail} 
                    alt="Current thumbnail" 
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Content - Using TiptapEditor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-mono">
                Content *
              </label>
              <TiptapEditor
                content={formData.content}
                onUpdate={handleContentUpdate}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
                Use the rich text editor to format your content with headings, bold, italic, lists, and more.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || categoriesLoading || categories.length === 0}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center font-mono"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}