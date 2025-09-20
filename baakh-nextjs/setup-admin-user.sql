-- Setup Admin User Script
-- Run this in your Supabase SQL Editor after creating a user in Supabase Auth

-- 1. First, create a user in Supabase Auth (Authentication → Users → Add user)
-- 2. Then run this script to create the admin profile

-- Replace 'your-user-id-here' with the actual user ID from Supabase Auth
-- You can find the user ID in the Supabase Dashboard → Authentication → Users

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name text,
    avatar_url text,
    is_admin boolean DEFAULT false,
    is_editor boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage all profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Insert admin profile (replace with your actual user ID)
INSERT INTO public.profiles (id, display_name, is_admin, is_editor)
VALUES (
    'your-user-id-here', -- Replace with actual user ID
    'Admin User',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    is_editor = true,
    updated_at = now();

-- Verify the profile was created
SELECT 
    id,
    display_name,
    is_admin,
    is_editor,
    created_at
FROM public.profiles 
WHERE is_admin = true;

-- Optional: Create additional admin users
-- INSERT INTO public.profiles (id, display_name, is_admin, is_editor)
-- VALUES (
--     'another-user-id-here',
--     'Another Admin',
--     true,
--     true
-- ) ON CONFLICT (id) DO UPDATE SET
--     is_admin = true,
--     is_editor = true,
--     updated_at = now();



