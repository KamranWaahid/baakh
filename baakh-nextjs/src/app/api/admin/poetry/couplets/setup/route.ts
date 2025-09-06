import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    console.log('Setting up system poetry record for standalone couplets...');
    
    // Check if system poetry record already exists
    const { data: existingPoetry, error: checkError } = await supabase
      .from('poetry_main')
      .select('id, poetry_slug, created_at')
      .eq('id', 0)
      .single();
    
    if (existingPoetry) {
      console.log('System poetry record already exists:', existingPoetry);
      return NextResponse.json({ 
        success: true, 
        message: 'System poetry record already exists',
        data: existingPoetry
      });
    }
    
    // Create system poetry record
    const { data: newPoetry, error: createError } = await supabase
      .from('poetry_main')
      .insert({
        id: 0,
        poetry_slug: 'system-standalone-couplets',
        poetry_tags: 'system,standalone,couplets',
        visibility: false,
        is_featured: false,
        category_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create system poetry record:', createError);
      return NextResponse.json({ 
        error: 'Failed to create system poetry record',
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }
    
    console.log('System poetry record created successfully:', newPoetry);
    
    return NextResponse.json({ 
      success: true, 
      message: 'System poetry record created successfully',
      data: newPoetry
    });
    
  } catch (error: any) {
    console.error('Setup endpoint error:', error);
    return NextResponse.json({ 
      error: 'Setup failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Check if system poetry record exists
    const { data: existingPoetry, error: checkError } = await supabase
      .from('poetry_main')
      .select('id, poetry_slug, poetry_tags, visibility, is_featured, category_id, created_at')
      .eq('id', 0)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json({ 
        exists: false,
        message: 'System poetry record does not exist'
      });
    }
    
    if (existingPoetry) {
      return NextResponse.json({ 
        exists: true,
        message: 'System poetry record exists',
        data: existingPoetry
      });
    }
    
    return NextResponse.json({ 
      exists: false,
      message: 'Unknown status'
    });
    
  } catch (error: any) {
    console.error('Check endpoint error:', error);
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error.message 
    }, { status: 500 });
  }
}
