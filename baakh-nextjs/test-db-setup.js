const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://uhbqcaxwfossrjwusclc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('e2ee_users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Error accessing e2ee_users table:', error.message);
      
      if (error.code === '42P01') {
        console.log('❌ Table e2ee_users does not exist');
        console.log('You need to run the SQL schema in Supabase');
      } else if (error.code === '42501') {
        console.log('❌ Permission denied for table e2ee_users');
        console.log('You need to run the SQL schema in Supabase');
      }
      
      return false;
    }
    
    console.log('✅ Table e2ee_users exists and is accessible');
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function createTables() {
  console.log('\nAttempting to create tables...');
  
  try {
    // Create e2ee_users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.e2ee_users (
          user_id uuid primary key default gen_random_uuid(),
          created_at timestamptz not null default now(),
          username text unique not null,
          password_salt bytea not null,
          password_verifier bytea not null,
          profile_cipher bytea not null,
          profile_nonce bytea not null,
          profile_aad text not null,
          master_key_cipher bytea not null,
          master_key_nonce bytea not null,
          kdf_params jsonb not null,
          version int not null default 1
        );
      `
    });
    
    if (usersError) {
      console.log('❌ Failed to create e2ee_users table:', usersError.message);
      return false;
    }
    
    console.log('✅ Created e2ee_users table');
    
    // Create e2ee_user_data table
    const { error: dataError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.e2ee_user_data (
          record_id uuid primary key default gen_random_uuid(),
          user_id uuid not null references public.e2ee_users(user_id) on delete cascade,
          type text not null check (type in ('like', 'bookmark')),
          target_id text not null,
          target_type text not null check (target_type in ('poem', 'poet', 'couplet')),
          metadata_cipher bytea not null,
          metadata_nonce bytea not null,
          metadata_aad text not null,
          created_at timestamptz not null default now(),
          version int not null default 1
        );
      `
    });
    
    if (dataError) {
      console.log('❌ Failed to create e2ee_user_data table:', dataError.message);
      return false;
    }
    
    console.log('✅ Created e2ee_user_data table');
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        alter table public.e2ee_users enable row level security;
        alter table public.e2ee_user_data enable row level security;
      `
    });
    
    if (rlsError) {
      console.log('❌ Failed to enable RLS:', rlsError.message);
    } else {
      console.log('✅ Enabled RLS on tables');
    }
    
    return true;
  } catch (err) {
    console.log('❌ Failed to create tables:', err.message);
    return false;
  }
}

async function main() {
  console.log('=== E2EE Database Setup Test ===\n');
  
  const tableExists = await testConnection();
  
  if (!tableExists) {
    console.log('\nTables do not exist. You need to create them manually in Supabase SQL Editor.');
    console.log('\nGo to: https://uhbqcaxwfossrjwusclc.supabase.co/project/default/sql');
    console.log('And run the SQL schema provided in the instructions.');
    
    // Try to create tables automatically (this might not work due to permissions)
    console.log('\nAttempting automatic table creation...');
    const created = await createTables();
    
    if (created) {
      console.log('\n✅ Tables created successfully!');
      console.log('You can now test the signup functionality.');
    } else {
      console.log('\n❌ Automatic table creation failed.');
      console.log('Please create the tables manually in Supabase SQL Editor.');
    }
  } else {
    console.log('\n✅ Database is ready!');
    console.log('You can now test the signup functionality.');
  }
}

main().catch(console.error);
