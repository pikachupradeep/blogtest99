// lib/auth-utils.ts
'use server';

import { cookies } from 'next/headers';

export async function getUserRole(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('user-role')?.value;
    return role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function checkUserProfile(): Promise<{ hasProfile: boolean; role?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return { hasProfile: false };
    }

    // You can add additional profile checking logic here if needed
    const role = cookieStore.get('user-role')?.value;
    
    return { 
      hasProfile: !!role, // If role exists, profile likely exists
      role: role || undefined
    };
  } catch (error) {
    console.error('Error checking user profile:', error);
    return { hasProfile: false };
  }
}

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    return userId || null;
  } catch (error) {
    console.error('Error getting user ID from session:', error);
    return null;
  }
}