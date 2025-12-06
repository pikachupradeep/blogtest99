'use server';

import { Account, Client, Databases, ID, Query, Storage } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Initialize Appwrite client for server-side operations
function getAppwriteServerClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);
  return client;
}

// Utility function to get user ID from session
async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    
    const sessionCookie = cookieStore.get(`a_session_${projectId}`);
    
    if (!sessionCookie?.value) {
      const userIdCookie = cookieStore.get('user-id');
      return userIdCookie?.value || null;
    }

    const sessionClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(sessionCookie.value);

    const account = new Account(sessionClient);
    const user = await account.get();
    return user.$id;
  } catch (error) {
    try {
      const cookieStore = await cookies();
      const userIdCookie = cookieStore.get('user-id');
      return userIdCookie?.value || null;
    } catch {
      return null;
    }
  }
}

// Helper function to check if user is admin - FIXED VERSION
async function checkAdminAccess(userId: string): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    // Check if admin collection is configured - FIXED: Use consistent variable name
    const adminCollectionId = process.env.NEXT_PRIVATE_ADMIN_COLLECTION_ID || process.env.NEXT_PRIVATE_ADMIN_COLLECTION;
    
    if (!adminCollectionId) {
      return { isAdmin: false, error: 'Admin collection not configured' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    try {
      // Try to find user in admin collection using multiple possible field names
      const fieldNames = ['userId', 'user_id', 'author_id', 'userID', 'uid', 'id', 'email'];
      
      for (const field of fieldNames) {
        try {
          const adminUsers = await databases.listDocuments(
            process.env.NEXT_PRIVATE_DATABASE_ID!,
            adminCollectionId,
            [Query.equal(field, userId)]
          );
          
          if (adminUsers.total > 0) {
            return { isAdmin: true };
          }
        } catch (fieldError) {
          // This field doesn't exist in the collection, try next one
          continue;
        }
      }
      
      // If no exact match found, try to list all admin users and check manually
      try {
        const allAdmins = await databases.listDocuments(
          process.env.NEXT_PRIVATE_DATABASE_ID!,
          adminCollectionId,
          [Query.limit(50)]
        );
        
        // Check if user ID exists in any field of any admin document
        for (const adminDoc of allAdmins.documents) {
          const docString = JSON.stringify(adminDoc).toLowerCase();
          if (docString.includes(userId.toLowerCase())) {
            return { isAdmin: true };
          }
        }
      } catch (listError) {
        // Silent fail
      }

      return { 
        isAdmin: false, 
        error: 'User is not authorized as admin. Contact administrator to be added to admin collection.' 
      };

    } catch (collectionError: any) {
      return { 
        isAdmin: false, 
        error: `Cannot access admin collection. Make sure it exists and has proper permissions.` 
      };
    }

  } catch (error: any) {
    return { 
      isAdmin: false, 
      error: `Admin check failed: ${error.message}` 
    };
  }
}

// Get user's profile to link with post
async function getUserProfile() {
  try {
    const author_id = await getUserId();
    if (!author_id) {
      return { success: false, message: 'No active session' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [Query.equal('author_id', author_id)]
    );

    if (response.documents.length === 0) {
      return { success: false, message: 'Please create a profile first' };
    }

    return { success: true, data: response.documents[0] };
  } catch (error) {
    return { success: false, message: 'Failed to get profile' };
  }
}

// Interface for create post state
interface CreatePostState {
  success?: boolean;
  error?: string;
  message?: string;
  postId?: string;
}

// Interface for update post state
interface UpdatePostState {
  success?: boolean;
  error?: string;
  message?: string;
}

// Upload image to Appwrite storage
export async function uploadImage(file: File): Promise<string> {
  try {
    const client = getAppwriteServerClient();
    const storage = new Storage(client);

    const uploadedFile = await storage.createFile(
      process.env.NEXT_PUBLIC_BUCKET_ID!,
      ID.unique(),
      file
    );

    // Generate the proper image URL format
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const bucketId = process.env.NEXT_PUBLIC_BUCKET_ID!;
    
    const imageUrl = `${endpoint}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`;
    
    return imageUrl;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
}

// Upload multiple images and return array of URLs
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      const imageUrl = await uploadImage(file);
      uploadedUrls.push(imageUrl);
    } catch (error) {
      throw new Error(`Failed to upload image: ${file.name}`);
    }
  }
  
  return uploadedUrls;
}

