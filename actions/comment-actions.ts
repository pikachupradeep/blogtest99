//actions/comment-actions.ts


'use server';

import { ID, Query } from 'node-appwrite';
import { databases } from '@/lib/appwrite-server';

// Simple getUserId function
async function getUserId(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user-id');
    return userIdCookie?.value || null;
  } catch (error) {
    return null;
  }
}

export interface Comment {
  $id: string;
  postId: string;
  userId: string;
  content: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment?: Comment;
  error?: string;
}

export interface GetCommentsResponse {
  success: boolean;
  comments: Comment[];
  error?: string;
}

// Since collection has required attributes, we need to include them
const COMMENT_ATTRIBUTES = {
  postId: 'postId',
  userId: 'userId', 
  content: 'content',
  createdAt: 'createdAt' // Required by your collection
};

export async function createComment(postId: string, content: string): Promise<CreateCommentResponse> {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return { 
        success: false, 
        message: 'Please log in to comment' 
      };
    }

    if (!content.trim()) {
      return { 
        success: false, 
        message: 'Comment content cannot be empty' 
      };
    }

    if (!postId) {
      return { 
        success: false, 
        message: 'Post ID is required' 
      };
    }

    // Create comment with ALL required attributes
    const commentData = {
      [COMMENT_ATTRIBUTES.postId]: postId,
      [COMMENT_ATTRIBUTES.userId]: userId,
      [COMMENT_ATTRIBUTES.content]: content.trim(),
      [COMMENT_ATTRIBUTES.createdAt]: new Date().toISOString() // Add required createdAt
    };

    console.log('Creating comment with required attributes:', commentData);

    const comment = await databases.createDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!, // 691c0aa50018bb2b9da0
      ID.unique(),
      commentData
    );

    console.log('✅ Comment created successfully!');

    return {
      success: true,
      message: 'Comment added successfully',
      comment: comment as unknown as Comment
    };

  } catch (error: any) {
    console.error('Error creating comment:', error);
    
    // More specific error handling
    if (error.message?.includes('Missing required attribute')) {
      const missingAttr = error.message.match(/"([^"]+)"/)?.[1];
      return {
        success: false,
        message: `Configuration error: Missing required attribute "${missingAttr}"`,
        error: error.message
      };
    }
    
    return {
      success: false,
      message: 'Failed to add comment',
      error: error.message
    };
  }
}

export async function getCommentsByPostId(postId: string): Promise<GetCommentsResponse> {
  try {
    if (!postId) {
      return { 
        success: false, 
        comments: [],
        error: 'Post ID is required'
      };
    }

    // Try to query with the standard attribute name
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
        [
          Query.equal(COMMENT_ATTRIBUTES.postId, postId),
          Query.orderAsc('$createdAt')
        ]
      );

      return {
        success: true,
        comments: response.documents as unknown as Comment[]
      };
    } catch (queryError: any) {
      // If query fails (schema not created yet or wrong attribute), return empty array
      console.log('No comments found or query issue:', queryError.message);
      return {
        success: true,
        comments: []
      };
    }

  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return {
      success: false,
      comments: [],
      error: error.message
    };
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return { 
        success: false, 
        message: 'Please log in to delete comment' 
      };
    }

    // Get the comment first to check ownership
    const comment = await databases.getDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      commentId
    );

    // Check if user owns this comment
    if (comment[COMMENT_ATTRIBUTES.userId] !== userId) {
      return { 
        success: false, 
        message: 'You can only delete your own comments' 
      };
    }

    await databases.deleteDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      commentId
    );

    return {
      success: true,
      message: 'Comment deleted successfully'
    };

  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      message: 'Failed to delete comment'
    };
  }
}

