//actions/category-actions.ts

'use server';

import { createCategory, getCategories, deleteCategory, uploadImage, deleteImage, updateCategory, getCategoryById, getCategoryByIdFormatted } from '@/data/categories';
import { databases, Query } from '@/lib/appwrite-server';
import { revalidatePath } from 'next/cache';

interface CreateCategoryState {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function createCategoryAction(prevState: CreateCategoryState, formData: FormData): Promise<CreateCategoryState> {
  try {
    const name = formData.get('name') as string;
    const imageFile = formData.get('image') as File;

    // Validate input
    if (!name || name.trim() === '') {
      return {
        error: 'Category name is required'
      };
    }

    if (name.length < 2) {
      return {
        error: 'Category name must be at least 2 characters long'
      };
    }

    let imageUrl: string | undefined;

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return {
          error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images only.'
        };
      }

      // Validate file size (5MB max)
      const maxSize = 10 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return {
          error: 'Image size too large. Please upload images smaller than 5MB.'
        };
      }

      try {
        imageUrl = await uploadImage(imageFile);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return {
          error: 'Failed to upload image. Please try again.'
        };
      }
    }

    const category = await createCategory(name, imageUrl);
    revalidatePath('/');
    
    return {
      success: true,
      message: `Category "${category.name}" created successfully!`
    };

  } catch (error: any) {
    console.error('Error creating category:', error);
    return {
      error: error.message || 'Failed to create category'
    };
  }
}

export async function getCategoriesAction() {
  return await getCategories();
}

export async function getCategoryByIdAction(categoryId: string) {
  return await getCategoryById(categoryId);
}

export async function updateCategoryAction(
  prevState: CreateCategoryState,
  formData: FormData
): Promise<CreateCategoryState> {
  console.log('🚀 updateCategoryAction started');
  
  try {
    const categoryId = formData.get('categoryId') as string;
    const name = formData.get('name') as string;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    console.log('📝 Form data received:', {
      categoryId,
      name,
      imageFile: imageFile ? `File: ${imageFile.name}, Size: ${imageFile.size} bytes` : 'No file',
      removeImage
    });

    // Validate input
    if (!categoryId) {
      console.log('❌ Validation failed: Category ID is required');
      return { error: 'Category ID is required' };
    }

    if (!name || name.trim() === '') {
      console.log('❌ Validation failed: Category name is required');
      return { error: 'Category name is required' };
    }

    if (name.length < 2) {
      console.log('❌ Validation failed: Category name too short');
      return { error: 'Category name must be at least 2 characters long' };
    }

    // Get current category
    console.log('🔍 Fetching current category...');
    const currentCategory = await getCategoryById(categoryId);
    console.log('📋 Current category:', currentCategory);
    
    if (!currentCategory) {
      console.log('❌ Category not found for ID:', categoryId);
      return { error: 'Category not found' };
    }

    let imageUrl: string | undefined = currentCategory.image;
    console.log('🖼️ Current image URL:', imageUrl);

    // Handle image removal
    if (removeImage && currentCategory.image) {
      console.log('🗑️ Removing existing image...');
      try {
        const fileId = extractFileIdFromUrl(currentCategory.image);
        console.log('📁 File ID to delete:', fileId);
        
        if (fileId) {
          await deleteImage(fileId);
          console.log('✅ Old image deleted successfully');
        }
        imageUrl = undefined;
        console.log('🖼️ Image URL set to undefined');
      } catch (error) {
        console.error('❌ Error removing image:', error);
      }
    }

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      console.log('📤 New image upload detected');
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        console.log('❌ Invalid file type:', imageFile.type);
        return {
          error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images only.'
        };
      }

      // Validate file size (5MB max)
      const maxSize = 10 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        console.log('❌ File too large:', imageFile.size, 'bytes');
        return {
          error: 'Image size too large. Please upload images smaller than 5MB.'
        };
      }

      try {
        // Delete old image if exists
        if (currentCategory.image) {
          console.log('🗑️ Deleting old image before upload...');
          const oldFileId = extractFileIdFromUrl(currentCategory.image);
          if (oldFileId) {
            await deleteImage(oldFileId);
            console.log('✅ Old image deleted');
          }
        }

        // Upload new image
        console.log('⬆️ Uploading new image...');
        imageUrl = await uploadImage(imageFile);
        console.log('✅ New image uploaded, URL:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Error uploading image:', uploadError);
        return {
          error: 'Failed to upload image. Please try again.'
        };
      }
    } else {
      console.log('📷 No new image to upload');
    }

    // Prepare updates
    const updates: { name: string; image?: string } = {
      name: name.trim()
    };

    if (imageUrl !== undefined) {
      updates.image = imageUrl;
    }

    console.log('📝 Updates to apply:', updates);

    // Update category
    console.log('🔄 Updating category in database...');
    await updateCategory(categoryId, updates);
    console.log('✅ Category updated successfully');

    // Revalidate the cache
    console.log('🔄 Revalidating cache...');
    revalidatePath('/');
    revalidatePath('/dashboard/categories');
    
    console.log('🎉 Update completed successfully');
    return {
      success: true,
      message: `Category "${name}" updated successfully!`
    };

  } catch (error: any) {
    console.error('❌ Error in updateCategoryAction:', error);
    console.error('📄 Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    return {
      error: error.message || 'Failed to update category'
    };
  }
}

