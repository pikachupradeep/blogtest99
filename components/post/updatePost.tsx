// components/EditPost.tsx
'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updatePostAction, getPostByIdAction } from '@/actions/postActions'
import { getCategoriesAction } from '@/actions/category-actions'
import { z } from 'zod'
import TiptapEditor from '../TipTapEditor'
import { 
  FiArrowLeft, 
  FiCheck, 
  FiX, 
  FiImage, 
  FiFileText, 
  FiTag, 
  FiLink, 
  FiType, 
  FiFolder,
  FiUpload,
  FiLoader,
  FiTrash2,
  FiEdit,
  FiAlertCircle,
  FiLock
} from 'react-icons/fi'
import { 
  FaRegCheckCircle, 
  FaRegTimesCircle, 
  FaSpinner 
} from 'react-icons/fa'

// Helper function to count words
const countWords = (text: string): number => {
  if (!text || typeof text !== 'string') return 0;
  
  const cleanText = text.replace(/<[^>]*>/g, ' ').trim();
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

// Helper function to count words for plain text
const countWordsPlain = (text: string): number => {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

// Helper function to normalize text (convert smart quotes to straight quotes)
const normalizeText = (text: string): string => {
  return text
    .replace(/[\u2018\u2019]/g, "'")    // Convert smart single quotes to straight quotes
    .replace(/[\u201C\u201D]/g, '"');   // Convert smart double quotes to straight quotes
};

// Define Zod schema for validation - UPDATED with same validations as CreatePost
const updatePostSchema = z.object({
  title: z
    .string()
    .min(50, 'Title must be at least 50 characters for SEO')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_,\.!\?:'"@#$%^&*()+=<>\[\]{}|\\\/`~—–•·©®™€£¥•\u2018\u2019\u201C\u201D]+$/u,
      'Title contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.'
    ),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9\-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),

  description: z
    .string()
    .refine((val) => {
      const wordCount = countWordsPlain(val);
      return wordCount >= 10 && wordCount <= 100;
    }, 'Description must be between 10 and 100 words'),

  content: z
    .string()
    .refine((val) => {
      const wordCount = countWords(val);
      return wordCount >= 300 && wordCount <= 5000;
    }, 'Content must be between 300 and 5000 words'),

  category_id: z
    .string()
    .min(1, 'Please select a category'),

  thumbnail: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'Thumbnail size must be less than 5MB')
    .refine((file) => {
      if (!file) return true;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return validTypes.includes(file.type);
    }, 'Only JPEG, PNG, WebP, and GIF images are allowed')
});

type UpdatePostFormData = z.infer<typeof updatePostSchema>;

interface Category {
  $id: string
  name: string
  image?: string
  description?: string
  $createdAt?: string
  $updatedAt?: string
  [key: string]: any
}

interface UpdatePostFormState {
  success?: boolean
  error?: string
  message?: string
}

interface EditPostProps {
  postId: string
}

