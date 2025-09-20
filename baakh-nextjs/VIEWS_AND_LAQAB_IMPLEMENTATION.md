# Views Tracking and Laqab Implementation

## Overview
This implementation adds real views tracking for couplets and prioritizes laqab (honorific title) over takhalus (pen name) for poet names in the Featured Couplets section.

## Changes Made

### 1. Database Schema
- **File**: `supabase/views_tracking.sql`
- **Changes**: Created `content_views` table to track views for different content types
- **Features**:
  - Tracks views by content ID, type, and session
  - Prevents duplicate views from same session
  - Includes analytics data (IP, user agent)
  - Creates view for aggregated view counts

### 2. API Updates

#### Couplets API (`src/app/api/couplets/route.ts`)
- **Laqab Priority**: Updated poet name selection to prioritize `laqab` over `takhalus`
- **Real Views**: Replaced random view numbers with actual view counts from database
- **Performance**: Added batch view count fetching for multiple couplets

#### Couplets by Poet API (`src/app/api/couplets/by-poet/[poetId]/route.ts`)
- **Laqab Priority**: Updated poet name selection to prioritize `laqab` over `takhalus`
- **Real Views**: Replaced random view numbers with actual view counts

#### Views Tracking API (`src/app/api/views/track/route.ts`)
- **New Endpoint**: Created API to track and retrieve view counts
- **POST**: Track a view for specific content
- **GET**: Retrieve view count for specific content

### 3. Frontend Components

#### View Tracking Hook (`src/hooks/useViewTracking.ts`)
- **New Hook**: React hook for automatic view tracking
- **Features**:
  - Configurable delay before tracking
  - Session-based duplicate prevention
  - Error handling

#### Couplet Card Component (`src/components/CoupletCard.tsx`)
- **New Component**: Reusable couplet card with view tracking
- **Features**:
  - Automatic view tracking after 2 seconds
  - Displays real view counts
  - Maintains existing styling and functionality

#### Homepage Updates (`src/app/[locale]/page.tsx`)
- **Component Integration**: Replaced inline couplet rendering with `CoupletCard` component
- **View Tracking**: Each couplet now automatically tracks views when displayed

## Database Migration Required

Run the following SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase/views_tracking.sql
```

## Testing

### Manual Testing
1. Visit the homepage
2. Check that poet names show laqab instead of takhalus
3. Verify that view counts are real (initially 0, then increment)
4. Check browser network tab for view tracking API calls

### API Testing
Run the test script:
```bash
node test-views-api.js
```

## Key Features

### Laqab Priority
- Sindhi couplets: `sindhi_laqab` → `sindhi_takhalus` → `sindhi_name` → fallback
- English couplets: `english_laqab` → `english_takhalus` → `english_name` → fallback

### Views Tracking
- **Automatic**: Views tracked when couplets are displayed for 2+ seconds
- **Session-based**: Prevents duplicate views from same session
- **Real-time**: View counts update immediately
- **Analytics**: Tracks IP and user agent for insights

### Performance
- **Batch Queries**: Efficiently fetches view counts for multiple couplets
- **Caching**: View counts cached during API request
- **Error Handling**: Graceful fallback if tracking fails

## Files Modified

1. `supabase/views_tracking.sql` - Database schema
2. `src/app/api/couplets/route.ts` - Main couplets API
3. `src/app/api/couplets/by-poet/[poetId]/route.ts` - Couplets by poet API
4. `src/app/api/views/track/route.ts` - Views tracking API
5. `src/hooks/useViewTracking.ts` - View tracking hook
6. `src/components/CoupletCard.tsx` - Couplet card component
7. `src/app/[locale]/page.tsx` - Homepage updates
8. `test-views-api.js` - Test script

## Next Steps

1. Run the database migration
2. Test the implementation
3. Monitor view tracking in production
4. Consider adding view analytics dashboard
5. Extend views tracking to other content types (poetry, poets)
