interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

type TimestampStore = Map<string, number[]>;

function getStore(): TimestampStore {
  const globalScope = globalThis as typeof globalThis & {
    __edgeRateLimiterStore?: TimestampStore;
  };

  if (!globalScope.__edgeRateLimiterStore) {
    globalScope.__edgeRateLimiterStore = new Map();
  }

  return globalScope.__edgeRateLimiterStore;
}

class EdgeRateLimiter {
  private readonly config: Required<Pick<RateLimitConfig, 'windowMs' | 'maxRequests' | 'keyPrefix' | 'skipSuccessfulRequests' | 'skipFailedRequests'>>;
  private readonly store = getStore();

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'rate_limit:',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  private prune(identifier: string, now: number): number[] {
    const key = `${this.config.keyPrefix}${identifier}`;
    const windowStart = now - this.config.windowMs;
    const existing = this.store.get(key) ?? [];
    const filtered = existing.filter(timestamp => timestamp > windowStart);
    this.store.set(key, filtered);
    return filtered;
  }

  async checkLimit(identifier: string, isSuccess: boolean = true): Promise<RateLimitResult> {
    if ((isSuccess && this.config.skipSuccessfulRequests) || (!isSuccess && this.config.skipFailedRequests)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        totalHits: 0,
      };
    }

    const now = Date.now();
    const key = `${this.config.keyPrefix}${identifier}`;
    const timestamps = this.prune(identifier, now);
    const totalHits = timestamps.length;
    const allowed = totalHits < this.config.maxRequests;

    if (allowed) {
      timestamps.push(now);
      this.store.set(key, timestamps);
    }

    const remaining = Math.max(0, this.config.maxRequests - (allowed ? totalHits + 1 : totalHits));
    const oldest = timestamps[0] ?? now;
    const resetTime = oldest + this.config.windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      totalHits: allowed ? totalHits + 1 : totalHits,
    };
  }

  async getStatus(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `${this.config.keyPrefix}${identifier}`;
    const timestamps = this.prune(identifier, now);
    const totalHits = timestamps.length;
    const remaining = Math.max(0, this.config.maxRequests - totalHits);
    const oldest = timestamps[0] ?? now;

    return {
      allowed: totalHits < this.config.maxRequests,
      remaining,
      resetTime: oldest + this.config.windowMs,
      totalHits,
    };
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}${identifier}`;
    this.store.delete(key);
  }
}

export const apiRateLimiter = new EdgeRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  keyPrefix: 'edge:api:'
});

export const authRateLimiter = new EdgeRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  keyPrefix: 'edge:auth:'
});

export const adminRateLimiter = new EdgeRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  keyPrefix: 'edge:admin:'
});

export type { RateLimitResult };
