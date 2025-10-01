import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  console.log('=== COUPLETS API ROUTE STARTED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const poetId = searchParams.get('poet_id') || '';
    const poetParam = searchParams.get('poet') || '';
    const categoryId = searchParams.get('category_id') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const lang = searchParams.get('lang') || 'en';
    const standalone = searchParams.get('standalone') === '1';
    
    console.log('Query parameters:', {
      page, limit, search, poetId, categoryId, sortBy, sortOrder, lang, standalone
    });
    
    const supabase = createAdminClient();
    
    // Check if Supabase client is properly configured
    if (!supabase) {
      console.error('Supabase client not properly configured');
      // Graceful fallback for homepage to avoid breaking UI
      return NextResponse.json({
        success: true,
        couplets: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }
    
    const offset = (page - 1) * limit;
    
    // Resolve poet filter to a concrete poet_id (numeric or UUID) if provided
    let resolvedPoetId: string | number | null = null;
    if (poetId) {
      resolvedPoetId = /^[0-9]+$/.test(poetId) ? Number(poetId) : poetId;
    } else if (poetParam) {
      const looksLikeUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(poetParam);
      const looksNumeric = /^[0-9]+$/.test(poetParam);
      if (looksLikeUuid || looksNumeric) {
        resolvedPoetId = looksNumeric ? Number(poetParam) : poetParam;
      } else {
        const { data: poetRow } = await supabase
          .from('poets')
          .select('id, poet_id')
          .eq('poet_slug', poetParam)
          .single();
        if (poetRow) {
          const pid = (poetRow as any).poet_id ?? (poetRow as any).id;
          resolvedPoetId = typeof pid === 'string' && /^[0-9]+$/.test(pid) ? Number(pid) : pid;
        }
      }
    }

    // Build query with joins against poetry_couplets (authoritative table)
    let query = supabase
      .from('poetry_couplets')
      .select(`
        *,
        poets (
          id,
          poet_id,
          poet_slug,
          english_name,
          sindhi_name,
          english_laqab,
          sindhi_laqab,
          is_featured,
          file_url
        ),
        poetry_main (
          id,
          poetry_slug,
          poetry_tags
        )
      `, { count: 'exact' });
    
    // Apply search filter (on couplet_text)
    if (search) {
      query = query.ilike('couplet_text', `%${search}%`);
    }
    
    // Apply poet filter (by resolved poet_id only)
    if (resolvedPoetId != null) {
      query = query.eq('poet_id', resolvedPoetId);
    }
    
    // Category filter not applicable on poetry_couplets; ignore if provided
    
    // Apply standalone filter (poetry_id null or 0)
    if (standalone) {
      query = query.or('poetry_id.is.null,poetry_id.eq.0');
    }

    // Apply language filter unless 'all'
    if (lang && String(lang).toLowerCase() !== 'all') {
      query = query.eq('lang', lang);
    }
    
    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    console.log('Executing Supabase query...');
    let { data: couplets, error, count } = await query;
    
    // If the query with joins fails, try a simpler query without joins
    if (error) {
      console.warn('Query with joins failed, trying simpler query:', error.message);
      
      // Fallback to simple query without joins
      let simpleQuery = supabase
        .from('poetry_couplets')
        .select('*', { count: 'exact' });
      
      // Apply the same filters
      if (search) {
        simpleQuery = simpleQuery.ilike('couplet_text', `%${search}%`);
      }
      
      if (poetId) {
        simpleQuery = simpleQuery.eq('poet_id', poetId);
      }
      
      // ignore categoryId
      
      if (standalone) {
        simpleQuery = simpleQuery.or('poetry_id.is.null,poetry_id.eq.0');
      }

      if (lang && String(lang).toLowerCase() !== 'all') {
        simpleQuery = simpleQuery.eq('lang', lang);
      }
      
      const ascending = sortOrder === 'asc';
      simpleQuery = simpleQuery.order(sortBy, { ascending });
      simpleQuery = simpleQuery.range(offset, offset + limit - 1);
      
      const simpleResult = await simpleQuery;
      couplets = simpleResult.data;
      error = simpleResult.error;
      count = simpleResult.count;
      
      if (error) {
        console.error('Simple query also failed:', error);
        // Graceful fallback: return empty list to keep UI functional
        return NextResponse.json({
          success: true,
          couplets: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        });
      }
    }
    
    // Normalize payload to the shape expected by the frontend
    const normalizedCouplets = (couplets || []).map((c: any) => {
      const text = typeof c.couplet_text === 'string' ? c.couplet_text : '';
      const lines = Array.isArray(c.lines) && c.lines.length > 0
        ? c.lines
        : String(text || '').split('\n').filter((ln: string) => ln.trim()).slice(0, 2);
      const poet = c.poets || c.poet || {};
      const poetName = lang === 'sd' ? (poet.sindhi_name || poet.english_name || 'Poet') : (poet.english_name || poet.sindhi_name || 'Poet');
      const poetSlug = poet.poet_slug || poet.slug || (poet.id != null ? String(poet.id) : '');
      const poetPhoto = poet.file_url || poet.photo || null;
      const tags = Array.isArray(c.couplet_tags) ? c.couplet_tags : (typeof c.couplet_tags === 'string' ? c.couplet_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
      return {
        id: c.id,
        couplet_text: String(text || ''),
        couplet_slug: c.couplet_slug || c.slug || '',
        lang: c.lang || lang,
        lines,
        tags,
        poet: {
          id: poet.id != null ? String(poet.id) : (c.poet_id != null ? String(c.poet_id) : ''),
          name: String(poetName),
          slug: String(poetSlug || ''),
          photo: poetPhoto,
          sindhiName: poet.sindhi_name || null,
          englishName: poet.english_name || null,
          sindhi_laqab: poet.sindhi_laqab || null,
          english_laqab: poet.english_laqab || null
        }
      };
    });

    const response = {
      success: true,
      couplets: normalizedCouplets,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
    
    console.log('Couplets response:', {
      success: response.success,
      coupletsCount: response.couplets.length,
      total: response.total
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Unexpected error in couplets API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== COUPLETS POST API ROUTE STARTED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const supabase = createAdminClient();
    
    const { data: couplet, error } = await supabase
      .from('couplets')
      .insert(body)
      .select(`
        *,
        poets (
          id,
          english_name,
          sindhi_name,
          english_laqab,
          sindhi_laqab
        ),
        categories (
          id,
          english_name,
          sindhi_name
        )
      `)
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          error: 'Database insert failed', 
          details: error.message
        }, 
        { status: 500 }
      );
    }
    
    console.log('Couplet created successfully:', couplet);
    
    return NextResponse.json({
      success: true,
      couplet,
      message: 'Couplet created successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error in couplets POST API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}