export async function getCommentCount(postId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!postId) {
      return { success: false, count: 0, error: 'Post ID is required' };
    }

    // Try to get count with standard attribute
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
        [Query.equal(COMMENT_ATTRIBUTES.postId, postId)]
      );

      return {
        success: true,
        count: response.total
      };
    } catch (queryError: any) {
      // If query fails, return 0
      console.log('Comment count query failed:', queryError.message);
      return {
        success: true,
        count: 0
      };
    }

  } catch (error: any) {
    console.error('Error getting comment count:', error);
    return {
      success: false,
      count: 0,
      error: error.message
    };
  }
}

// Debug function to check collection requirements
export async function debugCollectionRequirements(): Promise<{ success: boolean; requirements?: any; error?: string }> {
  try {
    // Try to create a test document to see what's required
    const testData = {
      postId: 'test-post-id',
      userId: 'test-user-id', 
      content: 'test content',
      createdAt: new Date().toISOString()
    };

    const testComment = await databases.createDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      ID.unique(),
      testData
    );

    // Delete the test document
    await databases.deleteDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      testComment.$id
    );

    return {
      success: true,
      requirements: {
        requiredAttributes: ['postId', 'userId', 'content', 'createdAt'],
        testPassed: true
      }
    };

  } catch (error: any) {
    console.error('Debug requirements error:', error);
    
    // Parse the error to find missing requirements
    const missingMatch = error.message?.match(/"([^"]+)"/);
    const missingAttribute = missingMatch ? missingMatch[1] : 'unknown';
    
    return {
      success: false,
      requirements: {
        missingAttribute,
        error: error.message
      },
      error: `Missing required attribute: ${missingAttribute}`
    };
  }
}






/// get commenter name and profile image  

// Add this function to your comment-actions.ts
export interface CommentWithAuthor extends Comment {
  author?: {
    name: string;
    image?: string;
  };
}

export async function getCommentsWithAuthors(postId: string): Promise<{ success: boolean; comments: CommentWithAuthor[]; error?: string }> {
  try {
    if (!postId) {
      return { 
        success: false, 
        comments: [],
        error: 'Post ID is required'
      };
    }

    // Get comments
    const commentsResult = await getCommentsByPostId(postId);
    if (!commentsResult.success) {
      return {
        success: false,
        comments: [],
        error: commentsResult.error
      };
    }

    // Get author details for each comment
    const commentsWithAuthors = await Promise.all(
      commentsResult.comments.map(async (comment) => {
        try {
          const author = await getProfileByUserId(comment.userId);
          return {
            ...comment,
            author: author.success ? {
              name: author.data?.name || 'Anonymous',
              image: author.data?.image
            } : {
              name: 'Anonymous',
              image: undefined
            }
          };
        } catch (error) {
          console.error('Error fetching author for comment:', error);
          return {
            ...comment,
            author: {
              name: 'Anonymous',
              image: undefined
            }
          };
        }
      })
    );

    return {
      success: true,
      comments: commentsWithAuthors
    };
  } catch (error: any) {
    console.error('Error getting comments with authors:', error);
    return {
      success: false,
      comments: [],
      error: error.message
    };
  }
}

