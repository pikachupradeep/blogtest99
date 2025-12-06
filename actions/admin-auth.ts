'use server';

import { sendEmailOTP, verifyEmailOTP } from '@/lib/appwrite-server';
import { createTempToken, verifyTempToken } from '@/lib/security';
import { adminRateLimiter } from '@/lib/admin-rate-limit';
import { cookies, headers } from 'next/headers';
import { Client, Databases, Query, ID } from 'node-appwrite';

interface ActionResponse {
  success: boolean;
  error?: string;
  tempToken?: string;
  message?: string;
  session?: {
    id: string;
    userId: string;
    expire: string;
  };
  hasProfile?: boolean;
  redirectPath?: string;
}

interface AdminCheckResponse {
  isAdmin: boolean;
  error?: string;
  adminData?: any;
}

// Initialize Appwrite client for server-side operations
function getAppwriteServerClient(): Client {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);
  return client;
}

// Check if user is admin by userId (foreign key in admin collection)
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const databaseId = process.env.NEXT_PRIVATE_DATABASE_ID;
    const adminCollectionId = process.env.NEXT_PRIVATE_ADMIN_COLLECTION;

    if (!databaseId || !adminCollectionId) {
      console.error('Missing environment variables');
      return false;
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    console.log('Checking if user is admin by userId:', userId);

    // Try different possible attribute names for userId foreign key
    const possibleUserIdAttributes = ['userId', 'user_id', 'userID', 'author_id', 'uid'];
    
    for (const attribute of possibleUserIdAttributes) {
      try {
        console.log(`Trying userId attribute: ${attribute}`);
        
        const adminUsers = await databases.listDocuments(
          databaseId,
          adminCollectionId,
          [
            Query.equal(attribute, userId),
            Query.equal('role', 'admin') // Also check role if you want
          ]
        );

        if (adminUsers.total > 0) {
          console.log(`✅ User is admin. Found using attribute: ${attribute}`);
          console.log('Admin user data:', adminUsers.documents[0]);
          return true;
        }
      } catch (attrError: any) {
        console.log(`❌ Attribute ${attribute} not found:`, attrError.message);
        // Continue to next attribute
      }
    }

    // If specific attributes didn't work, try to find any document with this userId
    try {
      const allAdminUsers = await databases.listDocuments(
        databaseId,
        adminCollectionId
      );

      // Check if any document has the userId in any field
      const found = allAdminUsers.documents.some(doc => 
        Object.values(doc).some(value => 
          value === userId
        )
      );

      if (found) {
        console.log('✅ User is admin (found userId in document fields)');
        return true;
      }

    } catch (allError: any) {
      console.error('Error fetching all admin users:', allError.message);
    }

    console.log('❌ User is not admin. UserId not found in admin collection:', userId);
    return false;

  } catch (error: any) {
    console.error('Error checking admin status:', error.message);
    return false;
  }
}

export async function sendAdminOTPAction(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string;
    
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';
    
    // Use admin-specific rate limiter
    const rateLimitResult = adminRateLimiter.check(ip, 'admin_otp_request');
    if (!rateLimitResult.success) {
      const waitMinutes = rateLimitResult.resetTime 
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)
        : 15;
      
      return { 
        success: false, 
        error: `Too many admin login attempts. Please try again in ${waitMinutes} minutes.` 
      };
    }

    if (!email || !email.includes('@')) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      };
    }

    console.log('Starting admin OTP process for:', email);

    // For admin OTP, we don't check email against collection
    // We'll verify admin status AFTER OTP verification using userId
    const result = await sendEmailOTP(email);
    
    const tempToken = await createTempToken(result.userId);
    
    return {
      success: true,
      tempToken,
      message: 'If this email has admin privileges, a verification code has been sent.'
    };
  } catch (error: any) {
    console.error('Admin OTP send error:', error);
    return { 
      success: false, 
      error: 'Failed to send verification code' 
    };
  }
}

