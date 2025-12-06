'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { updateCategoryAction } from '@/actions/category-actions';
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes, FaTrash, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Category {
  $id: string;
  name: string;
  image?: string;
}

interface UpdateCategoryFormProps {
  category: Category;
}

export function UpdateCategoryForm({ category }: UpdateCategoryFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateCategoryAction, {
    success: false,
    error: '',
    message: ''
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Initialize form with category data
  useEffect(() => {
    if (category.image && !removeImage) {
      setPreviewUrl(category.image);
    } else {
      setPreviewUrl(null);
    }
  }, [category.image, removeImage]);

  // Handle successful update
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/dashboard/category');
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
    setRemoveImage(true);
  };

  const handleCancel = () => {
    router.push('/dashboard/category');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Append all form data manually
    formData.append('categoryId', category.$id);
    formData.append('name', (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value);
    formData.append('removeImage', removeImage.toString());
    
    // Append the image file if it exists
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Wrap the formAction call in startTransition to fix the React error
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto font-mono">
      <form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6 backdrop-blur-sm"
      >
        {/* Hidden category ID field */}
        <input type="hidden" name="categoryId" value={category.$id} />

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-mono">
            Edit Category
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-mono">
            Update your category information
          </p>
        </div>

        {/* Category Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">
            Category Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={category.name}
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-mono"
              placeholder="Enter category name..."
            />
          </div>
        </div>

        {/* Image Upload Field */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">
            Category Image
          </label>
          
          {/* Current Image Preview */}
          {category.image && !removeImage && !imageFile && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Current Image:</p>
              <div className="relative group">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* New Image Preview */}
          {previewUrl && imageFile && !removeImage && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">New Image Preview:</p>
              <div className="relative group">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Remove Image Preview */}
          {removeImage && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Image will be removed</p>
              <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <FaImage className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">No image</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20">
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={isPending}
              className="hidden"
            />
            <label 
              htmlFor="image" 
              className="flex flex-col items-center justify-center p-8 cursor-pointer disabled:cursor-not-allowed group font-mono"
            >
              <FaUpload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 font-mono">
                {category.image ? 'Change image' : 'Upload image'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center font-mono">
                JPEG, PNG, WebP, GIF • Max 5MB
              </span>
            </label>
          </div>

          {/* Restore Image Option */}
          {removeImage && category.image && (
            <button
              type="button"
              onClick={() => {
                setRemoveImage(false);
                setPreviewUrl(category.image!);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2 transition-colors duration-200 font-mono"
            >
              <FaImage className="w-3 h-3" />
              Restore original image
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-2 px-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-3 font-mono"
          >
            <FaTimes className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-3 group font-mono"
          >
            {isPending ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Update</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        <div className="min-h-[20px]">
          {state.error && (
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-1 duration-300 font-mono">
              <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium block font-mono">Error</span>
                <span className="text-xs text-red-500 dark:text-red-400 mt-1 font-mono">{state.error}</span>
              </div>
            </div>
          )}
          
          {state.success && (
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-1 duration-300 font-mono">
              <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium block font-mono">Success!</span>
                <span className="text-xs text-green-500 dark:text-green-400 mt-1 font-mono">{state.message}</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}