const EditPost = ({ postId }: EditPostProps) => {
  const router = useRouter()
  
  const [state, formAction, isPending] = useActionState<UpdatePostFormState, FormData>(
    updatePostAction,
    {}
  );
  
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Updated constants to match CreatePost
  const TITLE_MIN_CHARS = 50 // Changed from 60 to match CreatePost
  const TITLE_MAX_CHARS = 200
  const DESCRIPTION_MIN_WORDS = 10
  const DESCRIPTION_MAX_WORDS = 100
  const CONTENT_MIN_WORDS = 300
  const CONTENT_MAX_WORDS = 5000
  const THUMBNAIL_MAX_SIZE = 5 * 1024 * 1024

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingCategories(true)
        setIsLoadingPost(true)

        // Fetch categories
        const categoriesResult = await getCategoriesAction()
        if (categoriesResult && Array.isArray(categoriesResult)) {
          const categoriesData = categoriesResult.map((doc: any) => ({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            description: doc.description,
            $createdAt: doc.$createdAt,
            $updatedAt: doc.$updatedAt,
            ...doc
          })) as Category[]
          setCategories(categoriesData)
        }

        // Fetch post data
        const postResult = await getPostByIdAction(postId)
        if (postResult.success && postResult.data) {
          const post = postResult.data
          // Normalize title to convert smart quotes to straight quotes
          setTitle(normalizeText(post.title))
          setDescription(post.description)
          setContent(post.content)
          setSlug(post.slug)
          setCategoryId(post.category_id)
          setCurrentThumbnail(post.thumbnail || null)
          setThumbnailPreview(post.thumbnail || null)
          
          if (post.bg_image && Array.isArray(post.bg_image)) {
            setUploadedImages(post.bg_image.map((url: string) => ({ url })))
          }
        } else {
          console.error('Failed to load post:', postResult.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoadingCategories(false)
        setIsLoadingPost(false)
      }
    }

    fetchData()
  }, [postId])

  const handleEditorUpdate = (html: string) => {
    setContent(html)
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }))
    }
  }

  const handleImagesUpload = (images: any[]) => {
    setUploadedImages(prev => [...prev, ...images])
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = normalizeText(e.target.value)
    setTitle(newTitle)
    
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }))
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }))
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value
    setCategoryId(newCategoryId)
    
    if (errors.category_id) {
      setErrors(prev => ({ ...prev, category_id: '' }))
    }
  }

  const validateField = (fieldName: string, value: any): string | null => {
    try {
      const partialSchema = updatePostSchema.pick({ [fieldName]: true as any });
      
      if (fieldName === 'thumbnail') {
        if (!value) return null;
      }
      
      if (fieldName === 'content') {
        const wordCount = countWords(value);
        if (wordCount > CONTENT_MAX_WORDS) {
          return `Content must be less than ${CONTENT_MAX_WORDS} words`;
        }
        if (wordCount < CONTENT_MIN_WORDS) {
          return `Content must have at least ${CONTENT_MIN_WORDS} words`;
        }
      }
      
      if (fieldName === 'description') {
        const wordCount = countWordsPlain(value);
        if (wordCount > DESCRIPTION_MAX_WORDS) {
          return `Description must be less than ${DESCRIPTION_MAX_WORDS} words`;
        }
        if (wordCount < DESCRIPTION_MIN_WORDS) {
          return `Description must have at least ${DESCRIPTION_MIN_WORDS} words`;
        }
      }
      
      // For title, check character length (additional validation)
      if (fieldName === 'title') {
        if (value.length < TITLE_MIN_CHARS) {
          return `Title must be at least ${TITLE_MIN_CHARS} characters for SEO`;
        }
        if (value.length > TITLE_MAX_CHARS) {
          return `Title must be less than ${TITLE_MAX_CHARS} characters`;
        }
      }
      
      const result = partialSchema.safeParse({ [fieldName]: value });
      
      if (!result.success) {
        return result.error.issues[0]?.message || null;
      }
      return null;
    } catch (error) {
      console.error('Field validation error:', error);
      return 'Invalid input';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const fields = [
      { name: 'title', value: title },
      { name: 'slug', value: slug },
      { name: 'description', value: description },
      { name: 'content', value: content },
      { name: 'thumbnail', value: thumbnailFile }
    ];
    
    fields.forEach(({ name, value }) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      }
    });
    
    if (!categoryId) {
      newErrors.category_id = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, thumbnail: 'Only JPEG, PNG, WebP, and GIF images are allowed' }));
        return;
      }

      if (file.size > THUMBNAIL_MAX_SIZE) {
        setErrors(prev => ({ ...prev, thumbnail: `File size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` }));
        return;
      }

      setThumbnailFile(file)
      setErrors(prev => ({ ...prev, thumbnail: '' }));
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null)
    setThumbnailFile(null)
    setCurrentThumbnail(null)
    setErrors(prev => ({ ...prev, thumbnail: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (!validateForm()) {
      return;
    }
    
    formData.set('content', content)
    formData.set('postId', postId)
    
    // Add slug from hidden field (disabled fields don't submit)
    formData.set('slug', slug)
    
    if (thumbnailFile) {
      formData.set('thumbnail', thumbnailFile)
    }
    
    formAction(formData)
  }

  const getWordCount = (text: string): number => {
    return countWords(text);
  };

  const getPlainWordCount = (text: string): number => {
    return countWordsPlain(text);
  };

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        router.push('/authDashboard/posts')
      }, 2000)
    }
  }, [state.success, router])

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading post data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg dark:shadow-gray-900/50 mb-4 transition-colors duration-300">
            <FiEdit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Edit Post
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Update your post content and information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 overflow-hidden transition-colors duration-300">
          <div className="px-8 pt-8">
            {state.success && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl transition-colors duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaRegCheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Success!</h3>
                    <p className="text-green-700 dark:text-green-300">
                      {state.message || 'Post updated successfully!'}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Redirecting to your posts...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl transition-colors duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaRegTimesCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">Oops! Something went wrong</h3>
                    <p className="text-red-700 dark:text-red-300">
                      {state.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form action={handleSubmit} className="space-y-8 px-8 pb-8">
            {/* Hidden fields that actually submit data */}
            <input type="hidden" name="postId" value={postId} />
            {/* FIX: Hidden slug field for form submission */}
            <input type="hidden" name="slug" value={slug} />

            {/* Title */}
            <div className="group">
              <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FiType className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                Title *
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({TITLE_MIN_CHARS}-{TITLE_MAX_CHARS} characters)
                </span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleTitleChange}
                onBlur={() => {
                  const error = validateField('title', title);
                  if (error) {
                    setErrors(prev => ({ ...prev, title: error }));
                  }
                }}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-600'
                }`}
                placeholder="Enter a captivating title for your post (minimum 50 characters)..."
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {errors.title && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {errors.title}
                    </div>
                  )}
                </div>
                <div className={`text-xs font-medium ${
                  title.length < TITLE_MIN_CHARS 
                    ? 'text-red-600 dark:text-red-400' 
                    : title.length > TITLE_MAX_CHARS 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-green-600 dark:text-green-400'
                }`}>
                  {title.length}/{TITLE_MAX_CHARS} characters
                  {title.length < TITLE_MIN_CHARS && (
                    <span className="ml-1">(need {TITLE_MIN_CHARS - title.length} more)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Slug - Disabled field */}
            <div className="group">
              <label htmlFor="slug" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FiLink className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
                URL Slug *
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  (read-only for editing)
                </span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  disabled
                  readOnly
                  className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-mono text-sm cursor-not-allowed ${
                    errors.slug 
                      ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Auto-generated slug..."
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {slug.split('-').pop() || '...'}
                  </span>
                  <FiLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {errors.slug && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {errors.slug}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full flex items-center">
                    <FiCheck className="w-3 h-3 mr-1" />
                    Original slug preserved
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FiFileText className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                Description *
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({DESCRIPTION_MIN_WORDS}-{DESCRIPTION_MAX_WORDS} words)
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                onBlur={() => {
                  const error = validateField('description', description);
                  if (error) {
                    setErrors(prev => ({ ...prev, description: error }));
                  }
                }}
                rows={3}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.description 
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 group-hover:border-purple-300 dark:group-hover:border-purple-600'
                }`}
                placeholder="Write a brief but compelling description that makes readers want to dive in..."
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {errors.description && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {errors.description}
                    </div>
                  )}
                </div>
                <div className={`text-xs font-medium ${
                  getPlainWordCount(description) < DESCRIPTION_MIN_WORDS
                    ? 'text-red-600 dark:text-red-400' 
                    : getPlainWordCount(description) > DESCRIPTION_MAX_WORDS
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-green-600 dark:text-green-400'
                }`}>
                  {getPlainWordCount(description)}/{DESCRIPTION_MAX_WORDS} words
                  {getPlainWordCount(description) < DESCRIPTION_MIN_WORDS && (
                    <span className="ml-1">(need {DESCRIPTION_MIN_WORDS - getPlainWordCount(description)} more)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="group">
              <label htmlFor="category_id" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FiFolder className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                Category *
              </label>
              <div className="relative">
                <select
                  id="category_id"
                  name="category_id"
                  value={categoryId}
                  onChange={handleCategoryChange}
                  required
                  disabled={isLoadingCategories}
                  onBlur={() => {
                    if (!categoryId && errors.category_id) {
                      setErrors(prev => ({ ...prev, category_id: 'Please select a category' }));
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                    errors.category_id 
                      ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-600 group-hover:border-orange-300 dark:group-hover:border-orange-600'
                  }`}
                >
                  <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {isLoadingCategories ? 'Loading categories...' : 'Choose a category that fits your post'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.$id} value={category.$id} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FiTag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {errors.category_id && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {errors.category_id}
                    </div>
                  )}
                  {categories.length === 0 && !isLoadingCategories && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center transition-colors duration-300">
                      <FiX className="w-3 h-3 mr-1" />
                      No categories found. Please create categories first in the dashboard.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="group">
              <label htmlFor="thumbnail" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FiImage className="w-4 h-4 mr-2 text-pink-500 dark:text-pink-400" />
                Thumbnail Image
                {isUploadingThumbnail && <FiLoader className="w-4 h-4 ml-2 animate-spin" />}
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  (Max 5MB, optional)
                </span>
              </label>
              
              {thumbnailPreview && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentThumbnail && !thumbnailFile ? 'Current Thumbnail' : 'Thumbnail Preview'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      <FiTrash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-w-xs h-48 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {thumbnailFile?.name || (currentThumbnail ? 'Current thumbnail' : '')} • {thumbnailFile ? `${(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </div>
                  </div>
                </div>
              )}

              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                errors.thumbnail
                  ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : thumbnailPreview 
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 group-hover:border-pink-400 dark:group-hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20'
              }`}>
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <label htmlFor="thumbnail" className="cursor-pointer block">
                  {errors.thumbnail ? (
                    <>
                      <FiAlertCircle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        Invalid Thumbnail
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.thumbnail}
                      </p>
                    </>
                  ) : thumbnailPreview ? (
                    <>
                      <FiCheck className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                        {currentThumbnail && !thumbnailFile ? 'Current thumbnail loaded' : 'Thumbnail selected ✓'}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Click to change thumbnail image
                      </p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-8 h-8 text-pink-500 dark:text-pink-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Click to upload thumbnail
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentThumbnail ? 'Click to replace current thumbnail' : 'This will be the main image for your post.'} Max 5MB.
                      </p>
                    </>
                  )}
                </label>
              </div>
              {errors.thumbnail && (
                <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  {errors.thumbnail}
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                  <FiFileText className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                  Content *
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                    ({CONTENT_MIN_WORDS}-{CONTENT_MAX_WORDS} words)
                  </span>
                </label>
              </div>
              <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 shadow-sm ${
                errors.content 
                  ? 'border-red-300 dark:border-red-500' 
                  : 'border-gray-200 dark:border-gray-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-600'
              }`}>
                <TiptapEditor
                  content={content}
                  onUpdate={handleEditorUpdate}
                  onImagesUpload={handleImagesUpload}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {errors.content && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                      <FiAlertCircle className="w-3 h-3 mr-1" />
                      {errors.content}
                    </div>
                  )}
                </div>
                <div className={`text-xs font-medium ${
                  getWordCount(content) < CONTENT_MIN_WORDS
                    ? 'text-red-600 dark:text-red-400' 
                    : getWordCount(content) > CONTENT_MAX_WORDS
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-green-600 dark:text-green-400'
                }`}>
                  {getWordCount(content)}/{CONTENT_MAX_WORDS} words
                  {getWordCount(content) < CONTENT_MIN_WORDS && (
                    <span className="ml-1">(need minimum {CONTENT_MIN_WORDS - getWordCount(content)} words)</span>
                  )}
                </div>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                <div className="flex items-center mb-4">
                  <FiImage className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Images in Your Post ({uploadedImages.length})
                  </h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  These images are currently in your post content.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group/image">
                      <img
                        src={image.url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-sm transition-all duration-200 group-hover/image:scale-105 group-hover/image:shadow-md"
                      />
                      <div className="absolute bottom-2 left-2 bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !content.trim() || categories.length === 0}
                className="flex items-center px-8 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Updating Post...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4 mr-2" />
                    Update Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditPost