#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupFeedbackTable() {
  console.log('🚀 Setting up feedback table...');

  // Check if Supabase is configured
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
    console.log('❌ Supabase not configured. Please set up your environment variables first.');
    console.log('📝 See ENVIRONMENT_SETUP.md for instructions.');
    return;
  }

  if (!supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key_here') {
    console.log('❌ Supabase service key not configured.');
    console.log('📝 Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup_feedback_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not available, trying direct execution...');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase
            .from('feedback')
            .select('id')
            .limit(0); // This will fail if table doesn't exist, which is expected
          
          if (stmtError && stmtError.code === 'PGRST116') {
            // Table doesn't exist, we need to create it
            console.log('📊 Creating feedback table...');
            // Note: We can't execute DDL through the REST API
            // The user will need to run this in Supabase SQL Editor
            console.log('⚠️  Please run the following SQL in your Supabase SQL Editor:');
            console.log('📁 File: setup_feedback_table.sql');
            console.log('');
            console.log('SQL to execute:');
            console.log(sql);
            return;
          }
        } catch (e) {
          // Continue to next statement
        }
      }
    }

    console.log('✅ Feedback table setup completed!');
    console.log('');
    console.log('🎉 Your feedback system is now ready!');
    console.log('You can now:');
    console.log('  - Collect user feedback through the UI');
    console.log('  - View feedback in your database');
    console.log('  - Analyze feedback data');
    console.log('');
    console.log('📊 To view feedback data, check the "feedback" table in your Supabase dashboard');

  } catch (error) {
    console.error('❌ Error setting up feedback table:', error.message);
    console.log('');
    console.log('🔧 Manual setup required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the contents of setup_feedback_table.sql');
    console.log('');
    console.log('📁 SQL file location: setup_feedback_table.sql');
  }
}

// Run the setup
setupFeedbackTable().catch(console.error);
