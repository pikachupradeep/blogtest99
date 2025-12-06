import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret-change-in-production'
);

// Create temporary token that hides the actual user ID
export async function createTempToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m') // 5 minutes expiration
    .setIssuedAt()
    .sign(JWT_SECRET);
}

// Verify temporary token and extract user ID
export async function verifyTempToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// Simple in-memory rate limiting (use Redis in production)
const attemptCounts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
  const now = Date.now();
  const userAttempts = attemptCounts.get(identifier);
  
  if (!userAttempts || now - userAttempts.lastAttempt > windowMs) {
    attemptCounts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (userAttempts.count >= maxAttempts) {
    return false;
  }
  
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  return true;
}