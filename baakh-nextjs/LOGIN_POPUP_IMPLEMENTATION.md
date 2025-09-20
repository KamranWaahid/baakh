# Login Popup Implementation for Like/Bookmark Buttons

## Overview
This implementation adds login popup functionality when users click on like or bookmark buttons without being authenticated. The system uses the existing `AuthModal` component and `useE2EEAuth` hook to check authentication status.

## Changes Made

### 1. Created Reusable Hook
- **File**: `src/hooks/useAuthRequired.ts`
- **Purpose**: Centralized authentication logic for requiring login
- **Features**:
  - Checks if user is authenticated
  - Shows auth modal when action requires login
  - Provides callback mechanism for authenticated actions

### 2. Updated CoupletCard Component
- **File**: `src/components/CoupletCard.tsx`
- **Changes**:
  - Added authentication check for like/bookmark buttons
  - Integrated `useAuthRequired` hook
  - Added click handlers with authentication requirements
  - Added tooltips indicating login requirement
  - Added `AuthModal` component

### 3. Updated Couplets Page
- **File**: `src/app/[locale]/couplets/page.tsx`
- **Changes**:
  - Added authentication logic for like/bookmark buttons
  - Integrated `useAuthRequired` hook
  - Added click handlers for each couplet
  - Added `AuthModal` component

### 4. Updated Topics Page
- **File**: `src/app/[locale]/topics/[slug]/page.tsx`
- **Changes**:
  - Added authentication logic for like/bookmark buttons
  - Integrated `useAuthRequired` hook
  - Added click handlers for each couplet
  - Added `AuthModal` component

## Key Features

### Authentication Flow
1. **User clicks like/bookmark button**
2. **System checks authentication status**
3. **If not authenticated**: Shows login modal
4. **If authenticated**: Executes the action (placeholder for now)

### User Experience
- **Tooltips**: Show "Login to like" or "Login to bookmark" for unauthenticated users
- **Consistent behavior**: Same authentication flow across all pages
- **Non-intrusive**: Modal only appears when needed
- **Accessible**: Clear indication of what action requires login

### Technical Implementation
- **Reusable hook**: `useAuthRequired` can be used in any component
- **Type safety**: Proper TypeScript interfaces
- **Error handling**: Graceful fallback if authentication check fails
- **Performance**: Minimal re-renders with proper state management

## Files Modified

1. `src/hooks/useAuthRequired.ts` - New reusable authentication hook
2. `src/components/CoupletCard.tsx` - Updated with authentication logic
3. `src/app/[locale]/couplets/page.tsx` - Added authentication for like/bookmark buttons
4. `src/app/[locale]/topics/[slug]/page.tsx` - Added authentication for like/bookmark buttons

## Usage Example

```typescript
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthModal } from '@/components/ui/AuthModal';

function MyComponent() {
  const { isAuthenticated, showAuthModal, requireAuth, closeAuthModal } = useAuthRequired();

  const handleLikeClick = () => {
    requireAuth(() => {
      // This code only runs if user is authenticated
      console.log('User is authenticated, performing like action');
    });
  };

  return (
    <div>
      <button onClick={handleLikeClick}>
        Like
      </button>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal} 
      />
    </div>
  );
}
```

## Next Steps

1. **Implement actual like/bookmark functionality** for authenticated users
2. **Add visual feedback** (loading states, success/error messages)
3. **Consider adding similar functionality** to other interactive elements
4. **Test across different pages** to ensure consistent behavior
5. **Add analytics** to track login conversion rates

## Testing

To test the implementation:

1. **Visit any page with couplets** (homepage, couplets page, topics page)
2. **Click like or bookmark button** without being logged in
3. **Verify login modal appears**
4. **Close modal and verify** no action was performed
5. **Login and try again** to verify authenticated flow works

The implementation is now complete and ready for testing!
