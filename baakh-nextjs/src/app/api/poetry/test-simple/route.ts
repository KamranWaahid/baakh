export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    console.log('Testing basic database connection...');
    
    // Test 1: Try to access any table
    const { data: anyTableData, error: anyTableError } = await supabase
      .from('poets')
      .select('poet_id')
      .limit(1);
    
    console.log('Any table access result:', { data: anyTableData, error: anyTableError });
    
    // Test 2: Try to access with different approach
    const { data: rawData, error: rawError } = await supabase
      .rpc('get_poets_count');
    
    console.log('RPC call result:', { data: rawData, error: rawError });
    
    // Test 3: Check if we can list tables
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    console.log('Tables list result:', { data: tablesData, error: tablesError });
    
    // Test 4: Try to access with raw SQL (if possible)
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('exec_sql', { sql_query: 'SELECT COUNT(*) FROM poets' });
    
    console.log('Raw SQL result:', { data: sqlData, error: sqlError });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      tests: {
        any_table_access: { success: !anyTableError, data: anyTableData, error: anyTableError },
        rpc_call: { success: !rawError, data: rawData, error: rawError },
        tables_list: { success: !tablesError, data: tablesData, error: tablesError },
        raw_sql: { success: !sqlError, data: sqlData, error: sqlError }
      },
      recommendation: 'Check database user permissions and RLS policies'
    });
    
  } catch (error) {
    console.error('Simple test endpoint error:', error);
    return NextResponse.json({
      error: 'Simple test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
