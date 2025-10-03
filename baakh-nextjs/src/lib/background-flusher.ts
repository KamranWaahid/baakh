/**
 * Background flusher service for syncing mutations to server
 * Handles periodic flushing, retry logic, and offline detection
 */

import { mutationQueue, Mutation } from './mutation-queue';

export interface FlusherOptions {
  flushInterval?: number;
  maxBatchSize?: number;
  enableOfflineDetection?: boolean;
  onStatusChange?: (status: 'online' | 'offline' | 'syncing' | 'error') => void;
  onQueueUpdate?: (stats: { total: number; pending: number; failed: number }) => void;
}

class BackgroundFlusher {
  private flushInterval: number;
  private maxBatchSize: number;
  private enableOfflineDetection: boolean;
  private onStatusChange?: (status: 'online' | 'offline' | 'syncing' | 'error') => void;
  private onQueueUpdate?: (stats: { total: number; pending: number; failed: number }) => void;
  
  private intervalId: NodeJS.Timeout | null = null;
  private isFlushing = false;
  private isOnline = true;
  private abortController: AbortController | null = null;

  constructor(options: FlusherOptions = {}) {
    this.flushInterval = options.flushInterval || 500;
    this.maxBatchSize = options.maxBatchSize || 50;
    this.enableOfflineDetection = options.enableOfflineDetection ?? true;
    this.onStatusChange = options.onStatusChange;
    this.onQueueUpdate = options.onQueueUpdate;

    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.start();
    }
  }

  /**
   * Setup event listeners for offline detection and page lifecycle
   */
  private setupEventListeners(): void {
    if (!this.enableOfflineDetection) return;

    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onStatusChange?.('online');
      this.start(); // Restart flushing when back online
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onStatusChange?.('offline');
      this.stop(); // Stop flushing when offline
    });

    // Page visibility change - flush when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushImmediately();
      }
    });

    // Page unload - use sendBeacon for reliable delivery
    window.addEventListener('beforeunload', () => {
      this.flushWithBeacon();
    });

    window.addEventListener('pagehide', () => {
      this.flushWithBeacon();
    });
  }

  /**
   * Start the background flusher
   */
  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      if (this.isOnline && !this.isFlushing && !mutationQueue.isEmpty()) {
        this.flush();
      }
    }, this.flushInterval);

    // Initial flush
    if (this.isOnline && !mutationQueue.isEmpty()) {
      this.flush();
    }
  }

  /**
   * Stop the background flusher
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Flush mutations immediately
   */
  async flushImmediately(): Promise<void> {
    if (this.isFlushing || !this.isOnline) return;
    await this.flush();
  }

  /**
   * Flush mutations using sendBeacon (for page unload)
   */
  private flushWithBeacon(): void {
    const mutations = mutationQueue.getPendingMutations();
    if (mutations.length === 0) return;

    const batch = mutations.slice(0, this.maxBatchSize);
    const data = JSON.stringify({ ops: batch });

    // Use sendBeacon if available, otherwise use fetch with keepalive
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/mutations', data);
      mutationQueue.markAsProcessed(batch.map(m => m.id));
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/mutations/', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).then(() => {
        mutationQueue.markAsProcessed(batch.map(m => m.id));
      }).catch(() => {
        // Ignore errors during page unload
      });
    }
  }

  /**
   * Main flush method
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || !this.isOnline) return;

    const mutations = mutationQueue.getPendingMutations();
    if (mutations.length === 0) return;

    this.isFlushing = true;
    this.onStatusChange?.('syncing');

    try {
      // Create abort controller for this flush
      this.abortController = new AbortController();

      // Process mutations in batches
      const batches = this.createBatches(mutations, this.maxBatchSize);
      
      for (const batch of batches) {
        await this.flushBatch(batch);
      }

      this.onStatusChange?.('online');
    } catch (error) {
      console.error('Background flush error:', error);
      this.onStatusChange?.('error');
    } finally {
      this.isFlushing = false;
      this.abortController = null;
      this.onQueueUpdate?.(mutationQueue.getStats());
    }
  }

  /**
   * Create batches from mutations
   */
  private createBatches(mutations: Mutation[], batchSize: number): Mutation[][] {
    const batches: Mutation[][] = [];
    for (let i = 0; i < mutations.length; i += batchSize) {
      batches.push(mutations.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Flush a single batch of mutations
   */
  private async flushBatch(batch: Mutation[]): Promise<void> {
    if (this.abortController?.signal.aborted) return;

    try {
      const response = await fetch('/api/mutations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ops: batch }),
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Mark successful mutations as processed
        const successfulIds = result.processedIds || batch.map(m => m.id);
        mutationQueue.markAsProcessed(successfulIds);
        
        // Mark failed mutations for retry
        const failedIds = batch
          .filter(m => !successfulIds.includes(m.id))
          .map(m => m.id);
        
        if (failedIds.length > 0) {
          mutationQueue.markAsFailed(failedIds);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was aborted, don't mark as failed
      }
      
      console.error('Batch flush error:', error);
      // Mark all mutations in this batch as failed for retry
      mutationQueue.markAsFailed(batch.map(m => m.id));
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    isOnline: boolean;
    isFlushing: boolean;
    queueStats: { total: number; pending: number; failed: number };
  } {
    return {
      isOnline: this.isOnline,
      isFlushing: this.isFlushing,
      queueStats: mutationQueue.getStats()
    };
  }

  /**
   * Force a status update
   */
  updateStatus(): void {
    this.onQueueUpdate?.(mutationQueue.getStats());
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

// Export a singleton instance
export const backgroundFlusher = new BackgroundFlusher({
  onStatusChange: (status) => {
    // Optional: You can add global status handling here
    console.log('Flusher status:', status);
  },
  onQueueUpdate: (stats) => {
    // Optional: You can add global queue monitoring here
    if (stats.total > 0) {
      console.log('Queue stats:', stats);
    }
  }
});

// Export the class for testing
export { BackgroundFlusher };
