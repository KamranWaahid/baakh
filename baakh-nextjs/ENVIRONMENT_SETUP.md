# Environment Setup Guide

## 🚨 **CRITICAL: Fix "Invalid login credentials" Error**

The "Invalid login credentials" error occurs because Supabase environment variables are not configured. Follow these steps to fix it:

## 📋 **Step 1: Create Environment File**

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security Configuration
CSRF_SECRET=your-super-secret-csrf-key-here-make-it-at-least-32-characters-long

# Admin Configuration (Optional - for auto-elevation)
ADMIN_EMAIL_ALLOWLIST=admin@example.com,your-email@example.com
AUTO_ELEVATE_ADMINS=true

# Security Alerts (Optional)
ADMIN_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
SECURITY_WEBHOOK_URL=https://your-webhook-endpoint.com/security
```

## 🔑 **Step 2: Get Supabase Credentials**

### Option A: If you have a Supabase project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Option B: Create a new Supabase project
1. Go to [Supabase](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Create a new project
5. Wait for the project to be ready
6. Get the credentials from Settings → API

## 🛠️ **Step 3: Generate CSRF Secret**

Generate a secure CSRF secret:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## 🗄️ **Step 4: Set Up Database**

Run the database migration to create the necessary tables:

```sql
-- Execute this in your Supabase SQL Editor
-- File: migrations/security_tables.sql
```

## 👤 **Step 5: Create Admin User**

### Method 1: Through Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Go to Database → profiles table
5. Insert a record with `is_admin: true`

### Method 2: Using SQL
```sql
-- Insert admin user profile
INSERT INTO profiles (id, is_admin, is_editor, display_name)
VALUES (
  'your-user-id-here',
  true,
  true,
  'Admin User'
);
```

## 🔧 **Step 6: Test the Setup**

1. Restart your development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Go to `/admin/login`
3. Try logging in with your admin credentials

## 🐛 **Troubleshooting**

### Error: "Invalid login credentials"
- ✅ Check that environment variables are set correctly
- ✅ Verify Supabase URL and keys are correct
- ✅ Ensure the user exists in Supabase Auth
- ✅ Check that the user has a profile with `is_admin: true`

### Error: "Supabase not configured"
- ✅ Verify `.env.local` file exists
- ✅ Check that all required environment variables are set
- ✅ Restart the development server

### Error: "Access denied"
- ✅ Check that the user has `is_admin: true` in the profiles table
- ✅ Verify the user email is in the allowlist (if using auto-elevation)

## 📝 **Environment Variables Reference**

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `CSRF_SECRET` | ✅ | Secret key for CSRF protection |
| `ADMIN_EMAIL_ALLOWLIST` | ❌ | Comma-separated list of admin emails |
| `AUTO_ELEVATE_ADMINS` | ❌ | Set to "true" to auto-elevate users |
| `ADMIN_EMAIL` | ❌ | Email for security alerts |
| `SLACK_WEBHOOK_URL` | ❌ | Slack webhook for alerts |
| `SECURITY_WEBHOOK_URL` | ❌ | Custom webhook for security events |

## 🚀 **Quick Start Commands**

```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit the environment file with your values
nano .env.local

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

## ✅ **Verification Checklist**

- [ ] `.env.local` file created with all required variables
- [ ] Supabase project created and credentials obtained
- [ ] Database migration executed
- [ ] Admin user created in Supabase Auth
- [ ] Admin profile created with `is_admin: true`
- [ ] Development server restarted
- [ ] Login page accessible at `/admin/login`
- [ ] Can successfully log in with admin credentials

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. Check the browser console for detailed error messages
2. Check the terminal/console for server-side errors
3. Verify your Supabase project is active and not paused
4. Ensure your database tables are created correctly
5. Check that RLS policies are set up properly

The most common issue is missing or incorrect environment variables. Double-check that all required variables are set correctly in your `.env.local` file.