// Helper function to extract image URLs from HTML content
function extractImageUrlsFromHtml(html: string): string[] {
  const imageUrls: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // Only include Appwrite storage URLs (not base64 or external URLs)
    if (src.includes('/storage/buckets/') && src.includes('/view?project=')) {
      imageUrls.push(src);
    }
  }
  
  return imageUrls;
}

// Enhanced function to update post status (for both authors and admins)
export async function updatePostStatusAction(
  postId: string, 
  status: 'pending' | 'published' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'You must be logged in to update post status' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // First, verify the post exists
    let post;
    try {
      post = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
        postId
      );
    } catch (error) {
      return { success: false, error: 'Post not found' };
    }

    // Check if user is admin OR the post author
    const adminCheck = await checkAdminAccess(userId);
    const isAuthor = post.author_id === userId;
    
    if (!adminCheck.isAdmin && !isAuthor) {
      return { success: false, error: 'You can only update your own posts' };
    }

    // Update the post status
    await databases.updateDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      postId,
      {
        status: status
      }
    );

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/dashboard/posts');
    revalidatePath('/admin/posts');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update post status' };
  }
}

// Main create post action
export async function createPostAction(
  prevState: CreatePostState, 
  formData: FormData
): Promise<CreatePostState> {
  try {
    // Get user's profile first
    const profileResult = await getUserProfile();
    if (!profileResult.success || !profileResult.data) {
      return {
        error: profileResult.message || 'Please create a profile before posting'
      };
    }

    const profile = profileResult.data;

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const category_id = formData.get('category_id') as string;
    const slug = formData.get('slug') as string;
    const bg_image = formData.getAll('bg_image') as File[];
    const thumbnail = formData.get('thumbnail') as File;

    // Validate required fields
    if (!title?.trim()) {
      return { error: 'Title is required' };
    }

    if (!description?.trim()) {
      return { error: 'Description is required' };
    }

    if (!content?.trim()) {
      return { error: 'Content is required' };
    }

    if (!category_id) {
      return { error: 'Category is required' };
    }

    if (!slug?.trim()) {
      return { error: 'Slug is required' };
    }

    // Validate slug format (alphanumeric and hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return { error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
    }

    // Check if slug already exists
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const existingPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [Query.equal('slug', slug)]
    );

    if (existingPosts.documents.length > 0) {
      return { error: 'Slug already exists. Please choose a different one.' };
    }

    // Verify category exists
    let category;
    try {
      category = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
        category_id
      );
    } catch (error) {
      return { error: 'Selected category does not exist' };
    }

    // Extract image URLs from content (images uploaded via Tiptap editor)
    const imageUrlsFromContent = extractImageUrlsFromHtml(content);

    // Upload images if provided via form (thumbnail and any additional bg_images)
    let bg_image_urls: string[] = [...imageUrlsFromContent]; // Start with images from editor
    let thumbnail_url = null;

    // Upload multiple background images from form (if any)
    if (bg_image.length > 0) {
      try {
        const uploadedBgImages = await uploadMultipleImages(bg_image);
        bg_image_urls = [...bg_image_urls, ...uploadedBgImages];
      } catch (error: any) {
        return { error: `Failed to upload background images: ${error.message}` };
      }
    }

    if (thumbnail && thumbnail.size > 0) {
      try {
        thumbnail_url = await uploadImage(thumbnail);
      } catch (error: any) {
        return { error: `Failed to upload thumbnail: ${error.message}` };
      }
    }

    // Create post data
    const postData: any = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      slug: slug.trim(),
      category_id: category_id,
      category_name: category.name,
      profile_id: profile.$id,
      author_id: profile.author_id,
      status: 'pending', // Auto-generated as 'pending' by default
      views: 0, // Initialize views count
    };

    // Add image URLs if they exist
    if (bg_image_urls.length > 0) {
      postData.bg_image = bg_image_urls; // Array of image URLs (from editor + form)
    }

    if (thumbnail_url) {
      postData.thumbnail = thumbnail_url;
    }

    // Create the post
    const post = await databases.createDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      ID.unique(),
      postData
    );

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/authDashboard/posts');
    revalidatePath(`/blog/${slug}`);

    return {
      success: true,
      message: 'Post created successfully! It is now pending approval.',
      postId: post.$id
    };

  } catch (error: any) {
    return {
      error: error.message || 'Failed to create post'
    };
  }
}

