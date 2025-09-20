# Optimistic Like & Bookmark System

This document describes the optimistic like and bookmark functionality implemented for the Baakh Next.js application. The system provides instant UI updates with background synchronization, offline support, and multi-tab synchronization.

## Overview

The optimistic system allows users to like and bookmark couplets with instant visual feedback, while mutations are queued and synchronized with the server in the background. This provides a smooth, responsive user experience even with network latency or offline conditions.

## Architecture

### 1. Client-Side Components

#### Mutation Queue (`src/lib/mutation-queue.ts`)
- **Purpose**: Manages local storage of pending mutations
- **Features**:
  - Persistent storage using localStorage
  - Automatic queue size management (max 5000 items)
  - Mutation deduplication and collapsing
  - Retry logic with exponential backoff
  - Cross-tab synchronization via storage events

#### Background Flusher (`src/lib/background-flusher.ts`)
- **Purpose**: Handles periodic synchronization with server
- **Features**:
  - Flushes every 500ms when online
  - Handles offline/online transitions
  - Uses sendBeacon for reliable page unload delivery
  - Batch processing (max 50 mutations per batch)
  - Retry logic with configurable attempts

#### Optimistic Actions Hook (`src/hooks/useOptimisticActions.ts`)
- **Purpose**: Provides React hook interface for optimistic actions
- **Features**:
  - Instant UI state updates
  - Automatic queue management
  - Status monitoring (online/offline/syncing)
  - Multi-tab state synchronization

### 2. Server-Side Components

#### Batch Mutations API (`src/app/api/mutations/route.ts`)
- **Purpose**: Processes batched mutations from clients
- **Features**:
  - Idempotent operations (prevents duplicate processing)
  - Batch processing for efficiency
  - Individual operation success/failure tracking
  - Automatic cache revalidation

#### Cache Revalidation (`src/lib/cache-revalidation.ts`)
- **Purpose**: Manages Next.js cache invalidation
- **Features**:
  - Tag-based cache invalidation
  - Path-based cache invalidation
  - Couplet, poet, and category-specific invalidation

### 3. UI Components

#### Updated CoupletCard (`src/components/CoupletCard.tsx`)
- **Purpose**: Displays couplets with optimistic like/bookmark actions
- **Features**:
  - Instant visual feedback
  - Offline/syncing indicators
  - Queue status display
  - Authentication integration

#### Offline Status Indicator (`src/components/ui/OfflineStatus.tsx`)
- **Purpose**: Global status indicator for connection and sync state
- **Features**:
  - Animated status transitions
  - Queue count display
  - Multilingual support (English/Sindhi)

## Usage

### Basic Implementation

```tsx
import { useOptimisticActions } from '@/hooks/useOptimisticActions';

function MyComponent() {
  const {
    isLiked,
    isBookmarked,
    likeCount,
    isLoading,
    isOnline,
    isSyncing,
    toggleLike,
    toggleBookmark,
    queueStats
  } = useOptimisticActions({
    entityId: 'couplet-123:user-456',
    entityType: 'couplet',
    initialLiked: false,
    initialBookmarked: false,
    initialLikeCount: 0
  });

  return (
    <div>
      <button onClick={toggleLike} disabled={isLoading}>
        {isLiked ? 'Unlike' : 'Like'} ({likeCount})
      </button>
      <button onClick={toggleBookmark} disabled={isLoading}>
        {isBookmarked ? 'Unbookmark' : 'Bookmark'}
      </button>
      {!isOnline && <span>Offline</span>}
      {isSyncing && <span>Syncing...</span>}
    </div>
  );
}
```

### Adding to Homepage

The optimistic functionality is already integrated into the homepage couplet cards. The system automatically:

1. Shows instant visual feedback when users like/bookmark
2. Displays offline/syncing status
3. Shows queue count for pending actions
4. Synchronizes across browser tabs

## Configuration

### Mutation Queue Options

```typescript
const mutationQueue = new MutationQueue({
  maxQueueSize: 5000,        // Maximum mutations in queue
  maxRetries: 3,             // Maximum retry attempts
  retryDelay: 1000          // Delay between retries (ms)
});
```

### Background Flusher Options