export async function verifyAdminOTPAction(formData: FormData): Promise<ActionResponse> {
  try {
    const tempToken = formData.get('tempToken') as string;
    const secret = formData.get('secret') as string;

    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';
    
    // Use admin-specific rate limiter
    const rateLimitResult = adminRateLimiter.check(ip, 'admin_otp_verify');
    if (!rateLimitResult.success) {
      return { 
        success: false, 
        error: 'Too many verification attempts. Please request a new code.' 
      };
    }

    if (!tempToken || !secret || secret.length !== 6) {
      return { 
        success: false, 
        error: 'Invalid verification code' 
      };
    }

    const userId = await verifyTempToken(tempToken);
    if (!userId) {
      return { 
        success: false, 
        error: 'Verification session expired. Please request a new code.' 
      };
    }

    const result = await verifyEmailOTP(userId, secret);
    
    if (result.success && result.session) {
      // ✅ PRIMARY CHECK: Verify current userId exists in admin collection as foreign key
      const isAdmin = await isUserAdmin(result.session.userId);
      
      if (!isAdmin) {
        console.log('❌ Admin access denied. UserId not found in admin collection:', result.session.userId);
        return { 
          success: false, 
          error: 'Access denied. Admin privileges required.' 
        };
      }

      const cookieStore = await cookies();
      
      console.log('✅ Admin login successful, storing admin ID:', result.session.userId);
      
      // Store session cookies
      cookieStore.set('appwrite-session', result.session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      
      cookieStore.set('user-id', result.session.userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      cookieStore.set('user-role', 'admin', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      console.log('✅ Admin cookies stored successfully');

      return {
        success: true,
        session: result.session,
        redirectPath: '/dashboard'
      };
    }

    return result;
  } catch (error: any) {
    console.error('Admin OTP verification error:', error);
    return { 
      success: false, 
      error: 'Invalid verification code' 
    };
  }
}

export async function checkAdminAccess(userId: string): Promise<AdminCheckResponse> {
  try {
    const databaseId = process.env.NEXT_PRIVATE_DATABASE_ID;
    const adminCollectionId = process.env.NEXT_PRIVATE_ADMIN_COLLECTION;

    if (!databaseId || !adminCollectionId) {
      console.error('Missing environment variables for admin check');
      return { 
        isAdmin: false, 
        error: 'Server configuration error' 
      };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    // Check using userId foreign key
    const adminUsers = await databases.listDocuments(
      databaseId,
      adminCollectionId,
      [
        Query.equal('userId', userId), // Primary check
        Query.equal('role', 'admin')   // Optional role check
      ]
    );

    if (adminUsers.total === 0) {
      return { 
        isAdmin: false, 
        error: 'User not found in admin collection' 
      };
    }

    const adminUser = adminUsers.documents[0];
    
    return {
      isAdmin: true,
      adminData: adminUser
    };

  } catch (error: any) {
    console.error('Admin check error:', error);
    return { 
      isAdmin: false, 
      error: 'Failed to verify admin access' 
    };
  }
}





































interface ProfileResponse {
  success: boolean;
  error?: string;
  profile?: {
    $id: string;
    name: string;
    userId: string;
    role: string;
  };
}

export async function getCurrentAdminProfile(): Promise<ProfileResponse> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return { 
        success: false, 
        error: 'No user session found' 
      };
    }

    const client = getAppwriteServerClient();
    const databases = new Databases(client);

    const databaseId = process.env.NEXT_PRIVATE_DATABASE_ID!;
    const adminCollectionId = process.env.NEXT_PRIVATE_ADMIN_COLLECTION!;

    const adminUsers = await databases.listDocuments(
      databaseId,
      adminCollectionId,
      [Query.equal('userId', userId)]
    );

    if (adminUsers.total === 0) {
      return { 
        success: false, 
        error: 'Admin profile not found' 
      };
    }

    const adminData = adminUsers.documents[0];
    
    return {
      success: true,
      profile: {
        $id: adminData.$id,
        name: adminData.name,
        userId: adminData.userId,
        role: adminData.role
      }
    };

  } catch (error: any) {
    console.error('Get admin profile error:', error);
    return { 
      success: false, 
      error: 'Failed to fetch admin profile' 
    };
  }
}




