// Get single post by ID with author, category information
export async function getPostBySlugAction(slug: string) {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [Query.equal('slug', slug)]
    );

    if (posts.documents.length === 0) {
      return { success: false, message: 'Post not found' };
    }

    const post = posts.documents[0];

    // Fetch author profile and category details
    const [profile, category] = await Promise.all([
      databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
        post.profile_id
      ),
      databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
        post.category_id
      )
    ]);

    const postWithDetails = {
      ...post,
      author: {
        name: profile.name,
        image: profile.image,
        id: profile.author_id,
        bio: profile.bio
      },
      category: {
        name: category.name,
        id: category.$id
      },
      views: post.views || 0,
      status: post.status || 'pending'
    };

    return { success: true, data: postWithDetails };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to get post' };
  }
}

// UPDATE POST ACTION - FIXED VERSION WITH ADMIN ACCESS
export async function updatePostAction(
  prevState: UpdatePostState, 
  formData: FormData
): Promise<UpdatePostState> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: 'You must be logged in to update posts' };
    }

    const postId = formData.get('postId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const category_id = formData.get('category_id') as string;
    const slug = formData.get('slug') as string;
    const thumbnail = formData.get('thumbnail') as File;

    // Validate required fields
    if (!postId) {
      return { error: 'Post ID is required' };
    }

    if (!title?.trim()) {
      return { error: 'Title is required' };
    }

    if (!description?.trim()) {
      return { error: 'Description is required' };
    }

    if (!content?.trim()) {
      return { error: 'Content is required' };
    }

    if (!category_id) {
      return { error: 'Category is required' };
    }

    if (!slug?.trim()) {
      return { error: 'Slug is required' };
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return { error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Verify the post exists
    let existingPost;
    try {
      existingPost = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
        postId
      );
    } catch (error) {
      return { error: 'Post not found' };
    }

    // Check if user is admin OR the post author
    const adminCheck = await checkAdminAccess(userId);
    const isAuthor = existingPost.author_id === userId;
    
    if (!adminCheck.isAdmin && !isAuthor) {
      return { error: 'You can only update your own posts' };
    }

    // Check if slug already exists (excluding current post)
    if (slug !== existingPost.slug) {
      const existingPosts = await databases.listDocuments(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
        [Query.equal('slug', slug)]
      );

      if (existingPosts.documents.length > 0) {
        return { error: 'Slug already exists. Please choose a different one.' };
      }
    }

    // Verify category exists
    let category;
    try {
      category = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
        category_id
      );
    } catch (error) {
      return { error: 'Selected category does not exist' };
    }

    // Extract image URLs from content
    const imageUrlsFromContent = extractImageUrlsFromHtml(content);
    let bg_image_urls: string[] = [...imageUrlsFromContent];
    let thumbnail_url = existingPost.thumbnail;

    // Handle new thumbnail upload
    if (thumbnail && thumbnail.size > 0) {
      try {
        thumbnail_url = await uploadImage(thumbnail);
      } catch (error: any) {
        return { error: `Failed to upload thumbnail: ${error.message}` };
      }
    }

    // Update post data - PRESERVE EXISTING STATUS
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      slug: slug.trim(),
      category_id: category_id,
      category_name: category.name,
      // REMOVED: status: 'pending' - This preserves the current status
    };

    // Add image URLs if they exist
    if (bg_image_urls.length > 0) {
      updateData.bg_image = bg_image_urls;
    }

    if (thumbnail_url) {
      updateData.thumbnail = thumbnail_url;
    }

    // Update the post
    await databases.updateDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      postId,
      updateData
    );

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/dashboard/posts');
    revalidatePath(`/blog/${slug}`);

    return {
      success: true,
      message: 'Post updated successfully!'
    };

  } catch (error: any) {
    return {
      error: error.message || 'Failed to update post'
    };
  }
}

