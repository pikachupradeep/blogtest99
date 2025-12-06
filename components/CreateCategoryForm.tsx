'use client';

import { useActionState, useState, useEffect } from 'react';
import { createCategoryAction } from '@/actions/category-actions';
import { useRouter } from 'next/navigation';
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export function CategoryForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createCategoryAction, {
    success: false,
    error: '',
    message: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle redirect on success
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/dashboard/category');
      }, 1500); // 1.5 second delay to show success message
      
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 pb-6">
      <form 
        action={formAction} 
        className="
          bg-white dark:bg-gray-800 
          rounded-2xl shadow-xl 
          border border-gray-100 dark:border-gray-700 
          p-6 space-y-6 
          backdrop-blur-sm
          transition-colors duration-200
        "
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="
            text-2xl font-bold 
            bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 
            bg-clip-text text-transparent
          ">
            New Category
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Add a new category to organize your content
          </p>
        </div>

        {/* Category Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Category Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              required
              minLength={2}
              disabled={isPending}
              className="
                w-full px-4 py-3 rounded-xl 
                border border-gray-200 dark:border-gray-600 
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 
                transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed 
                bg-gray-50/50 dark:bg-gray-700/50 
                focus:bg-white dark:focus:bg-gray-800 
                placeholder-gray-400 dark:placeholder-gray-500
                text-gray-900 dark:text-gray-100
              "
              placeholder="Enter category name..."
            />
          </div>
        </div>

        {/* Image Upload Field */}
        <div className="space-y-3">
          <label htmlFor="image" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Category Image
          </label>
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="relative group">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="
                  absolute -top-2 -right-2 
                  bg-red-500 dark:bg-red-600 
                  text-white p-1 rounded-full 
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-200 
                  hover:scale-110 shadow-lg
                "
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Area */}
          <div className={`
            border-2 border-dashed 
            border-gray-300 dark:border-gray-600 
            rounded-xl transition-all duration-200 
            hover:border-blue-400 dark:hover:border-blue-500 
            hover:bg-blue-50/30 dark:hover:bg-blue-900/10 
            ${previewUrl ? 'hidden' : 'block'}
          `}>
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
              className="flex flex-col items-center justify-center p-8 cursor-pointer disabled:cursor-not-allowed group"
            >
              <FaUpload className="
                w-8 h-8 
                text-gray-400 dark:text-gray-500 
                mb-3 
                group-hover:text-blue-500 dark:group-hover:text-blue-400 
                transition-colors duration-200
              " />
              <span className="
                text-sm font-medium 
                text-gray-600 dark:text-gray-400 
                group-hover:text-blue-600 dark:group-hover:text-blue-300 
                transition-colors duration-200
              ">
                Click to upload image
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                JPEG, PNG, WebP, GIF • Max 5MB
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="
            w-full 
            bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 
            hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 
            text-white 
            py-3 px-4 rounded-xl font-semibold 
            shadow-lg hover:shadow-xl 
            transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 
            transition-all duration-200 
            flex items-center justify-center gap-3 group
          "
        >
          {isPending ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              <span>Creating Category...</span>
            </>
          ) : (
            <>
              <FaCheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Create Category</span>
            </>
          )}
        </button>

        {/* Status Messages */}
        <div className="min-h-[20px]">
          {state.error && (
            <div className="
              flex items-center gap-3 
              text-red-600 dark:text-red-400 
              bg-red-50 dark:bg-red-900/20 
              border border-red-200 dark:border-red-800 
              rounded-lg p-4 
              animate-in fade-in slide-in-from-top-1 duration-300
            ">
              <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium block">Error</span>
                <span className="text-xs text-red-500 dark:text-red-300 mt-1">{state.error}</span>
              </div>
            </div>
          )}
          
          {state.success && (
            <div className="
              flex items-center gap-3 
              text-green-600 dark:text-green-400 
              bg-green-50 dark:bg-green-900/20 
              border border-green-200 dark:border-green-800 
              rounded-lg p-4 
              animate-in fade-in slide-in-from-top-1 duration-300
            ">
              <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium block">Success!</span>
                <span className="text-xs text-green-500 dark:text-green-300 mt-1">
                  {state.message} Redirecting to dashboard...
                </span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Form Tips */}
      <div className="mt-6 text-center">
        <div className="
          inline-flex items-center gap-2 
          text-xs text-gray-400 dark:text-gray-500 
          bg-gray-50 dark:bg-gray-800 
          rounded-full px-4 py-2
        ">
          <div className="w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
          <span>Categories help organize your content and improve navigation</span>
        </div>
      </div>
    </div>
  );
}