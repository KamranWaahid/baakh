#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createFeedbackTable() {
  console.log('🚀 Creating feedback table...');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Feedback table already exists!');
      return;
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    console.log('📊 Table does not exist, creating it...');
    console.log('');
    console.log('⚠️  Manual setup required:');
    console.log('1. Go to your Supabase Dashboard: https://app.supabase.com/project/uhbqcaxwfossrjwusclc');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL:');
    console.log('');
    console.log('-- Create feedback table');
    console.log('CREATE TABLE IF NOT EXISTS public.feedback (');
    console.log('  id bigint generated always as identity not null,');
    console.log('  rating integer not null,');
    console.log('  comment text null,');
    console.log('  created_at timestamp with time zone null default now(),');
    console.log('  ip_hash text null,');
    console.log('  constraint feedback_pkey primary key (id),');
    console.log('  constraint feedback_rating_check check (');
    console.log('    (rating >= 1) and (rating <= 5)');
    console.log('  )');
    console.log(');');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS feedback_ip_hash_idx ON public.feedback USING btree (ip_hash);');
    console.log('CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback USING btree (created_at DESC);');
    console.log('');
    console.log('-- Enable RLS');
    console.log('ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create policies');
    console.log('CREATE POLICY "Allow public feedback submission" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);');
    console.log('CREATE POLICY "Allow reading feedback" ON public.feedback FOR SELECT TO authenticated USING (true);');
    console.log('');
    console.log('-- Grant permissions');
    console.log('GRANT INSERT ON public.feedback TO anon, authenticated;');
    console.log('GRANT SELECT ON public.feedback TO authenticated;');
    console.log('GRANT USAGE ON SEQUENCE public.feedback_id_seq TO anon, authenticated;');
    console.log('');
    console.log('🎯 After running the SQL, your feedback system will be fully functional!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createFeedbackTable();