// Get post by ID for editing - FIXED WITH ADMIN ACCESS
export async function getPostByIdAction(postId: string) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, message: 'You must be logged in to edit posts' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // First, get the post
    const post = await databases.getDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      postId
    );

    // Check if user is admin OR the post author
    const adminCheck = await checkAdminAccess(userId);
    const isAuthor = post.author_id === userId;
    
    // Allow access if user is admin OR the post author
    if (!adminCheck.isAdmin && !isAuthor) {
      return { success: false, message: 'You can only edit your own posts' };
    }

    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to get post' };
  }
}

// Get current user's posts with full details
export async function getCurrentUserPostsAction() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, message: 'You must be logged in to view your posts' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Get posts by current user's author_id (all statuses)
    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [
        Query.equal('author_id', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Add author and category details to each post
    const postsWithDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          const [profile, category] = await Promise.all([
            databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
              post.profile_id
            ),
            databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
              post.category_id
            )
          ]);

          return {
            ...post,
            author: {
              name: profile.name,
              image: profile.image,
              id: profile.author_id
            },
            category: {
              name: category.name,
              id: category.$id
            },
            views: post.views || 0,
            status: post.status || 'pending'
          };
        } catch (error) {
          return {
            ...post,
            views: post.views || 0,
            status: post.status || 'pending'
          };
        }
      })
    );

    return { 
      success: true, 
      data: postsWithDetails 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to get your posts' 
    };
  }
}

// Get all published posts for public display
export async function getAllPublishedPostsAction() {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Get only published posts, ordered by creation date (newest first)
    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [
        Query.equal('status', 'published'),
        Query.orderDesc('$createdAt')
      ]
    );

    // Add author and category details to each post
    const postsWithDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          let profile: any;
          let category: any;

          // Fetch profile with proper error handling
          try {
            profile = await databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
              post.profile_id
            );
          } catch (error) {
            profile = {
              name: 'Unknown Author',
              image: '',
              author_id: 'unknown',
              $id: 'unknown'
            };
          }

          // Fetch category with proper error handling
          try {
            category = await databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
              post.category_id
            );
          } catch (error) {
            category = {
              name: 'Uncategorized',
              $id: 'unknown'
            };
          }

          return {
            ...post,
            author: {
              name: profile.name || 'Unknown Author',
              image: profile.image || '',
              id: profile.author_id || 'unknown'
            },
            category: {
              name: category.name || 'Uncategorized',
              id: category.$id || 'unknown'
            },
            views: post.views || 0,
            status: post.status || 'published'
          };
        } catch (error) {
          return {
            ...post,
            author: {
              name: 'Unknown Author',
              image: '',
              id: 'unknown'
            },
            category: {
              name: 'Uncategorized',
              id: 'unknown'
            },
            views: post.views || 0,
            status: post.status || 'published'
          };
        }
      })
    );

    return { 
      success: true, 
      data: postsWithDetails 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to get posts' 
    };
  }
}

