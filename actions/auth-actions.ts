//actions/auth-actions.ts

'use server';

import { sendEmailOTP, verifyEmailOTP } from '@/lib/appwrite-server';
import { createTempToken, verifyTempToken } from '@/lib/security';
import { rateLimiter } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { Client, Databases, Query } from 'node-appwrite';
import { redirect } from 'next/navigation';

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

// Initialize Appwrite client for server-side operations
function getAppwriteServerClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);
  return client;
}

export async function sendOTPAction(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string;
    
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';
    
    const rateLimitResult = rateLimiter.check(ip, 'otp_request');
    if (!rateLimitResult.success) {
      return { 
        success: false, 
        error: `Too many attempts. Please try again in ${Math.ceil(rateLimitResult.remaining / 60)} minutes.` 
      };
    }

    if (!email || !email.includes('@')) {
      return { 
        success: false, 
        error: 'If this email exists, a verification code has been sent.' 
      };
    }

    const result = await sendEmailOTP(email);
    
    const tempToken = await createTempToken(result.userId);
    
    return {
      success: true,
      tempToken,
      message: 'If this email exists, a verification code has been sent.'
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      error: 'If this email exists, a verification code has been sent.' 
    };
  }
}

export async function verifyOTPAction(formData: FormData): Promise<ActionResponse> {
  try {
    const tempToken = formData.get('tempToken') as string;
    const secret = formData.get('secret') as string;

    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';
    
    const rateLimitResult = rateLimiter.check(ip, 'otp_verify');
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
      const cookieStore = await cookies();
      
      // Store both cookies
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

      // Check if user has a profile and get role
      try {
        const client = getAppwriteServerClient();
        const databases = new Databases(client);

        const profiles = await databases.listDocuments(
          process.env.NEXT_PRIVATE_DATABASE_ID!,
          process.env.NEXT_PRIVATE_PROFILE_COLLECTION_ID!,
          [Query.equal('author_id', result.session.userId)]
        );

        // If user has profile, determine redirect path based on role
        if (profiles.total > 0) {
          const userProfile = profiles.documents[0];
          const userRole = userProfile.role || 'reader';
          
          // Store user role in cookie for quick access
          cookieStore.set('user-role', userRole, {
            httpOnly: false, // Allow client-side access for UI
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });

          // ROLE-BASED REDIRECTION LOGIC - CORRECTED
          let redirectPath = '/userDashboard/save'; // Default for readers
          
          if (userRole === 'writer') {
            redirectPath = '/authDashboard/posts';
          } else if (userRole === 'reader') {
            redirectPath = '/userDashboard/save'; // CORRECT: Reader goes to /userDashboard/save
          }

          // Return redirect information based on role
          return {
            ...result,
            hasProfile: true,
            redirectPath: redirectPath
          };
        } else {
          // No profile found, redirect to profile creation
          return {
            ...result,
            hasProfile: false,
            redirectPath: '/profile/create'
          };
        }
      } catch (profileError) {
        console.error('Error checking profile:', profileError);
        // If profile check fails, redirect to profile creation to be safe
        return {
          ...result,
          hasProfile: false,
          redirectPath: '/profile/create'
        };
      }
    }

    revalidatePath('/');
    return result;
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return { 
      success: false, 
      error: 'Invalid verification code' 
    };
  }
}