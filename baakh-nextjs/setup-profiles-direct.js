const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProfilesTable() {
  console.log('🚀 Setting up profiles table for authentication...');
  
  try {
    // First, let's check if the profiles table already exists
    console.log('📋 Checking if profiles table exists...');
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (checkError) {
      console.log('⚠️  Could not check existing tables:', checkError.message);
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Profiles table already exists');
    } else {
      console.log('📋 Profiles table does not exist, creating...');
      
      // Try to create the table using a different approach
      // We'll need to use the SQL editor in Supabase dashboard or create it manually
      console.log('⚠️  Cannot create table programmatically without exec_sql function');
      console.log('📋 Please run the following SQL in your Supabase SQL editor:');
      console.log('');
      console.log(`
-- Create profiles table for user authentication and admin roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_editor BOOLEAN DEFAULT FALSE,
    is_reviewer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_admin_idx ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS profiles_editor_idx ON profiles(is_editor);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except admin flags)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Only admins can update admin flags
CREATE POLICY "Only admins can update admin flags" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `);
      console.log('');
      console.log('📋 After running the SQL above:');
      console.log('1. Go to /admin/login and create a user account');
      console.log('2. In Supabase dashboard, manually set is_admin = true for your user');
      console.log('3. Or use the auto-elevation feature by setting ADMIN_EMAIL_ALLOWLIST');
      return;
    }

    // If table exists, let's check if we can insert a test record
    console.log('📋 Testing table access...');
    try {
      const { error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('⚠️  Table access test failed:', testError.message);
        console.log('📋 This might indicate RLS policies are too restrictive');
      } else {
        console.log('✅ Table access test successful');
      }
    } catch (error) {
      console.log('⚠️  Table access test failed:', error.message);
    }

    console.log('');
    console.log('🎉 Profiles table setup check completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin/login and create a user account');
    console.log('2. In Supabase dashboard, manually set is_admin = true for your user');
    console.log('3. Or use the auto-elevation feature by setting ADMIN_EMAIL_ALLOWLIST');
    
  } catch (error) {
    console.error('❌ Setup check failed:', error);
    process.exit(1);
  }
}

setupProfilesTable();
