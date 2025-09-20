const express = require('express');
const router = express.Router();

// GET /api/couplets - Get all couplets with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      lang = 'en',
      sortBy = 'created_at',
      sortOrder = 'desc',
      poet_id = '',
      poetry_id = '',
      standalone = '',
      poetId = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = global.supabase
      .from('poetry_couplets')
      .select(`
        *,
        poets!inner(
          id,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        ),
        poetry_main(
          id,
          poetry_slug,
          poetry_tags
        )
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.ilike('couplet_text', `%${search}%`);
    }

    // Apply language filter
    if (lang) {
      query = query.eq('lang', lang);
    }

    // Apply poet filter (support both poet_id and poetId for compatibility)
    if (poet_id) {
      // Check if poet_id is a UUID (for poets table) or numeric (for couplets table)
      if (poet_id.includes('-')) {
        // UUID - join with poets table to get couplets
        query = query.eq('poets.id', poet_id);
      } else {
        // Numeric ID - direct filter on poet_id
        query = query.eq('poet_id', poet_id);
      }
    } else if (poetId) {
      // Check if poetId is a UUID (for poets table) or numeric (for couplets table)
      if (poetId.includes('-')) {
        // UUID - join with poets table to get couplets
        query = query.eq('poets.id', poetId);
      } else {
        // Numeric ID - direct filter on poet_id
        query = query.eq('poet_id', poetId);
      }
    }

    // Apply poetry filter
    if (poetry_id) {
      query = query.eq('poetry_id', poetry_id);
    }

    // Apply standalone filter (couplets with poetry_id = 0 or null)
    if (standalone === '1') {
      query = query.or('poetry_id.is.null,poetry_id.eq.0');
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: couplets, error, count } = await query;

    if (error) {
      console.error('Error fetching couplets:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch couplets',
        error: error.message
      });
    }

    // Get view counts and like counts for all couplets
    const coupletIds = couplets.map(c => c.id);
    let viewCounts = {};
    let likeCounts = {};
    
    if (coupletIds.length > 0) {
      try {
        // Get view counts
        const { data: viewData, error: viewError } = await global.supabase
          .from('content_view_counts')
          .select('content_id, view_count')
          .eq('content_type', 'couplet')
          .in('content_id', coupletIds);
        
        if (!viewError && viewData) {
          viewCounts = viewData.reduce((acc, item) => {
            acc[item.content_id] = item.view_count;
            return acc;
          }, {});
        }

        // Get like counts
        const { data: likeData, error: likeError } = await global.supabase
          .from('user_likes')
          .select('likeable_id')
          .eq('likeable_type', 'couplet')
          .in('likeable_id', coupletIds);
        
        if (!likeError && likeData) {
          likeCounts = likeData.reduce((acc, item) => {
            acc[item.likeable_id] = (acc[item.likeable_id] || 0) + 1;
            return acc;
          }, {});
        }
      } catch (error) {
        console.warn('Error fetching counts:', error);
      }
    }

    // Transform couplets data to match frontend expectations
    const transformedCouplets = couplets.map(couplet => ({
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      couplet_tags: couplet.couplet_tags,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter(line => line.trim()) : [],
      tags: couplet.couplet_tags ? couplet.couplet_tags.split(',').map(tag => tag.trim()) : [],
      poet: {
        name: couplet.poets?.english_name || couplet.poets?.sindhi_name || 'Unknown',
        id: couplet.poets?.id || '',
        photo: couplet.poets?.file_url || null,
        sindhiName: couplet.poets?.sindhi_name,
        englishName: couplet.poets?.english_name,
        sindhi_laqab: couplet.poets?.sindhi_laqab,
        english_laqab: couplet.poets?.english_laqab
      },
      poetry: couplet.poetry_main ? {
        id: couplet.poetry_main.id,
        slug: couplet.poetry_main.poetry_slug,
        tags: couplet.poetry_main.poetry_tags
      } : null,
      created_at: couplet.created_at,
      likes: likeCounts[couplet.id] || 0,
      views: viewCounts[couplet.id] || 0
    }));

    res.json({
      success: true,
      couplets: transformedCouplets,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });

  } catch (error) {
    console.error('Error in couplets GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/couplets/by-poet/:poetId - Get couplets by specific poet
router.get('/by-poet/:poetId', async (req, res) => {
  try {
    const { poetId } = req.params;
    const {
      page = 1,
      limit = 20,
      lang = 'en',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get poet information first
    const { data: poet, error: poetError } = await global.supabase
      .from('poets')
      .select('id, slug, sindhi_name, english_name, sindhi_laqab, english_laqab, file_url')
      .eq('id', poetId)
      .single();

    if (poetError || !poet) {
      return res.status(404).json({
        success: false,
        message: 'Poet not found'
      });
    }

    // Get couplets for this poet
    let query = global.supabase
      .from('poetry_couplets')
      .select(`
        *,
        poetry_main(
          id,
          poetry_slug,
          poetry_tags
        )
      `, { count: 'exact' })
      .eq('poet_id', poetId);

    // Apply language filter
    if (lang) {
      query = query.eq('lang', lang);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: couplets, error, count } = await query;

    if (error) {
      console.error('Error fetching couplets by poet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch couplets',
        error: error.message
      });
    }

    // Get view counts and like counts for all couplets
    const coupletIds = couplets.map(c => c.id);
    let viewCounts = {};
    let likeCounts = {};
    
    if (coupletIds.length > 0) {
      try {
        // Get view counts
        const { data: viewData, error: viewError } = await global.supabase
          .from('content_view_counts')
          .select('content_id, view_count')
          .eq('content_type', 'couplet')
          .in('content_id', coupletIds);
        
        if (!viewError && viewData) {
          viewCounts = viewData.reduce((acc, item) => {
            acc[item.content_id] = item.view_count;
            return acc;
          }, {});
        }

        // Get like counts
        const { data: likeData, error: likeError } = await global.supabase
          .from('user_likes')
          .select('likeable_id')
          .eq('likeable_type', 'couplet')
          .in('likeable_id', coupletIds);
        
        if (!likeError && likeData) {
          likeCounts = likeData.reduce((acc, item) => {
            acc[item.likeable_id] = (acc[item.likeable_id] || 0) + 1;
            return acc;
          }, {});
        }
      } catch (error) {
        console.warn('Error fetching counts:', error);
      }
    }

    // Transform couplets data
    const transformedCouplets = couplets.map(couplet => ({
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      couplet_tags: couplet.couplet_tags,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter(line => line.trim()) : [],
      tags: couplet.couplet_tags ? couplet.couplet_tags.split(',').map(tag => tag.trim()) : [],
      poet: {
        name: poet.english_name || poet.sindhi_name || 'Unknown',
        slug: poet.slug || '',
        photo: poet.file_url || null
      },
      poetry: couplet.poetry_main ? {
        id: couplet.poetry_main.id,
        slug: couplet.poetry_main.poetry_slug,
        tags: couplet.poetry_main.poetry_tags
      } : null,
      created_at: couplet.created_at,
      likes: likeCounts[couplet.id] || 0,
      views: viewCounts[couplet.id] || 0
    }));

    res.json({
      success: true,
      couplets: transformedCouplets,
      poet: {
        id: poet.id,
        slug: poet.slug,
        name: poet.english_name || poet.sindhi_name,
        sindhi_name: poet.sindhi_name,
        english_name: poet.english_name,
        photo: poet.file_url,
        sindhiName: poet.sindhi_name,
        englishName: poet.english_name,
        sindhi_laqab: poet.sindhi_laqab,
        english_laqab: poet.english_laqab
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error in couplets by poet GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/couplets/:id - Get single couplet by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: couplet, error } = await global.supabase
      .from('poetry_couplets')
      .select(`
        *,
        poets!inner(
          id,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        ),
        poetry_main(
          id,
          poetry_slug,
          poetry_tags
        )
      `)
      .eq('id', id)
      .single();

    if (error || !couplet) {
      return res.status(404).json({
        success: false,
        message: 'Couplet not found'
      });
    }

    // Get view count for this couplet
    let viewCount = 0;
    try {
      const { data: viewData, error: viewError } = await global.supabase
        .from('content_view_counts')
        .select('view_count')
        .eq('content_type', 'couplet')
        .eq('content_id', couplet.id)
        .single();
      
      if (!viewError && viewData) {
        viewCount = viewData.view_count;
      }
    } catch (error) {
      console.warn('Error fetching view count:', error);
    }

    // Transform couplet data
    const transformedCouplet = {
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      couplet_tags: couplet.couplet_tags,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter(line => line.trim()) : [],
      tags: couplet.couplet_tags ? couplet.couplet_tags.split(',').map(tag => tag.trim()) : [],
      poet: {
        name: couplet.poets?.english_name || couplet.poets?.sindhi_name || 'Unknown',
        id: couplet.poets?.id || '',
        photo: couplet.poets?.file_url || null,
        sindhiName: couplet.poets?.sindhi_name,
        englishName: couplet.poets?.english_name,
        sindhi_laqab: couplet.poets?.sindhi_laqab,
        english_laqab: couplet.poets?.english_laqab
      },
      poetry: couplet.poetry_main ? {
        id: couplet.poetry_main.id,
        slug: couplet.poetry_main.poetry_slug,
        tags: couplet.poetry_main.poetry_tags
      } : null,
      created_at: couplet.created_at,
      likes: likeCounts[couplet.id] || 0,
      views: viewCount
    };

    res.json({
      success: true,
      couplet: transformedCouplet
    });

  } catch (error) {
    console.error('Error in couplets GET /:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/couplets - Create new couplet
router.post('/', async (req, res) => {
  try {
    const {
      couplet_text,
      couplet_slug,
      couplet_tags = '',
      lang = 'en',
      poet_id,
      poetry_id = null,
      likes = 0,
      views = 0
    } = req.body;

    // Validate required fields
    if (!couplet_text || !poet_id) {
      return res.status(400).json({
        success: false,
        message: 'Couplet text and poet ID are required'
      });
    }

    // Generate slug if not provided
    const slug = couplet_slug || couplet_text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 50);

    const { data: couplet, error } = await global.supabase
      .from('poetry_couplets')
      .insert({
        couplet_text,
        couplet_slug: slug,
        couplet_tags,
        lang,
        poet_id,
        poetry_id,
        likes,
        views
      })
      .select(`
        *,
        poets!inner(
          id,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating couplet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create couplet',
        error: error.message
      });
    }

    // Get view count for this couplet (should be 0 for new couplets)
    let viewCount = 0;
    try {
      const { data: viewData, error: viewError } = await global.supabase
        .from('content_view_counts')
        .select('view_count')
        .eq('content_type', 'couplet')
        .eq('content_id', couplet.id)
        .single();
      
      if (!viewError && viewData) {
        viewCount = viewData.view_count;
      }
    } catch (error) {
      console.warn('Error fetching view count:', error);
    }

    // Transform couplet data
    const transformedCouplet = {
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      couplet_tags: couplet.couplet_tags,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter(line => line.trim()) : [],
      tags: couplet.couplet_tags ? couplet.couplet_tags.split(',').map(tag => tag.trim()) : [],
      poet: {
        name: couplet.poets?.english_name || couplet.poets?.sindhi_name || 'Unknown',
        id: couplet.poets?.id || '',
        photo: couplet.poets?.file_url || null,
        sindhiName: couplet.poets?.sindhi_name,
        englishName: couplet.poets?.english_name,
        sindhi_laqab: couplet.poets?.sindhi_laqab,
        english_laqab: couplet.poets?.english_laqab
      },
      poetry: null,
      created_at: couplet.created_at,
      likes: likeCounts[couplet.id] || 0,
      views: viewCount
    };

    res.status(201).json({
      success: true,
      message: 'Couplet created successfully',
      couplet: transformedCouplet
    });

  } catch (error) {
    console.error('Error in couplets POST:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/couplets/:id - Update couplet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;

    const { data: couplet, error } = await global.supabase
      .from('poetry_couplets')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        poets!inner(
          id,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          file_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating couplet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update couplet',
        error: error.message
      });
    }

    if (!couplet) {
      return res.status(404).json({
        success: false,
        message: 'Couplet not found'
      });
    }

    // Get view count for this couplet
    let viewCount = 0;
    try {
      const { data: viewData, error: viewError } = await global.supabase
        .from('content_view_counts')
        .select('view_count')
        .eq('content_type', 'couplet')
        .eq('content_id', couplet.id)
        .single();
      
      if (!viewError && viewData) {
        viewCount = viewData.view_count;
      }
    } catch (error) {
      console.warn('Error fetching view count:', error);
    }

    // Transform couplet data
    const transformedCouplet = {
      id: couplet.id,
      couplet_text: couplet.couplet_text,
      couplet_slug: couplet.couplet_slug,
      couplet_tags: couplet.couplet_tags,
      lang: couplet.lang,
      lines: couplet.couplet_text ? couplet.couplet_text.split('\n').filter(line => line.trim()) : [],
      tags: couplet.couplet_tags ? couplet.couplet_tags.split(',').map(tag => tag.trim()) : [],
      poet: {
        name: couplet.poets?.english_name || couplet.poets?.sindhi_name || 'Unknown',
        id: couplet.poets?.id || '',
        photo: couplet.poets?.file_url || null,
        sindhiName: couplet.poets?.sindhi_name,
        englishName: couplet.poets?.english_name,
        sindhi_laqab: couplet.poets?.sindhi_laqab,
        english_laqab: couplet.poets?.english_laqab
      },
      poetry: null,
      created_at: couplet.created_at,
      likes: likeCounts[couplet.id] || 0,
      views: viewCount
    };

    res.json({
      success: true,
      message: 'Couplet updated successfully',
      couplet: transformedCouplet
    });

  } catch (error) {
    console.error('Error in couplets PUT:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/couplets/:id - Delete couplet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await global.supabase
      .from('poetry_couplets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting couplet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete couplet',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Couplet deleted successfully'
    });

  } catch (error) {
    console.error('Error in couplets DELETE:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
