/**
 * Local mutation queue for optimistic UI updates
 * Handles persistent storage and batching of like/bookmark operations
 */

export interface Mutation {
  id: string;
  op: 'like' | 'unlike' | 'bookmark' | 'unbookmark';
  entityId: string;
  entityType: 'couplet';
  ts: number;
  attempts?: number;
  crossLanguage?: boolean; // Flag for cross-language sync
}

export interface MutationQueueOptions {
  maxQueueSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

class MutationQueue {
  private queue: Mutation[] = [];
  private readonly storageKey = 'mutQueue';
  private readonly maxQueueSize: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(options: MutationQueueOptions = {}) {
    this.maxQueueSize = options.maxQueueSize || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.loadFromStorage();
  }

  /**
   * Load mutations from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
          // Clean up old mutations (older than 7 days)
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          this.queue = this.queue.filter(mutation => mutation.ts > sevenDaysAgo);
          this.persistToStorage();
        }
      }
    } catch (error) {
      console.warn('Failed to load mutation queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Persist mutations to localStorage
   */
  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to persist mutation queue to storage:', error);
    }
  }

  /**
   * Generate a unique ID for mutations
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a new mutation to the queue
   */
  enqueue(op: Mutation['op'], entityId: string, entityType: Mutation['entityType'] = 'couplet', crossLanguage = false): string {
    const id = this.generateId();
    const mutation: Mutation = {
      id,
      op,
      entityId,
      entityType,
      ts: Date.now(),
      attempts: 0,
      crossLanguage
    };

    // Check if we need to collapse consecutive operations on the same entity
    const lastMutation = this.queue[this.queue.length - 1];
    if (lastMutation && 
        lastMutation.entityId === entityId && 
        lastMutation.entityType === entityType &&
        this.shouldCollapse(lastMutation.op, op)) {
      // Remove the last mutation and add the new one
      this.queue.pop();
    }

    this.queue.push(mutation);

    // Enforce max queue size
    if (this.queue.length > this.maxQueueSize) {
      const removed = this.queue.shift();
      console.warn(`Mutation queue exceeded max size, removed oldest mutation:`, removed);
    }

    this.persistToStorage();
    return id;
  }

  /**
   * Check if two operations should be collapsed
   */
  private shouldCollapse(op1: Mutation['op'], op2: Mutation['op']): boolean {
    const collapseMap: Record<string, string[]> = {
      'like': ['unlike'],
      'unlike': ['like'],
      'bookmark': ['unbookmark'],
      'unbookmark': ['bookmark']
    };
    return collapseMap[op1]?.includes(op2) || false;
  }

  /**
   * Get all pending mutations
   */
  getQueue(): Mutation[] {
    return [...this.queue];
  }

  /**
   * Get mutations that haven't exceeded retry limit
   */
  getPendingMutations(): Mutation[] {
    return this.queue.filter(mutation => 
      (mutation.attempts || 0) < this.maxRetries
    );
  }

  /**
   * Mark mutations as successfully processed
   */
  markAsProcessed(mutationIds: string[]): void {
    this.queue = this.queue.filter(mutation => !mutationIds.includes(mutation.id));
    this.persistToStorage();
  }

  /**
   * Mark mutations as failed and increment retry count
   */
  markAsFailed(mutationIds: string[]): void {
    this.queue = this.queue.map(mutation => {
      if (mutationIds.includes(mutation.id)) {
        return {
          ...mutation,
          attempts: (mutation.attempts || 0) + 1,
          ts: Date.now() // Update timestamp for retry
        };
      }
      return mutation;
    });
    this.persistToStorage();
  }

  /**
   * Clear all mutations
   */
  clear(): void {
    this.queue = [];
    this.persistToStorage();
  }

  /**
   * Get queue statistics
   */
  getStats(): { total: number; pending: number; failed: number } {
    const total = this.queue.length;
    const pending = this.queue.filter(m => (m.attempts || 0) < this.maxRetries).length;
    const failed = this.queue.filter(m => (m.attempts || 0) >= this.maxRetries).length;
    
    return { total, pending, failed };
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get mutations for a specific entity
   */
  getMutationsForEntity(entityId: string, entityType: Mutation['entityType'] = 'couplet'): Mutation[] {
    return this.queue.filter(mutation => 
      mutation.entityId === entityId && mutation.entityType === entityType
    );
  }

  /**
   * Get the latest mutation for a specific entity
   */
  getLatestMutationForEntity(entityId: string, entityType: Mutation['entityType'] = 'couplet'): Mutation | null {
    const mutations = this.getMutationsForEntity(entityId, entityType);
    return mutations.length > 0 ? mutations[mutations.length - 1] : null;
  }
}

// Export a singleton instance
export const mutationQueue = new MutationQueue();

// Export the class for testing
export { MutationQueue };
