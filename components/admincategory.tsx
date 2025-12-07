'use client';

import { getCategoriesAction, deleteCategoryAction } from '@/actions/category-actions';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTag, FaEdit, FaTrash, FaImage, FaSpinner, FaCalendar, FaSync, FaPlus } from 'react-icons/fa';

// Use a more flexible interface that matches the actual data structure
interface Category {
  $id: string;
  name: string;
  image?: string;
  $createdAt: string;
  $updatedAt: string;
  // Add other properties that might come from Appwrite
  [key: string]: any; // Allow for additional properties
}

interface CategoriesTableProps {
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
}

export function CategoriesTable({ onAddCategory, onEditCategory }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await getCategoriesAction();
      
      // Type guard to ensure we have valid category data
      if (Array.isArray(result)) {
        // Transform the data to match our Category interface
        const transformedCategories: Category[] = result.map((item: any) => ({
          $id: item.$id || item.id || '',
          name: item.name || '',
          image: item.image || undefined,
          $createdAt: item.$createdAt || item.createdAt || new Date().toISOString(),
          $updatedAt: item.$updatedAt || item.updatedAt || new Date().toISOString(),
          ...item // Spread the rest of the properties
        }));
        
        setCategories(transformedCategories);
      } else {
        // Handle case where result might be an object with data property
        const data = (result as any)?.data || result;
        if (Array.isArray(data)) {
          const transformedCategories: Category[] = data.map((item: any) => ({
            $id: item.$id || item.id || '',
            name: item.name || '',
            image: item.image || undefined,
            $createdAt: item.$createdAt || item.createdAt || new Date().toISOString(),
            $updatedAt: item.$updatedAt || item.updatedAt || new Date().toISOString(),
            ...item
          }));
          setCategories(transformedCategories);
        } else {
          setError('Invalid data format received from server');
        }
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string, imageUrl?: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setDeletingId(categoryId);
      const result = await deleteCategoryAction(categoryId, imageUrl);
      
      if (result.success) {
        setCategories(categories.filter(cat => cat.$id !== categoryId));
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (category: Category) => {
    if (onEditCategory) {
      onEditCategory(category);
    } else {
      // Fallback: show alert or implement inline editing
      alert(`Edit category: ${category.name}`);
      console.log('Edit category:', category);
    }
  };

  const handleAddCategory = () => {
    if (onAddCategory) {
      onAddCategory();
    } else {
      // Fallback: redirect to create page or show modal
      console.log('Add new category');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center font-mono">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={loadCategories}
          className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-mono"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border mb-8 border-gray-200 dark:border-gray-700 overflow-hidden font-mono">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-mono">All Categories</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-mono">
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadCategories}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-mono"
            >
              <FaSync className="w-4 h-4" />
              Refresh
            </button>
            <Link href="/dashboard/category/create">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 dark:bg-blue-700 border border-blue-600 dark:border-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-mono">
                <FaPlus className="w-4 h-4" />
                Add Category
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 font-mono">No categories yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-mono">Create your first category to get started</p>
            <Link href="/dashboard/category/create">
              <button className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors mx-auto font-mono">
                <FaPlus className="w-4 h-4" />
                Create Your First Category
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.$id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200 group"
              >
                {/* Category Image */}
                <div className="relative mb-4">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <FaTag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={`/dashboard/category/${category.$id}`}>
                      <button
                        className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                        title="Edit Category"
                      >
                        <FaEdit className="w-3 h-3" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(category.$id, category.image)}
                      disabled={deletingId === category.$id}
                      className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      title="Delete Category"
                    >
                      {deletingId === category.$id ? (
                        <FaSpinner className="w-3 h-3 animate-spin" />
                      ) : (
                        <FaTrash className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Name */}
                <div className="mb-3">
                  <h3 className="font-semibold capitalize text-gray-900 dark:text-white text-lg mb-1 line-clamp-1 font-mono">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded inline-block font-mono">
                    ID: {category.$id.slice(0, 8)}...
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <FaCalendar className="w-3 h-3" />
                    <span>Created: {new Date(category.$createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <FaSync className="w-3 h-3" />
                    <span>Updated: {new Date(category.$updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link href={`/dashboard/category/${category.$id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-mono">
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(category.$id, category.image)}
                    disabled={deletingId === category.$id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 font-mono"
                  >
                    {deletingId === category.$id ? (
                      <FaSpinner className="w-3 h-3 animate-spin" />
                    ) : (
                      <FaTrash className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}