// Helper function to get profile by user ID
async function getProfileByUserId(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { databases } = await import('@/lib/appwrite-server');
    const { Query } = await import('node-appwrite');

    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [Query.equal('author_id', userId)]
    );

    if (response.documents.length === 0) {
      return { success: false, error: 'Profile not found' };
    }

    return {
      success: true,
      data: response.documents[0]
    };
  } catch (error: any) {
    console.error('Error getting profile by user ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
}































































// Add these to your existing actions/comment-actions.ts

// Admin Comment Management Functions
export interface AdminComment {
  $id: string;
  content: string;
  $createdAt: string;
  $updatedAt: string;
  postId: string;
  userId: string;
  author?: {
    name: string;
    email: string;
    image?: string;
  };
  post?: {
    title: string;
    slug: string;
  };
}

export interface AdminUser {
  $id: string;
  name: string;
  email: string;
  image?: string;
  $createdAt: string;
  commentsCount: number;
}

export async function getAllCommentsWithUsers(): Promise<{
  success: boolean;
  comments: AdminComment[];
  error?: string;
}> {
  try {
    // Get all comments
    const commentsResponse = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(1000) // Adjust limit as needed
      ]
    );

    const comments = commentsResponse.documents as unknown as AdminComment[];

    // Get user details for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        try {
          const user = await getUserById(comment.userId);
          const post = await getPostById(comment.postId);
          
          return {
            ...comment,
            author: user.success ? {
              name: user.data?.name || 'Unknown User',
              email: user.data?.email || 'No email',
              image: user.data?.image
            } : {
              name: 'Unknown User',
              email: 'No email',
              image: undefined
            },
            post: post.success ? {
              title: post.data?.title || 'Unknown Post',
              slug: post.data?.slug || ''
            } : {
              title: 'Unknown Post',
              slug: ''
            }
          };
        } catch (error) {
          console.error('Error fetching user/post for comment:', error);
          return {
            ...comment,
            author: {
              name: 'Unknown User',
              email: 'No email',
              image: undefined
            },
            post: {
              title: 'Unknown Post',
              slug: ''
            }
          };
        }
      })
    );

    return {
      success: true,
      comments: commentsWithUsers
    };
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return {
      success: false,
      comments: [],
      error: error.message
    };
  }
}

export async function getAllUsersWithCommentCounts(): Promise<{
  success: boolean;
  users: AdminUser[];
  error?: string;
}> {
  try {
    // Get all users from the profile collection
    const usersResponse = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(1000)
      ]
    );

    // Get comment counts for each user
    const usersWithCounts = await Promise.all(
      usersResponse.documents.map(async (userDoc) => {
        try {
          const commentsResponse = await databases.listDocuments(
            process.env.NEXT_PRIVATE_DATABASE_ID!,
            process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
            [Query.equal('userId', userDoc.author_id)]
          );

          return {
            $id: userDoc.author_id,
            name: userDoc.name || 'Unknown User',
            email: userDoc.email || 'No email',
            image: userDoc.image,
            $createdAt: userDoc.$createdAt,
            commentsCount: commentsResponse.total
          };
        } catch (error) {
          console.error('Error getting comment count for user:', error);
          return {
            $id: userDoc.author_id,
            name: userDoc.name || 'Unknown User',
            email: userDoc.email || 'No email',
            image: userDoc.image,
            $createdAt: userDoc.$createdAt,
            commentsCount: 0
          };
        }
      })
    );

    return {
      success: true,
      users: usersWithCounts
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      users: [],
      error: error.message
    };
  }
}

export async function updateComment(commentId: string, content: string): Promise<{
  success: boolean;
  message: string;
  comment?: Comment;
}> {
  try {
    if (!content.trim()) {
      return {
        success: false,
        message: 'Comment content cannot be empty'
      };
    }

    const updatedComment = await databases.updateDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      commentId,
      {
        [COMMENT_ATTRIBUTES.content]: content.trim(),
        updatedAt: new Date().toISOString()
      }
    );

    return {
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment as unknown as Comment
    };
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return {
      success: false,
      message: 'Failed to update comment'
    };
  }
}

export async function adminDeleteComment(commentId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await databases.deleteDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_COMMENT_COLLECTION!,
      commentId
    );

    return {
      success: true,
      message: 'Comment deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      message: 'Failed to delete comment'
    };
  }
}

// Helper function to get user by ID
async function getUserById(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [Query.equal('author_id', userId)]
    );

    if (response.documents.length === 0) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      data: response.documents[0]
    };
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get post by ID
async function getPostById(postId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_POST_COLLECTION_ID!,
      [Query.equal('$id', postId)]
    );

    if (response.documents.length === 0) {
      return { success: false, error: 'Post not found' };
    }

    return {
      success: true,
      data: response.documents[0]
    };
  } catch (error: any) {
    console.error('Error getting post by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
}