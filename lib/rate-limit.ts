interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const rateLimitConfig: { [key: string]: RateLimitConfig } = {
  otp_request: { maxAttempts: 33, windowMs: 300000 }, // 3 attempts per 5 minutes
  otp_verify: { maxAttempts: 55, windowMs: 900000 },  // 5 attempts per 15 minutes
};

export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  check(identifier: string, type: keyof typeof rateLimitConfig): { success: boolean; remaining: number } {
    const config = rateLimitConfig[type];
    const key = `${identifier}:${type}`;
    const now = Date.now();

    // Clean up old entries
    if (this.attempts.has(key) && now > this.attempts.get(key)!.resetTime) {
      this.attempts.delete(key);
    }

    if (!this.attempts.has(key)) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { success: true, remaining: config.maxAttempts - 1 };
    }

    const userAttempts = this.attempts.get(key)!;
    
    if (userAttempts.count >= config.maxAttempts) {
      return { success: false, remaining: 0 };
    }

    userAttempts.count++;
    return { success: true, remaining: config.maxAttempts - userAttempts.count };
  }

  getRemaining(identifier: string, type: keyof typeof rateLimitConfig): number {
    const key = `${identifier}:${type}`;
    const config = rateLimitConfig[type];
    const now = Date.now();

    if (!this.attempts.has(key) || now > this.attempts.get(key)!.resetTime) {
      return config.maxAttempts;
    }

    return config.maxAttempts - this.attempts.get(key)!.count;
  }
}

export const rateLimiter = new RateLimiter();