# 🚀 Quick Setup Guide

## The 500 Error Issue

The "Poet fetch failed: 500" error occurs because your Supabase database is not configured. Your application is currently using placeholder values instead of real Supabase credentials.

## ✅ Quick Fix

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign up/Login if you haven't already
3. Create a new project or select an existing one
4. Go to **Settings** → **API**
5. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ`)
   - **service_role** key (long string starting with `eyJ`)

### Step 2: Update Environment Variables

Open your `.env.local` file and replace the placeholder values:

```bash
# Replace these placeholder values:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# With your actual Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Restart Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 What This Fixes

- ✅ Eliminates the 500 "Internal Server Error"
- ✅ Enables database connectivity
- ✅ Allows real poet data to be fetched
- ✅ Removes the "Could not parse error response" message

## 🔄 Current Behavior

Right now, your app falls back to mock data when the database isn't configured. After setting up Supabase:

1. **Before**: 500 Error → Mock Data Fallback
2. **After**: Real Database → Real Poet Data

## 🆘 Need Help?

If you don't want to set up Supabase right now, the app will continue working with mock data. The 500 errors will be replaced with 503 "Database not configured" messages, which are handled gracefully.

## 📊 Database Schema

If you want to set up the database tables, check out:
- `setup_timeline_tables.sql` - Database schema
- `ENVIRONMENT_SETUP.md` - Detailed setup guide
