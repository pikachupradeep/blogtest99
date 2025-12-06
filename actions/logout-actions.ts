// actions/logout-actions.ts
"use server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  
  // Find BOTH types of session cookies
  const allCookies = cookieStore.getAll();
  const sessionCookies = allCookies.filter(cookie => 
    (cookie.name === `a_session_${projectId}` || cookie.name === 'appwrite-session') && cookie.value
  );

  // Clear ALL session-related cookies
  sessionCookies.forEach(sessionCookie => {
    cookieStore.delete(sessionCookie.name);
    console.log("Session cookie cleared:", sessionCookie.name);
  });

  // Also clear other custom cookies
  const customCookies = ['user-id', 'user-role'];
  customCookies.forEach(cookieName => {
    if (cookieStore.get(cookieName)) {
      cookieStore.delete(cookieName);
      console.log("Custom cookie cleared:", cookieName);
    }
  });

  redirect("/login");
}