// Get all posts for admin dashboard (all statuses) - FIXED VERSION
export async function getAllPostsForAdminAction() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return { 
        success: false, 
        message: 'You must be logged in to access admin dashboard' 
      };
    }

    // Check if user is admin
    const adminCheck = await checkAdminAccess(userId);
    
    if (!adminCheck.isAdmin) {
      return { 
        success: false, 
        message: adminCheck.error || 'Admin access required. You do not have permission to view this page.' 
      };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Get ALL posts regardless of status, ordered by creation date (newest first)
    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')] // No status filter
    );

    // Add author, category, and profile details to each post
    const postsWithDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          let profile: any = {
            name: 'Unknown Author',
            image: '',
            author_id: 'unknown',
            $id: 'unknown'
          };
          
          let category: any = {
            name: 'Uncategorized',
            $id: 'unknown'
          };

          // Fetch profile if profile_id exists
          if (post.profile_id && post.profile_id !== 'unknown') {
            try {
              const profileDoc = await databases.getDocument(
                process.env.NEXT_PRIVATE_DATABASE_ID!,
                process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
                post.profile_id
              );
              profile = profileDoc;
            } catch (error) {
              // Silent fail
            }
          }

          // Fetch category if category_id exists
          if (post.category_id && post.category_id !== 'unknown') {
            try {
              const categoryDoc = await databases.getDocument(
                process.env.NEXT_PRIVATE_DATABASE_ID!,
                process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
                post.category_id
              );
              category = categoryDoc;
            } catch (error) {
              // Silent fail
            }
          }

          return {
            $id: post.$id,
            title: post.title || 'Untitled Post',
            slug: post.slug || 'no-slug',
            status: post.status || 'pending',
            views: post.views || 0,
            $createdAt: post.$createdAt,
            author: {
              name: profile.name || 'Unknown Author',
              id: profile.author_id || 'unknown'
            },
            category: {
              name: category.name || 'Uncategorized',
              id: category.$id || 'unknown'
            }
          };
        } catch (error) {
          return {
            $id: post.$id,
            title: post.title || 'Untitled Post',
            slug: post.slug || 'no-slug',
            status: post.status || 'pending',
            views: post.views || 0,
            $createdAt: post.$createdAt,
            author: {
              name: 'Unknown Author',
              id: 'unknown'
            },
            category: {
              name: 'Uncategorized',
              id: 'unknown'
            }
          };
        }
      })
    );
    
    return { 
      success: true, 
      data: postsWithDetails 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to get posts for admin' 
    };
  }
}

// Track post views
export async function incrementPostViewsAction(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // First, get the current post to find its ID and current view count
    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [Query.equal('slug', slug)]
    );

    if (posts.documents.length === 0) {
      return { success: false, error: 'Post not found' };
    }

    const post = posts.documents[0];
    const currentViews = post.views || 0;

    // Increment the view count
    await databases.updateDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      post.$id,
      {
        views: currentViews + 1
      }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to increment views' };
  }
}

// Like/Unlike a post
export async function toggleLikeAction(postId: string): Promise<{ success: boolean; error?: string; liked?: boolean }> {
  try {
    // Check if likes collection is configured
    if (!process.env.NEXT_PRIVATE_LIKES_COLLECTION) {
      return { success: false, error: 'Likes feature is not configured' };
    }

    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'You must be logged in to like posts' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Check if user already liked this post
    const existingLikes = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_LIKES_COLLECTION!,
      [
        Query.equal('post_id', postId),
        Query.equal('user_id', userId)
      ]
    );

    if (existingLikes.documents.length > 0) {
      // Unlike - remove the like
      await databases.deleteDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_LIKES_COLLECTION!,
        existingLikes.documents[0].$id
      );
      
      return { success: true, liked: false };
    } else {
      // Like - create new like document
      await databases.createDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_LIKES_COLLECTION!,
        ID.unique(),
        {
          post_id: postId,
          user_id: userId
        }
      );
      
      return { success: true, liked: true };
    }

  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle like' };
  }
}

// Get like count for a post
export async function getLikeCountAction(postId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Check if likes collection is configured
    if (!process.env.NEXT_PRIVATE_LIKES_COLLECTION) {
      return { success: false, error: 'Likes feature is not configured' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const likes = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_LIKES_COLLECTION!,
      [Query.equal('post_id', postId)]
    );

    return { success: true, count: likes.total };

  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get like count' };
  }
}

