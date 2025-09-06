# Authentication Setup Guide

This guide explains how to set up and configure the authentication system for the admin dashboard.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with authentication enabled
2. **Environment Variables**: Configure the required environment variables
3. **Database Setup**: Run the SQL scripts to create the necessary tables

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_EMAIL_ALLOWLIST=admin@example.com,editor@example.com
AUTO_ELEVATE_ADMINS=true
```

## Database Setup

### 1. Run the Profiles Table Setup

Execute the SQL script in your Supabase SQL editor:

```sql
-- Run the contents of setup_profiles_table.sql
```

This will create:
- `profiles` table with user roles
- Row Level Security policies
- Automatic profile creation on user signup
- Proper indexes for performance

### 2. Create Your First Admin User

After setting up the profiles table, you can create your first admin user:

1. **Sign up normally** through the admin login page
2. **Manually update** the user's profile in Supabase:

```sql
UPDATE profiles 
SET is_admin = true, is_editor = true 
WHERE email = 'your-email@domain.com';
```

Or use the auto-elevation feature by adding your email to `ADMIN_EMAIL_ALLOWLIST`.

## Authentication Flow

### 1. User Login
- User enters credentials on `/admin/login`
- Supabase authenticates the user
- System checks user's admin privileges via `/api/auth/me`
- If authorized, redirects to `/admin`
- If not authorized, shows error message

### 2. Route Protection
- Middleware checks authentication for all `/admin/*` routes
- AdminLayout component verifies user permissions
- ProtectedRoute component provides role-based access control

### 3. Session Management
- Authentication state is managed via `useAuth` hook
- Automatic session refresh and validation
- Proper logout handling with redirects

## Role-Based Access Control

The system supports three user roles:

### Admin
- **Full access** to all admin features
- Can manage user roles and permissions
- Access to settings and system configuration

### Editor
- **Content management** capabilities
- Can create, edit, and delete content
- Access to categories, tags, and poetry management

### Reviewer
- **Read-only** access to analytics
- Content quality assurance
- Limited administrative functions

## Security Features

### 1. Rate Limiting
- Login attempts are limited to 5 per session
- 15-minute lockout after exceeding limit
- Local storage-based tracking

### 2. Row Level Security
- Database-level access control
- Users can only access their own profiles
- Admin flags protected from unauthorized changes

### 3. Service Role Authentication
- Admin privilege checks use service role
- Bypasses RLS for security validation
- Secure API endpoints

## API Endpoints

### `/api/auth/me`
- **Purpose**: Verify user authentication and admin access
- **Method**: GET
- **Response**: User profile and access permissions
- **Security**: Requires valid session cookie

## Components

### AdminLayout
- Main layout wrapper for admin pages
- Handles authentication state
- Provides user profile and logout functionality

### ProtectedRoute
- Route-level access control
- Role-based permission checking
- Customizable fallback content

### useAuth Hook
- Centralized authentication state management
- Automatic session handling
- Provides logout and refresh functions

## Troubleshooting

### Common Issues

1. **"Not authorized for admin access"**
   - Check if user exists in profiles table
   - Verify `is_admin` or `is_editor` flags are set
   - Check environment variable configuration

2. **Middleware redirect loops**
   - Ensure `/admin/login` is excluded from middleware
   - Check Supabase configuration
   - Verify service role key permissions

3. **Profile not created automatically**
   - Check if the database trigger is properly set up
   - Verify Supabase function permissions
   - Check for database errors in logs

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=auth:*
```

## Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Service Role Key**: Keep the service role key secure and server-side only
3. **User Roles**: Regularly audit user permissions
4. **Session Security**: Implement proper session timeout policies
5. **Error Handling**: Provide user-friendly error messages without exposing system details

## Testing

### Test User Creation

1. Create test users with different role combinations
2. Test access control for various admin routes
3. Verify logout and session cleanup
4. Test rate limiting and lockout functionality

### Security Testing

1. Attempt access without authentication
2. Test role escalation attempts
3. Verify RLS policies work correctly
4. Check for information disclosure in error messages

## Support

For issues or questions:
1. Check the Supabase dashboard for authentication logs
2. Review browser console for client-side errors
3. Check server logs for API endpoint errors
4. Verify database permissions and policies
