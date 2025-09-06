# Signup Flow with Sindhi Name Collection

## Overview

This document describes the new signup flow that collects the user's Sindhi name after successful registration and saves it to both the Sindhi table (poets) and the e2ee_users table.

## Flow Description

### 1. User Registration
- User fills out signup form with email, name, and password
- System creates E2EE user account
- User is redirected to Sindhi name collection page

### 2. Sindhi Name Collection
- **Page**: `/signup-name` (English) or `/sd/signup-name` (Sindhi)
- **Content**: Single centered input box asking for Sindhi name
- **Validation**: Minimum 2 characters required
- **Multi-lingual**: Supports both English and Sindhi interfaces

### 3. Data Storage
- **Sindhi Table**: Saves to `poets` table with `name` and `name_sd` fields
- **E2EE Users**: Updates `e2ee_users` table with `sindhi_name` field
- **Profiles**: Optionally updates `profiles` table if it exists

### 4. Completion
- User is redirected to dashboard (`/dashboard` or `/sd/dashboard`)
- Full authentication is now complete

## Files Created/Modified

### New Files
- `src/app/signup-name/page.tsx` - English signup name page
- `src/app/sd/signup-name/page.tsx` - Sindhi signup name page
- `src/app/api/auth/save-sindhi-name/route.ts` - API endpoint
- `src/app/dashboard/page.tsx` - English dashboard
- `src/app/sd/dashboard/page.tsx` - Sindhi dashboard
- `supabase/add_sindhi_name_to_e2ee.sql` - Database migration

### Modified Files
- `src/hooks/useE2EEAuth-new.ts` - Updated signup flow
- `src/components/login-form.tsx` - Added redirect logic

## Database Changes

### E2EE Users Table
```sql
ALTER TABLE public.e2ee_users 
ADD COLUMN IF NOT EXISTS sindhi_name text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

### Poets Table
The existing `poets` table is used to store:
- `id` - User ID (UUID)
- `name` - Sindhi name
- `name_sd` - Sindhi name (duplicate for consistency)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## API Endpoints

### POST `/api/auth/save-sindhi-name`
**Request Body:**
```json
{
  "userId": "uuid",
  "sindhiName": "string",
  "language": "en|sd"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success message in appropriate language",
  "sindhiName": "Saved name"
}
```

## Multi-lingual Support

### English Interface
- Title: "Add Your Sindhi Name"
- Description: "Enter your Sindhi name that will be used in your poetry"
- Label: "Sindhi Name"
- Button: "Next"
- Placeholder: "Example: Shah Abdul Latif"

### Sindhi Interface
- Title: "سندي نالو شامل ڪريو"
- Description: "پنهنجو سندي نالو داخل ڪريو جيڪو توهان جي شاعري ۾ استعمال ٿيندو"
- Label: "سندي نالو"
- Button: "اڳتي"
- Placeholder: "مثال: شاھ عبداللطيف"

## Error Handling

### Validation Errors
- Empty name: "Please enter your Sindhi name" / "سندي نالو داخل ڪريو"
- Too short: "Sindhi name must be at least 2 characters" / "سندي نالو گهٽ ۾ گهٽ 2 حرف هجڻ گهرجي"

### System Errors
- Database errors: "Error: Could not save Sindhi name" / "خطا: سندي نالو محفوظ نه ٿي سگهيو"
- API errors: "Failed to save Sindhi name"

## Security Features

- **Input Validation**: Server-side validation of Sindhi name
- **User Authentication**: Only authenticated users can access
- **Database Permissions**: Proper RLS policies in place
- **Error Logging**: Comprehensive error logging for debugging

## Usage Examples

### 1. User Signs Up
```typescript
const result = await signup(username, password, profile);
// result.needsSindhiName = true
// result.userId = "uuid"
```

### 2. Redirect to Name Collection
```typescript
router.push(`/signup-name?userId=${result.userId}`);
```

### 3. Save Sindhi Name
```typescript
const response = await fetch('/api/auth/save-sindhi-name', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, sindhiName, language })
});
```

## Future Enhancements

1. **Profile Completion**: Add more profile fields after Sindhi name
2. **Avatar Upload**: Allow users to upload profile pictures
3. **Preferences**: Collect user preferences for poetry display
4. **Onboarding**: Multi-step onboarding process
5. **Social Features**: Connect with other poets

## Testing

### Test Cases
1. **Valid Signup**: Complete flow from signup to dashboard
2. **Invalid Names**: Test validation for empty/short names
3. **Language Switching**: Test both English and Sindhi interfaces
4. **Error Handling**: Test database connection failures
5. **Authentication**: Test access control for unauthenticated users

### Test Data
- Valid Sindhi names: "شاھ عبداللطيف", "سچل سرمست", "بيدل"
- Invalid names: "", "a", "{}", "null"

## Deployment Notes

1. **Database Migration**: Run `add_sindhi_name_to_e2ee.sql` first
2. **Environment Variables**: Ensure Supabase credentials are set
3. **Build Process**: No special build requirements
4. **Rollback**: Migration can be safely rolled back if needed
