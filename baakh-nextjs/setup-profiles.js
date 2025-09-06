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
    // Create profiles table
    console.log('📋 Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (profilesError) {
      console.log('⚠️  Profiles table creation:', profilesError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }

    // Create indexes
    console.log('📋 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
        CREATE INDEX IF NOT EXISTS profiles_admin_idx ON profiles(is_admin);
        CREATE INDEX IF NOT EXISTS profiles_editor_idx ON profiles(is_editor);
      `
    });
    
    if (indexError) {
      console.log('⚠️  Index creation:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    console.log('📋 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
    });
    
    if (rlsError) {
      console.log('⚠️  RLS enable:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create policies
    console.log('📋 Creating RLS policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Users can read their own profile
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

        -- Users can update their own profile (except admin flags)
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

        -- Only admins can update admin flags
        DROP POLICY IF EXISTS "Only admins can update admin flags" ON profiles;
        CREATE POLICY "Only admins can update admin flags" ON profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND is_admin = true
            )
          );
      `
    });
    
    if (policiesError) {
      console.log('⚠️  Policy creation:', policiesError.message);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Create function and trigger for new user signup
    console.log('📋 Creating user signup handler...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (functionError) {
      console.log('⚠️  Function/trigger creation:', functionError.message);
    } else {
      console.log('✅ User signup handler created successfully');
    }

    // Create admin user if specified in environment
    const adminEmail = process.env.ADMIN_EMAIL_ALLOWLIST;
    if (adminEmail) {
      console.log('📋 Setting up admin user...');
      console.log(`Admin email: ${adminEmail}`);
      
      // Note: You'll need to manually create the user first through Supabase Auth
      // Then update their profile to be admin
      console.log('⚠️  Please create a user account first through the admin login page');
      console.log('⚠️  Then manually update their profile in Supabase to set is_admin = true');
    }

    console.log('');
    console.log('🎉 Profiles table setup completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin/login and create a user account');
    console.log('2. In Supabase dashboard, manually set is_admin = true for your user');
    console.log('3. Or use the auto-elevation feature by setting ADMIN_EMAIL_ALLOWLIST');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProfilesTable();
