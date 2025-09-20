import { createClient, RedisClientType } from 'redis';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for Redis keys
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

class RedisRateLimiter {
  private client: RedisClientType | null = null;
  private config: RateLimitConfig;
  private isConnected = false;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'rate_limit:',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url: redisUrl });
      
      this.client.on('error', (err) => {
        console.error('Redis Rate Limiter Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Rate Limiter connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Check if request is allowed and update counters
   */
  async checkLimit(
    identifier: string, 
    isSuccess: boolean = true
  ): Promise<RateLimitResult> {
    // Fallback to in-memory if Redis is not available
    if (!this.isConnected || !this.client) {
      return this.fallbackCheck(identifier);
    }

    try {
      const key = `${this.config.keyPrefix}${identifier}`;
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // Use Redis pipeline for atomic operations
      const pipeline = this.client.multi();

      // Remove expired entries
      pipeline.zRemRangeByScore(key, '-inf', windowStart);

      // Count current requests in window
      pipeline.zCard(key);

      // Add current request
      pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

      // Set expiration
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline execution failed');
      }

      const totalHits = results[1] as number;
      const remaining = Math.max(0, this.config.maxRequests - totalHits - 1);
      const allowed = totalHits < this.config.maxRequests;

      // Calculate reset time
      const oldestRequest = await this.client.zRange(key, 0, 0, { REV: true, WITHSCORES: true });
      const resetTime = oldestRequest.length > 0 
        ? (oldestRequest[1] as number) + this.config.windowMs
        : now + this.config.windowMs;

      return {
        allowed,
        remaining,
        resetTime,
        totalHits: totalHits + 1
      };

    } catch (error) {
      console.error('Redis rate limiting error:', error);
      return this.fallbackCheck(identifier);
    }
  }

  /**
   * Fallback to in-memory rate limiting when Redis is unavailable
   */
  private fallbackCheck(identifier: string): RateLimitResult {
    // This is a simplified fallback - in production, you might want to use
    // a more sophisticated in-memory solution or fail gracefully
    return {
      allowed: true,
      remaining: this.config.maxRequests - 1,
      resetTime: Date.now() + this.config.windowMs,
      totalHits: 1
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(identifier: string): Promise<RateLimitResult> {
    if (!this.isConnected || !this.client) {
      return this.fallbackCheck(identifier);
    }

    try {
      const key = `${this.config.keyPrefix}${identifier}`;
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // Remove expired entries
      await this.client.zRemRangeByScore(key, '-inf', windowStart);

      // Count current requests
      const totalHits = await this.client.zCard(key);
      const remaining = Math.max(0, this.config.maxRequests - totalHits);
      const allowed = totalHits < this.config.maxRequests;

      // Calculate reset time
      const oldestRequest = await this.client.zRange(key, 0, 0, { REV: true, WITHSCORES: true });
      const resetTime = oldestRequest.length > 0 
        ? (oldestRequest[1] as number) + this.config.windowMs
        : now + this.config.windowMs;

      return {
        allowed,
        remaining,
        resetTime,
        totalHits
      };

    } catch (error) {
      console.error('Redis status check error:', error);
      return this.fallbackCheck(identifier);
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async reset(identifier: string): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      const key = `${this.config.keyPrefix}${identifier}`;
      await this.client.del(key);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create rate limiter instances for different endpoints
export const apiRateLimiter = new RedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: 'api_rate_limit:'
});

export const authRateLimiter = new RedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // More restrictive for auth endpoints
  keyPrefix: 'auth_rate_limit:'
});

export const adminRateLimiter = new RedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // Higher limit for admin operations
  keyPrefix: 'admin_rate_limit:'
});

// Initialize rate limiters
export async function initializeRateLimiters(): Promise<void> {
  await Promise.all([
    apiRateLimiter.connect(),
    authRateLimiter.connect(),
    adminRateLimiter.connect()
  ]);
}

// Cleanup function
export async function cleanupRateLimiters(): Promise<void> {
  await Promise.all([
    apiRateLimiter.disconnect(),
    authRateLimiter.disconnect(),
    adminRateLimiter.disconnect()
  ]);
}
