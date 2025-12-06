
//actions/profile-actions.ts


'use server';

import { cookies } from 'next/headers';
import { Client, Account, Databases, Storage, ID, Query, Users } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { databases } from '@/lib/appwrite-server';

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
    
    // AppWrite session cookie name format
    const sessionCookie = cookieStore.get(`a_session_${projectId}`);
    
    if (!sessionCookie?.value) {
      // Fallback to user-id cookie if session cookie not found
      const userIdCookie = cookieStore.get('user-id');
      return userIdCookie?.value || null;
    }

    // Create a client with session for authentication
    const sessionClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(sessionCookie.value);

    const account = new Account(sessionClient);
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error('Error getting user ID from session:', error);
    // Fallback to user-id cookie
    try {
      const cookieStore = await cookies();
      const userIdCookie = cookieStore.get('user-id');
      return userIdCookie?.value || null;
    } catch {
      return null;
    }
  }
}

// Upload image to Appwrite storage
async function uploadImage(file: File): Promise<string> {
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
    
    return `${endpoint}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

// Delete image from storage
async function deleteImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) return;
    
    const client = getAppwriteServerClient();
    const storage = new Storage(client);
    
    // Extract file ID from image URL
    const fileId = imageUrl.split('/files/')[1]?.split('/view')[0];
    if (fileId) {
      await storage.deleteFile(process.env.NEXT_PUBLIC_BUCKET_ID!, fileId);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export async function createProfile(formData: FormData) {
  try {
    const author_id = await getUserId();
    if (!author_id) {
      return { success: false, message: 'Please log in to create a profile.' };
    }

    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const phone = formData.get('phone') as string;
    const img = formData.get('img') as File;
    const role = (formData.get('role') as string) || 'reader'; // Default to 'reader'

    if (!name?.trim()) {
      return { success: false, message: 'Name is required' };
    }

    // Upload image and get full URL
    let imageUrl = '';
    if (img && img.size > 0) {
      try {
        imageUrl = await uploadImage(img);
      } catch (uploadError) {
        return { success: false, message: 'Failed to upload image. Please try again.' };
      }
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);
    
    // Base profile data
    const profileData: any = {
      name: name.trim(),
      dob: dob || null,
      image: imageUrl,
      author_id: author_id,
      role: role,
    };

    // Only include phone if role is 'writer'
    if (role === 'writer') {
      profileData.phone = phone || null;
    }

    const profile = await databases.createDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      ID.unique(),
      profileData
    );

    // Store user role in cookie
    const cookieStore = await cookies();
    cookieStore.set('user-role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    revalidatePath('/authDashboard/profile');
    
    // ROLE-BASED REDIRECTION LOGIC
    let redirectPath = '/userDashboard/save'; // Default for readers
    
    if (role === 'writer') {
      redirectPath = '/authDashboard/posts';
    }

    console.log('🎯 Profile creation redirection:', { role, redirectPath });

    return { 
      success: true, 
      message: 'Profile created successfully!', 
      data: profile,
      redirectPath: redirectPath
    };

  } catch (error: any) {
    console.error('Error creating profile:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to create profile' 
    };
  }
}

export async function getProfile() {
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
      return { success: true, data: null };
    }

    return { success: true, data: response.documents[0] };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, message: 'Failed to get profile' };
  }
}

export async function updateProfile(profileId: string, formData: FormData) {
  try {
    const author_id = await getUserId();
    if (!author_id) {
      return { success: false, message: 'Please log in to update your profile.' };
    }

    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const phone = formData.get('phone') as string;
    const img = formData.get('img') as File;
    const removeImage = formData.get('removeImage') === 'true';
    const role = (formData.get('role') as string) || 'reader'; // Default to 'reader'

    if (!name?.trim()) {
      return { success: false, message: 'Name is required' };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    let currentProfile;
    try {
      currentProfile = await databases.getDocument(
        process.env.NEXT_PRIVATE_DATABASE_ID!,
        process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
        profileId
      );
      
      if (currentProfile.author_id !== author_id) {
        return { success: false, message: 'You can only update your own profile.' };
      }
    } catch (error) {
      return { success: false, message: 'Profile not found.' };
    }

    let imageUrl = currentProfile.image;

    // Handle image removal
    if (removeImage && currentProfile.image) {
      await deleteImage(currentProfile.image);
      imageUrl = '';
    }

    // Handle new image upload
    if (img && img.size > 0) {
      try {
        // Delete old image if exists
        if (currentProfile.image) {
          await deleteImage(currentProfile.image);
        }
        
        // Upload new image and get full URL
        imageUrl = await uploadImage(img);
      } catch (uploadError) {
        return { success: false, message: 'Failed to upload image. Please try again.' };
      }
    }

    // Base update data
    const updateData: any = {
      name: name.trim(),
      dob: dob || null,
      image: imageUrl,
      role: role,
    };

    // Only include phone if role is 'writer'
    if (role === 'writer') {
      updateData.phone = phone || null;
    } else {
      // Clear phone if role is changed from writer to reader
      updateData.phone = null;
    }

    const updatedProfile = await databases.updateDocument(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      profileId,
      updateData
    );

    // Update user role in cookie if changed
    if (role !== currentProfile.role) {
      const cookieStore = await cookies();
      cookieStore.set('user-role', role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    revalidatePath('/authDashboard/profile');
    
    // ROLE-BASED REDIRECTION LOGIC FOR UPDATE
    let redirectPath = '/userDashboard/save'; // Default for readers
    
    if (role === 'writer') {
      redirectPath = '/authDashboard/posts';
    }

    console.log('🎯 Profile update redirection:', { role, redirectPath });

    return { 
      success: true, 
      message: 'Profile updated successfully!', 
      data: updatedProfile,
      redirectPath: redirectPath
    };

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update profile' 
    };
  }
}

// Utility function to get allowed fields based on role - Made async
export async function getAllowedFields(role: string = 'reader'): Promise<string[]> {
  const baseFields = ['name', 'dob', 'image', 'role'];
  
  if (role === 'writer') {
    return [...baseFields, 'phone'];
  }
  
  return baseFields;
}

// Utility function to validate form data based on role - Made async
export async function validateProfileData(formData: FormData, role: string = 'reader'): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const name = formData.get('name') as string;

  if (!name?.trim()) {
    errors.push('Name is required');
  }

  // If role is writer, phone becomes optional but can be validated if needed
  if (role === 'writer') {
    const phone = formData.get('phone') as string;
    // Add phone validation logic here if needed
    // Example: if (phone && !isValidPhone(phone)) { errors.push('Invalid phone format'); }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get All Users with Emails
export async function getAllUsersWithEmails() {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);
    const users = new Users(client); // Use Users service

    // Fetch all profiles from the database
    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );

    // Get all users from Appwrite Auth
    const allAuthUsers = await users.list();
    
    // Create a map of userId -> email
    const emailMap = new Map();
    allAuthUsers.users.forEach(authUser => {
      emailMap.set(authUser.$id, authUser.email);
    });

    // Combine profile data with emails
    const usersWithEmails = response.documents.map((profile: any) => ({
      ...profile,
      email: emailMap.get(profile.author_id) || 'Email not found'
    }));

    return { 
      success: true, 
      data: usersWithEmails,
      total: response.total
    };
  } catch (error: any) {
    console.error('Error fetching all users:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch users',
      data: [],
      total: 0
    };
  }
}

// Get All Users
export async function getAllUsers() {
  try {
    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Fetch all profiles from the database
    const response = await databases.listDocuments(
      process.env.NEXT_PRIVATE_DATABASE_ID!,
      process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
      [
        Query.orderDesc('$createdAt') // Optional: order by creation date
      ]
    );

    return { 
      success: true, 
      data: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error('Error fetching all users:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch users',
      data: [],
      total: 0
    };
  }
}