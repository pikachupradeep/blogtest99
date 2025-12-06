// lib/admin-rate-limit.ts

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

class AdminRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }>;
  private configs: Map<string, RateLimitConfig>;

  constructor() {
    this.attempts = new Map();
    this.configs = new Map();
    this.initializeAdminConfigs();
  }

  private initializeAdminConfigs(): void {
    // Higher limits for testing - at least 30 attempts
    this.configs.set('admin_otp_request', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 50 // 50 attempts for testing
    });

    this.configs.set('admin_otp_verify', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 100 // 100 attempts for testing
    });

    this.configs.set('admin_login', {
      windowMs: 30 * 60 * 1000, // 30 minutes
      maxAttempts: 50 // 50 attempts for testing
    });

    this.configs.set('admin_dashboard_access', {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxAttempts: 100 // 100 attempts for testing
    });

    this.configs.set('admin_sensitive_operation', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 50 // 50 attempts for testing
    });

    this.configs.set('admin_user_management', {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 100 // 100 attempts for testing
    });

    this.configs.set('admin_content_moderation', {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxAttempts: 200 // 200 attempts for testing
    });
  }

  check(key: string, type: string): RateLimitResult {
    const now = Date.now();
    const config = this.configs.get(type);
    
    // Safety check - if config not found, use default admin config
    if (!config) {
      console.warn(`Admin rate limit config not found for type: ${type}, using default`);
      const defaultConfig: RateLimitConfig = {
        windowMs: 15 * 60 * 1000,
        maxAttempts: 50 // High default for testing
      };
      return this.checkWithConfig(key, type, defaultConfig, now);
    }

    return this.checkWithConfig(key, type, config, now);
  }

  private checkWithConfig(key: string, type: string, config: RateLimitConfig, now: number): RateLimitResult {
    const attemptKey = `${key}:${type}`;
    const existing = this.attempts.get(attemptKey);

    if (!existing || now > existing.resetTime) {
      // No existing attempt or window has expired
      const resetTime = now + config.windowMs;
      this.attempts.set(attemptKey, {
        count: 1,
        resetTime
      });
      return { 
        success: true, 
        remaining: config.maxAttempts - 1,
        resetTime 
      };
    }

    if (existing.count >= config.maxAttempts) {
      // Rate limit exceeded
      return { 
        success: false, 
        remaining: 0,
        resetTime: existing.resetTime 
      };
    }

    // Increment attempt count
    existing.count++;
    return { 
      success: true, 
      remaining: config.maxAttempts - existing.count,
      resetTime: existing.resetTime 
    };
  }

  // Get remaining attempts without consuming one
  peek(key: string, type: string): RateLimitResult {
    const now = Date.now();
    const config = this.configs.get(type);
    
    if (!config) {
      return { success: true, remaining: 50 }; // High default for testing
    }

    const attemptKey = `${key}:${type}`;
    const existing = this.attempts.get(attemptKey);

    if (!existing || now > existing.resetTime) {
      return { 
        success: true, 
        remaining: config.maxAttempts,
        resetTime: now + config.windowMs 
      };
    }

    return { 
      success: existing.count < config.maxAttempts,
      remaining: Math.max(0, config.maxAttempts - existing.count),
      resetTime: existing.resetTime 
    };
  }

  // Reset attempts for a specific key and type
  reset(key: string, type: string): boolean {
    const attemptKey = `${key}:${type}`;
    return this.attempts.delete(attemptKey);
  }

  // Reset all attempts for a specific IP/key
  resetAllForIP(ip: string): number {
    let deletedCount = 0;
    const prefix = `${ip}:`;
    
    for (const [key] of this.attempts) {
      if (key.startsWith(prefix)) {
        if (this.attempts.delete(key)) {
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  }

  // Get all current rate limit configurations
  getConfigs(): Map<string, RateLimitConfig> {
    return new Map(this.configs);
  }

  // Add a custom configuration dynamically
  setConfig(type: string, config: RateLimitConfig): void {
    this.configs.set(type, config);
  }

  // Clean up expired entries (can be called periodically)
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, value] of this.attempts) {
      if (now > value.resetTime) {
        if (this.attempts.delete(key)) {
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  }

  // Get stats for monitoring
  getStats(): { totalTrackedIPs: number; configCount: number } {
    const uniqueIPs = new Set<string>();
    
    for (const [key] of this.attempts) {
      const ip = key.split(':')[0];
      uniqueIPs.add(ip);
    }
    
    return {
      totalTrackedIPs: uniqueIPs.size,
      configCount: this.configs.size
    };
  }
}

// Create and export a singleton instance
export const adminRateLimiter = new AdminRateLimiter();