// lib/appwrite-logout.ts
import { Client, Account } from 'node-appwrite';

console.log('🔄 Initializing Appwrite logout client...');
console.log('🔑 Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('🔑 Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
console.log('🔑 API Key present:', !!process.env.NEXT_PRIVATE_APPWRITE_KEY);

// Create Client specifically for logout
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);

// Create Account instance for logout
export const account = new Account(client);

console.log('✅ Appwrite logout client initialized successfully');

export default client;