export async function deleteCategoryAction(categoryId: string, imageUrl?: string): Promise<{ success?: boolean; error?: string }> {
  try {
    // Extract file ID from image URL to delete from storage
    if (imageUrl) {
      try {
        const fileId = extractFileIdFromUrl(imageUrl);
        if (fileId) {
          await deleteImage(fileId);
        }
      } catch (imageError) {
        console.error('Error deleting category image:', imageError);
      }
    }

    await deleteCategory(categoryId);
    revalidatePath('/');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return {
      error: error.message || 'Failed to delete category'
    };
  }
}

// Helper function to extract file ID from Appwrite image URL
function extractFileIdFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileId = pathParts[pathParts.length - 2];
    return fileId || null;
  } catch {
    return null;
  }
}



// Add this to your existing actions/category-actions.ts file
export async function getCategoryByIdFormattedAction(categoryId: string) {
  return await getCategoryByIdFormatted(categoryId);
}





// data/posts.
// data/posts.ts










export async function getPostsByCategory(categoryName: string) {
  console.log('🔍 getPostsByCategory called with:', categoryName);
  
  try {
    // Check environment variables
    console.log('📋 Environment check:', {
      databaseId: process.env.NEXT_PRIVATE_DATABASE_ID ? '✅ Set' : '❌ Missing',
      postCollectionId: process.env.NEXT_PRIVATE_POST_COLLECTION_ID ? '✅ Set' : '❌ Missing',
      categoryCollectionId: process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID ? '✅ Set' : '❌ Missing'
    });

    if (!process.env.NEXT_PRIVATE_DATABASE_ID || !process.env.NEXT_PRIVATE_POST_COLLECTION_ID) {
      console.error('❌ Missing required environment variables');
      return [];
    }

    console.log('🚀 Fetching posts for category:', categoryName);
    
    // First, let's get ALL posts to see what we have
    const allPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );

    console.log('📊 ALL POSTS IN DATABASE:', {
      totalPosts: allPosts.documents.length,
      posts: allPosts.documents.map(post => ({
        id: post.$id,
        title: post.title,
        category_name: post.category_name,
        status: post.status,
        slug: post.slug
      }))
    });

    // Now get posts for this specific category
    const categoryPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID,
      [
        Query.equal('category_name', categoryName),
        Query.equal('status', 'published'),
        Query.orderDesc('$createdAt')
      ]
    );

    console.log('🎯 POSTS FOR CATEGORY:', {
      categoryName,
      found: categoryPosts.documents.length,
      posts: categoryPosts.documents.map(post => ({
        id: post.$id,
        title: post.title,
        status: post.status
      }))
    });

    return categoryPosts.documents;
  } catch (error: any) {
    console.error('❌ Error in getPostsByCategory:', {
      message: error.message,
      code: error.code,
      type: error.type
    });
    return [];
  }
}