```typescript
const backgroundFlusher = new BackgroundFlusher({
  flushInterval: 500,        // Flush interval (ms)
  maxBatchSize: 50,          // Maximum mutations per batch
  enableOfflineDetection: true, // Enable offline detection
  onStatusChange: (status) => { /* handle status */ },
  onQueueUpdate: (stats) => { /* handle queue updates */ }
});
```

## Testing

### Test Page

Visit `/test-optimistic` to test the optimistic functionality:

- Test like/bookmark actions
- Simulate offline/online conditions
- Monitor queue status
- View recent mutations
- Test cross-tab synchronization

### Manual Testing Checklist

- [ ] Like/unlike works instantly
- [ ] Bookmark/unbookmark works instantly
- [ ] UI updates persist across page refreshes
- [ ] Offline mode queues actions
- [ ] Online mode syncs queued actions
- [ ] Multiple tabs stay synchronized
- [ ] Rapid clicks are handled correctly
- [ ] Network errors are retried
- [ ] Cache is revalidated after sync

## Data Flow

1. **User Action**: User clicks like/bookmark button
2. **Optimistic Update**: UI updates immediately
3. **Queue Mutation**: Action is added to local queue
4. **Background Sync**: Flusher sends mutations to server
5. **Server Processing**: Server processes mutations idempotently
6. **Cache Revalidation**: Server invalidates relevant cache tags
7. **Success Confirmation**: Client removes processed mutations from queue

## Error Handling

### Client-Side Errors
- Network failures: Mutations remain in queue for retry
- Invalid mutations: Removed from queue with logging
- Storage errors: Graceful fallback to memory-only queue

### Server-Side Errors
- Invalid entity IDs: Individual mutations marked as failed
- Database errors: Batch processing continues with partial success
- Authentication errors: Mutations remain queued for retry

## Performance Considerations

### Queue Management
- Maximum queue size prevents memory issues
- Old mutations (7+ days) are automatically cleaned up
- Mutations are collapsed to prevent redundant operations

### Network Efficiency
- Batched requests reduce server load
- sendBeacon ensures reliable delivery on page unload
- Exponential backoff prevents server overload

### Cache Strategy
- Tag-based invalidation targets specific content
- Path-based invalidation updates relevant pages
- Selective revalidation minimizes unnecessary updates

## Security

### Authentication
- User ID is validated on server-side
- Mutations are scoped to authenticated users
- Anonymous users cannot queue mutations

### Data Validation
- Entity IDs are validated before processing
- Operation types are restricted to allowed values
- Batch size limits prevent abuse

### Idempotency
- Duplicate mutations are safely ignored
- Server-side deduplication prevents double-processing
- Client-side collapsing reduces redundant operations

## Monitoring

### Client-Side Logging
- Queue statistics (total, pending, failed)
- Status changes (online/offline/syncing)
- Error conditions and retry attempts

### Server-Side Logging
- Batch processing statistics
- Individual mutation results
- Cache revalidation events
- Error conditions and recovery

## Future Enhancements

### Planned Features
- [ ] IndexedDB support for larger queues
- [ ] Service Worker for background sync
- [ ] Real-time conflict resolution
- [ ] Advanced retry strategies
- [ ] Analytics and monitoring dashboard

### Potential Optimizations
- [ ] Compression for large mutation batches
- [ ] Delta synchronization for large datasets
- [ ] Predictive prefetching of likely actions
- [ ] Advanced caching strategies

## Troubleshooting

### Common Issues

1. **Mutations not syncing**
   - Check network connectivity
   - Verify server endpoint is accessible
   - Check browser console for errors

2. **UI not updating instantly**
   - Ensure component is using the hook correctly
   - Check for JavaScript errors
   - Verify entity ID format

3. **Cross-tab sync not working**
   - Check localStorage is enabled
   - Verify storage events are firing
   - Check for browser compatibility issues

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug-optimistic', 'true');
```

This will log detailed information about:
- Queue operations
- Background flushing
- Status changes
- Error conditions

## Support

For issues or questions about the optimistic actions system:

1. Check the test page at `/test-optimistic`
2. Review browser console for errors
3. Check server logs for processing issues
4. Verify database connectivity and permissions
