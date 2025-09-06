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
    // Create the profiles table using raw SQL
    console.log('📋 Creating profiles table...');
    
    const createTableSQL = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.log('⚠️  Could not create table using exec_sql:', createError.message);
      console.log('📋 Trying alternative approach...');
      
      // Try to create the table by inserting a dummy record (this will create the table if it doesn't exist)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'dummy@example.com',
          display_name: 'Dummy User'
        });
      
      if (insertError && insertError.message.includes('relation "profiles" does not exist')) {
        console.log('❌ Profiles table does not exist and cannot be created programmatically');
        console.log('📋 Please run the following SQL in your Supabase SQL editor:');
        console.log('');
        console.log(createTableSQL);
        console.log('');
        console.log('📋 Or manually create the table in the Supabase dashboard');
        return;
      } else if (insertError) {
        console.log('⚠️  Unexpected error:', insertError.message);
      } else {
        console.log('✅ Table created successfully through insert');
        // Clean up the dummy record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } else {
      console.log('✅ Profiles table created successfully');
    }

    // Create indexes
    console.log('📋 Creating indexes...');
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
      CREATE INDEX IF NOT EXISTS profiles_admin_idx ON profiles(is_admin);
      CREATE INDEX IF NOT EXISTS profiles_editor_idx ON profiles(is_editor);
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: indexSQL });
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.log('⚠️  Could not create indexes:', error.message);
    }

    // Enable RLS
    console.log('📋 Enabling Row Level Security...');
    try {
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' });
      console.log('✅ RLS enabled successfully');
    } catch (error) {
      console.log('⚠️  Could not enable RLS:', error.message);
    }

    // Create policies
    console.log('📋 Creating RLS policies...');
    const policiesSQL = `
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
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: policiesSQL });
      console.log('✅ RLS policies created successfully');
    } catch (error) {
      console.log('⚠️  Could not create policies:', error.message);
    }

    // Create function and trigger
    console.log('📋 Creating user signup handler...');
    const functionSQL = `
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
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: functionSQL });
      console.log('✅ User signup handler created successfully');
    } catch (error) {
      console.log('⚠️  Could not create function/trigger:', error.message);
    }

    // Check if admin user exists and create if needed
    console.log('📋 Setting up admin user...');
    const adminEmail = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',')[0]?.trim();
    
    if (adminEmail) {
      console.log(`Admin email: ${adminEmail}`);
      
      // Check if user exists in auth
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('⚠️  Could not check auth users:', authError.message);
      } else {
        const adminUser = users.find(u => u.email === adminEmail);
        
        if (adminUser) {
          console.log(`✅ Found admin user: ${adminUser.id}`);
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', adminUser.id)
            .single();
          
          if (profileError && profileError.message.includes('No rows found')) {
            // Create profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: adminUser.id,
                email: adminEmail,
                display_name: adminEmail.split('@')[0],
                is_admin: true,
                is_editor: true
              });
            
            if (insertError) {
              console.log('⚠️  Could not create admin profile:', insertError.message);
            } else {
              console.log('✅ Admin profile created successfully');
            }
          } else if (profileError) {
            console.log('⚠️  Error checking profile:', profileError.message);
          } else {
            // Update existing profile to ensure admin status
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ is_admin: true, is_editor: true })
              .eq('id', adminUser.id);
            
            if (updateError) {
              console.log('⚠️  Could not update admin profile:', updateError.message);
            } else {
              console.log('✅ Admin profile updated successfully');
            }
          }
        } else {
          console.log('⚠️  Admin user not found in auth system');
          console.log('📋 Please create a user account first through the admin login page');
        }
      }
    } else {
      console.log('⚠️  No admin email configured in ADMIN_EMAIL_ALLOWLIST');
    }

    console.log('');
    console.log('🎉 Profiles table setup completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin/login and sign in with your admin credentials');
    console.log('2. If you encounter issues, check the browser console for errors');
    console.log('3. The auto-elevation feature should now work for configured admin emails');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProfilesTable();
