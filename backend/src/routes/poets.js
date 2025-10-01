const express = require('express');
const router = express.Router();

// GET /api/poets - Get all poets with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      period = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      lang = 'en',
      countOnly = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = global.supabase
      .from('poets')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      if (lang === 'sd') {
        query = query.or(`sindhi_name.ilike.%${search}%,sindhi_laqab.ilike.%${search}%,sindhi_tagline.ilike.%${search}%`);
      } else {
        query = query.or(`english_name.ilike.%${search}%,english_laqab.ilike.%${search}%,english_tagline.ilike.%${search}%`);
      }
    }

    // Apply period filter (period column doesn't exist, skip for now)
    // TODO: Implement period filtering when period column is added to database
    // if (period) {
    //   query = query.eq('period', period);
    // }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (!countOnly) {
      query = query.range(offset, offset + parseInt(limit) - 1);
    }

    const { data: poets, error, count } = await query;

    if (error) {
      console.error('Error fetching poets:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch poets',
        error: error.message
      });
    }

    // If countOnly, return just the count
    if (countOnly) {
      return res.json({
        success: true,
        total: count || 0
      });
    }

    // Transform poets data to match frontend expectations
    const transformedPoets = poets.map(poet => {
      // Generate slug if it doesn't exist
      let slug = poet.slug;
      if (!slug && poet.english_name) {
        slug = poet.english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      return {
        id: poet.id,
        poet_id: poet.id,
        poet_slug: slug,
        slug: slug,
        sindhi_name: poet.sindhi_name,
        english_name: poet.english_name,
        sindhi_laqab: poet.sindhi_laqab,
        english_laqab: poet.english_laqab,
        sindhi_tagline: poet.sindhi_tagline,
        english_tagline: poet.english_tagline,
        file_url: poet.file_url,
        birth_date: poet.birth_date,
        death_date: poet.death_date,
        birth_place: poet.birth_place,
        death_place: poet.death_place,
        sindhi_details: poet.sindhi_details,
        english_details: poet.english_details,
        period: poet.period,
        tags: poet.tags || [],
        is_active: poet.is_active !== false,
        created_at: poet.created_at,
        updated_at: poet.updated_at
      };
    });

    res.json({
      success: true,
      poets: transformedPoets,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });

  } catch (error) {
    console.error('Error in poets GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/poets/:id - Get single poet by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    // Check if id is a UUID (starts with letters/numbers and has dashes)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    console.log('Looking for poet with id:', id, 'isUUID:', isUUID);
    
    let poet = null;
    let poetError = null;
    
    if (isUUID) {
      // If it's a UUID, search by id
      console.log('Searching by UUID');
      const { data, error } = await global.supabase
        .from('poets')
        .select('*')
        .eq('id', id)
        .single();
      poet = data;
      poetError = error;
    } else {
      // If it's not a UUID, search by slug (case-insensitive)
      console.log('Searching by slug');
      const idLower = String(id).trim().toLowerCase();

      // Try direct slug match first
      // Try direct slug field
      let direct = await global.supabase
        .from('poets')
        .select('*')
        .ilike('slug', idLower)
        .maybeSingle();

      if (!direct.error && direct.data) {
        poet = direct.data;
      }

      // Try poet_slug field if not found
      if (!poet) {
        direct = await global.supabase
          .from('poets')
          .select('*')
          .ilike('poet_slug', idLower)
          .maybeSingle();
        if (!direct.error && direct.data) {
          poet = direct.data;
        }
      }

      if (!poet) {
        // Fallback: generate slug from english_name and compare
        const { data: poets, error } = await global.supabase
          .from('poets')
          .select('*');
        
        if (error) {
          poetError = error;
        } else {
          poet = poets.find(p => {
            const source = (p.slug || p.poet_slug || '').toString().trim().toLowerCase();
            if (source) return source === idLower;
            if (!p.english_name) return false;
            const generatedSlug = String(p.english_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return generatedSlug === idLower;
          });
          
          if (!poet) {
            poetError = { message: 'Poet not found' };
          }
        }
      }
    }

    if (poetError || !poet) {
      return res.status(404).json({
        success: false,
        message: 'Poet not found'
      });
    }

    // Get poet's categories based on poetry_main.category_id linking poets to categories
    // 1) Find distinct category_ids for this poet from poetry_main
    const { data: poetPoetry, error: poetPoetryError } = await global.supabase
      .from('poetry_main')
      .select('category_id')
      .eq('poet_id', poet.id)
      .not('category_id', 'is', null);

    let categories = [];
    let categoriesWithPoetry = [];
    if (!poetPoetryError && Array.isArray(poetPoetry) && poetPoetry.length > 0) {
      const categoryIds = Array.from(new Set(poetPoetry.map(p => p.category_id).filter(Boolean)));
      if (categoryIds.length > 0) {
        // 2) Fetch base category records
        const { data: categoriesBase, error: categoriesBaseError } = await global.supabase
          .from('categories')
          .select('id, slug, content_style')
          .in('id', categoryIds);

        // 3) Fetch category names in both languages
        const { data: categoryDetails, error: categoryDetailsError } = await global.supabase
          .from('category_details')
          .select('cat_id, cat_name, lang')
          .in('cat_id', categoryIds);

        if (!categoriesBaseError && Array.isArray(categoriesBase)) {
          const detailsByCat = (categoryDetails || []).reduce((acc, d) => {
            const key = String(d.cat_id);
            if (!acc[key]) acc[key] = [];
            acc[key].push(d);
            return acc;
          }, {});

          categories = categoriesBase.map(c => {
            const det = detailsByCat[String(c.id)] || [];
            const en = det.find(x => x.lang === 'en');
            const sd = det.find(x => x.lang === 'sd');
            return {
              id: c.id,
              slug: c.slug,
              content_style: c.content_style,
              english_name: en ? en.cat_name : undefined,
              sindhi_name: sd ? sd.cat_name : undefined
            };
          });

          // For each category, fetch up to 4 poetry items for this poet in that category
          const perCategoryPromises = categories.map(async (cat) => {
            const { data: poetryList } = await global.supabase
              .from('poetry_main')
              .select('id, poetry_slug, title, poetry_title, created_at')
              .eq('poet_id', poet.id)
              .eq('category_id', cat.id)
              .order('created_at', { ascending: false })
              .limit(4);
            const items = (poetryList || []).map(p => {
              const rawSlug = String(p.poetry_slug || '').trim();
              const fallbackTitle = rawSlug ? rawSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Untitled';
              return {
                id: p.id,
                poetry_slug: rawSlug,
                title: p.title || p.poetry_title || fallbackTitle
              };
            });
            return { ...cat, poetry: items };
          });
          categoriesWithPoetry = await Promise.all(perCategoryPromises);
        }
      }
    }

    // Get poet's couplets (sample for display)
    // NOTE: The correct column on poetry_couplets is 'poet_id'
    const { data: couplets, error: coupletsError } = await global.supabase
      .from('poetry_couplets')
      .select(`
        id,
        couplet_text,
        couplet_slug,
        couplet_tags,
        lang,
        likes,
        views,
        created_at
      `)
      .eq('poet_id', poet.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Generate slug if it doesn't exist
    let slug = poet.slug;
    if (!slug && poet.english_name) {
      slug = poet.english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Try to update the database with the generated slug
      try {
        const { error: updateError } = await global.supabase
          .from('poets')
          .update({ slug: slug })
          .eq('id', poet.id);
        
        if (updateError) {
          console.log('Failed to update slug in database:', updateError.message);
        } else {
          console.log('Successfully updated slug in database:', slug);
        }
      } catch (error) {
        console.log('Error updating slug:', error.message);
      }
    }

    // Transform poet data
    const transformedPoet = {
      id: poet.id,
      poet_id: poet.id,
      poet_slug: slug,
      slug: slug,
      sindhi_name: poet.sindhi_name,
      english_name: poet.english_name,
      sindhi_laqab: poet.sindhi_laqab,
      english_laqab: poet.english_laqab,
      sindhi_tagline: poet.sindhi_tagline,
      english_tagline: poet.english_tagline,
      file_url: poet.file_url,
      birth_date: poet.birth_date,
      death_date: poet.death_date,
      birth_place: poet.birth_place,
      death_place: poet.death_place,
      sindhi_details: poet.sindhi_details,
      english_details: poet.english_details,
      period: poet.period,
      tags: poet.tags || [],
      is_active: poet.is_active !== false,
      created_at: poet.created_at,
      updated_at: poet.updated_at,
      couplets: couplets || []
    };

    res.json({
      success: true,
      poet: transformedPoet,
      categories: categories || [],
      categoriesWithPoetry: categoriesWithPoetry || []
    });

  } catch (error) {
    console.error('Error in poets GET /:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/poets - Create new poet
router.post('/', async (req, res) => {
  try {
    const {
      sindhi_name,
      english_name,
      sindhi_laqab,
      english_laqab,
      sindhi_tagline,
      english_tagline,
      birth_date,
      death_date,
      birth_place,
      death_place,
      sindhi_details,
      english_details,
      period,
      tags = [],
      file_url
    } = req.body;

    // Validate required fields
    if (!sindhi_name || !english_name) {
      return res.status(400).json({
        success: false,
        message: 'Sindhi name and English name are required'
      });
    }

    // Generate slug from English name
    const slug = english_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: poet, error } = await global.supabase
      .from('poets')
      .insert({
        slug,
        sindhi_name,
        english_name,
        sindhi_laqab,
        english_laqab,
        sindhi_tagline,
        english_tagline,
        birth_date,
        death_date,
        birth_place,
        death_place,
        sindhi_details,
        english_details,
        period,
        tags,
        file_url,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating poet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create poet',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Poet created successfully',
      poet: {
        id: poet.id,
        poet_id: poet.id,
        poet_slug: poet.slug,
        sindhi_name: poet.sindhi_name,
        english_name: poet.english_name,
        sindhi_laqab: poet.sindhi_laqab,
        english_laqab: poet.english_laqab,
        sindhi_tagline: poet.sindhi_tagline,
        english_tagline: poet.english_tagline,
        file_url: poet.file_url,
        birth_date: poet.birth_date,
        death_date: poet.death_date,
        birth_place: poet.birth_place,
        death_place: poet.death_place,
        sindhi_details: poet.sindhi_details,
        english_details: poet.english_details,
        period: poet.period,
        tags: poet.tags || [],
        is_active: poet.is_active,
        created_at: poet.created_at,
        updated_at: poet.updated_at
      }
    });

  } catch (error) {
    console.error('Error in poets POST:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/poets/:id - Update poet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data: poet, error } = await global.supabase
      .from('poets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating poet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update poet',
        error: error.message
      });
    }

    if (!poet) {
      return res.status(404).json({
        success: false,
        message: 'Poet not found'
      });
    }

    res.json({
      success: true,
      message: 'Poet updated successfully',
      poet: {
        id: poet.id,
        poet_id: poet.id,
        poet_slug: poet.slug,
        sindhi_name: poet.sindhi_name,
        english_name: poet.english_name,
        sindhi_laqab: poet.sindhi_laqab,
        english_laqab: poet.english_laqab,
        sindhi_tagline: poet.sindhi_tagline,
        english_tagline: poet.english_tagline,
        file_url: poet.file_url,
        birth_date: poet.birth_date,
        death_date: poet.death_date,
        birth_place: poet.birth_place,
        death_place: poet.death_place,
        sindhi_details: poet.sindhi_details,
        english_details: poet.english_details,
        period: poet.period,
        tags: poet.tags || [],
        is_active: poet.is_active,
        created_at: poet.created_at,
        updated_at: poet.updated_at
      }
    });

  } catch (error) {
    console.error('Error in poets PUT:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/poets/:id - Delete poet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await global.supabase
      .from('poets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting poet:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete poet',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Poet deleted successfully'
    });

  } catch (error) {
    console.error('Error in poets DELETE:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
