
import { Account, Client, Databases, ID, Query, Storage } from 'node-appwrite';


const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);

// Export databases instance and utilities
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

export function createAppwriteClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_PRIVATE_APPWRITE_KEY!);

  return client;
}

interface SendEmailOTPResponse {
  success: boolean;
  userId: string;
  message: string;
}

interface VerifyEmailOTPResponse {
  success: boolean;
  session: {
    id: string;
    userId: string;
    expire: string;
  };
  message: string;
}

export async function sendEmailOTP(email: string): Promise<SendEmailOTPResponse> {
  try {
    const client = createAppwriteClient();
    const account = new Account(client);

    const sessionToken = await account.createEmailToken({
      userId: ID.unique(),
      email: email.toLowerCase().trim(), // Normalize email
    });

    return {
      success: true,
      userId: sessionToken.userId,
      message: 'Verification code sent successfully'
    };
  } catch (error: any) {
    console.error('Appwrite send OTP error:', error);
    // Don't expose specific error details
    throw new Error('Failed to send verification code');
  }
}

export async function verifyEmailOTP(userId: string, secret: string): Promise<VerifyEmailOTPResponse> {
  try {
    const client = createAppwriteClient();
    const account = new Account(client);

    const session = await account.createSession({
      userId: userId,
      secret: secret
    });

    return {
      success: true,
      session: {
        id: session.$id,
        userId: session.userId,
        expire: session.expire
      },
      message: 'Login successful'
    };
  } catch (error: any) {
    console.error('Appwrite verify OTP error:', error);
    // Don't expose specific error details
    throw new Error('Invalid verification code');
  }
}



