// Check if current user liked a post
export async function checkUserLikedAction(postId: string): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  try {
    // Check if likes collection is configured
    if (!process.env.NEXT_PRIVATE_LIKES_COLLECTION) {
      return { success: false, error: 'Likes feature is not configured' };
    }

    const userId = await getUserId();
    if (!userId) {
      return { success: false, liked: false };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const userLikes = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_LIKES_COLLECTION!,
      [
        Query.equal('post_id', postId),
        Query.equal('user_id', userId)
      ]
    );

    return { success: true, liked: userLikes.total > 0 };

  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to check like status' };
  }
}

// Get like count and user like status in one call
export async function getPostLikesInfoAction(postId: string): Promise<{ 
  success: boolean; 
  likeCount?: number; 
  userLiked?: boolean;
  error?: string 
}> {
  try {
    // Check if likes collection is configured
    if (!process.env.NEXT_PRIVATE_LIKES_COLLECTION) {
      return { success: false, error: 'Likes feature is not configured' };
    }

    const [likeCountResult, userLikedResult] = await Promise.all([
      getLikeCountAction(postId),
      checkUserLikedAction(postId)
    ]);

    if (!likeCountResult.success || !userLikedResult.success) {
      return { success: false, error: 'Failed to get like information' };
    }

    return {
      success: true,
      likeCount: likeCountResult.count,
      userLiked: userLikedResult.liked
    };

  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get like information' };
  }
}

// Delete post action
export async function deletePostAction(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'You must be logged in to delete posts' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // First, verify the post exists and get its details
    let post;
    try {
      post = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
        postId
      );
    } catch (error) {
      return { success: false, error: 'Post not found' };
    }

    // Check if user is admin OR the post author
    const adminCheck = await checkAdminAccess(userId);
    const isAuthor = post.author_id === userId;
    
    if (!adminCheck.isAdmin && !isAuthor) {
      return { success: false, error: 'You can only delete your own posts' };
    }

    // Delete the post
    await databases.deleteDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      postId
    );

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/dashboard/posts');
    revalidatePath('/admin/posts');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete post' };
  }
}

// Get posts by category name
export async function getPostsByCategoryAction(categoryName: string) {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const posts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [
        Query.equal('category_name', categoryName),
        Query.equal('status', 'published'),
        Query.orderDesc('$createdAt')
      ]
    );

    // Add author details to each post
    const postsWithDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          const profile = await databases.getDocument(
            process.env.NEXT_PRIVATE_DATABASE_ID!,
            process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
            post.profile_id
          );

          return {
            ...post,
            author: {
              name: profile.name,
              image: profile.image,
              id: profile.author_id
            },
            views: post.views || 0
          };
        } catch (error) {
          return {
            ...post,
            author: {
              name: 'Unknown Author',
              image: '',
              id: 'unknown'
            },
            views: post.views || 0
          };
        }
      })
    );

    return {
      success: true,
      data: postsWithDetails
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get posts by category'
    };
  }
}

// ADD THIS NEW FUNCTION FOR DEBUGGING
export async function debugAdminAccessAction() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return { 
        success: false, 
        message: 'No user ID found. Please log in first.',
        userId: null,
        isAdmin: false
      };
    }
    
    const adminCheck = await checkAdminAccess(userId);
    
    return { 
      success: true, 
      userId,
      isAdmin: adminCheck.isAdmin,
      error: adminCheck.error,
      envCheck: {
        adminCollectionId: process.env.NEXT_PRIVATE_ADMIN_COLLECTION_ID || process.env.NEXT_PRIVATE_ADMIN_COLLECTION,
        hasAdminCollection: !!(process.env.NEXT_PRIVATE_ADMIN_COLLECTION_ID || process.env.NEXT_PRIVATE_ADMIN_COLLECTION),
        databaseId: process.env.NEXT_PRIVATE_DATABASE_ID
      }
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message,
      isAdmin: false
    };
  }
}









