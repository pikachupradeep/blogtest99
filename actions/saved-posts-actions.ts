// actions/saved-posts-actions.ts

'use server';

import { ID, Query } from 'node-appwrite';
import { databases } from '@/lib/appwrite-server';

// Define the SavedPost interface
export interface SavedPost {
  $id: string;
  postId: string;
  userId: string;
  $createdAt: string;
  $updatedAt?: string;
}

export interface SavedPostWithDetails extends SavedPost {
  post?: {
    $id: string;
    title: string;
    description: string;
    slug: string;
    content: string;
    thumbnail?: string;
    views: number;
    $createdAt: string;
    profile_id: string;
    category_id: string;
    author?: {
      name: string;
      image?: string;
      id: string;
    };
    category?: {
      name: string;
      id: string;
    };
    likeCount?: number;
  };
}

export async function savePost(postId: string): Promise<{
  success: boolean;
  message: string;
  savedPost?: SavedPost;
}> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return { 
        success: false, 
        message: 'Please log in to save posts' 
      };
    }

    if (!postId) {
      return { 
        success: false, 
        message: 'Post ID is required' 
      };
    }

    // Check if post is already saved
    const existingSave = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      [
        Query.equal('postId', postId),
        Query.equal('userId', userId)
      ]
    );

    if (existingSave.total > 0) {
      return { 
        success: false, 
        message: 'Post is already saved' 
      };
    }

    const savedPost = await databases.createDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      ID.unique(),
      {
        postId,
        userId
      }
    );

    return {
      success: true,
      message: 'Post saved successfully',
      savedPost: savedPost as unknown as SavedPost
    };

  } catch (error: any) {
    console.error('Error saving post:', error);
    return {
      success: false,
      message: 'Failed to save post'
    };
  }
}

export async function unsavePost(postId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return { 
        success: false, 
        message: 'Please log in to unsave posts' 
      };
    }

    // Find the saved post
    const savedPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      [
        Query.equal('postId', postId),
        Query.equal('userId', userId)
      ]
    );

    if (savedPosts.total === 0) {
      return { 
        success: false, 
        message: 'Post is not saved' 
      };
    }

    await databases.deleteDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      savedPosts.documents[0].$id
    );

    return {
      success: true,
      message: 'Post unsaved successfully'
    };

  } catch (error: any) {
    console.error('Error unsaving post:', error);
    return {
      success: false,
      message: 'Failed to unsave post'
    };
  }
}

export async function isPostSaved(postId: string): Promise<{
  success: boolean;
  isSaved: boolean;
  savedPostId?: string;
}> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return { 
        success: true, 
        isSaved: false 
      };
    }

    const savedPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      [
        Query.equal('postId', postId),
        Query.equal('userId', userId)
      ]
    );

    return {
      success: true,
      isSaved: savedPosts.total > 0,
      savedPostId: savedPosts.documents[0]?.$id
    };

  } catch (error: any) {
    console.error('Error checking if post is saved:', error);
    return {
      success: false,
      isSaved: false
    };
  }
}

export async function getSavedPosts(): Promise<{
  success: boolean;
  savedPosts: SavedPostWithDetails[];
  error?: string;
}> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return { 
        success: false, 
        savedPosts: [],
        error: 'Please log in to view saved posts' 
      };
    }

    const savedPostsResponse = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Get post details for each saved post with author and category
    const savedPostsWithDetails = await Promise.all(
      savedPostsResponse.documents.map(async (savedPostDoc: any) => {
        const savedPost: SavedPost = {
          $id: savedPostDoc.$id,
          postId: savedPostDoc.postId,
          userId: savedPostDoc.userId,
          $createdAt: savedPostDoc.$createdAt,
          $updatedAt: savedPostDoc.$updatedAt
        };

        try {
          const post = await databases.getDocument(
            process.env.NEXT_PRIVATE_DATABASE_ID!,
            process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
            savedPost.postId
          );

          // Fetch author profile
          let author = null;
          try {
            const profile = await databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
              post.profile_id
            );
            author = {
              name: profile.name || 'Unknown Author',
              image: profile.image || '',
              id: profile.author_id || 'unknown'
            };
          } catch (profileError) {
            console.error('Error fetching author profile:', profileError);
            author = {
              name: 'Unknown Author',
              image: '',
              id: 'unknown'
            };
          }

          // Fetch category
          let category = null;
          try {
            const categoryData = await databases.getDocument(
              process.env.NEXT_PRIVATE_DATABASE_ID!,
              process.env.NEXT_PRIVATE_CATEGORY_COLLECTION_ID!,
              post.category_id
            );
            category = {
              name: categoryData.name || 'Uncategorized',
              id: categoryData.$id || 'unknown'
            };
          } catch (categoryError) {
            console.error('Error fetching category:', categoryError);
            category = {
              name: 'Uncategorized',
              id: 'unknown'
            };
          }

          const savedPostWithDetails: SavedPostWithDetails = {
            ...savedPost,
            post: {
              $id: post.$id,
              title: post.title,
              description: post.description,
              slug: post.slug,
              content: post.content,
              thumbnail: post.thumbnail,
              views: post.views || 0,
              $createdAt: post.$createdAt,
              profile_id: post.profile_id,
              category_id: post.category_id,
              author,
              category
            }
          };

          return savedPostWithDetails;
        } catch (error) {
          console.error('Error fetching post details:', error);
          const savedPostWithDetails: SavedPostWithDetails = {
            ...savedPost,
            post: undefined
          };
          return savedPostWithDetails;
        }
      })
    );

    return {
      success: true,
      savedPosts: savedPostsWithDetails
    };

  } catch (error: any) {
    console.error('Error fetching saved posts:', error);
    return {
      success: false,
      savedPosts: [],
      error: error.message
    };
  }
}

export async function getSavedPostsCount(): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;

    if (!userId) {
      return { 
        success: true, 
        count: 0 
      };
    }

    const savedPosts = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_SAVEDPOST_COLLECTION!,
      [
        Query.equal('userId', userId)
      ]
    );

    return {
      success: true,
      count: savedPosts.total
    };

  } catch (error: any) {
    console.error('Error fetching saved posts count:', error);
    return {
      success: false,
      count: 0
    };
  }
}