const express = require('express');
const router = express.Router();

// GET /api/timeline/periods - Get all timeline periods with pagination and filtering
router.get('/periods', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      lang = 'en',
      sortBy = 'start_year',
      sortOrder = 'asc',
      featured = false,
      countOnly = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = global.supabase
      .from('timeline_periods')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      if (lang === 'sd') {
        query = query.or(`sindhi_name.ilike.%${search}%,sindhi_description.ilike.%${search}%`);
      } else {
        query = query.or(`english_name.ilike.%${search}%,english_description.ilike.%${search}%`);
      }
    }

    // Apply featured filter
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (!countOnly) {
      query = query.range(offset, offset + parseInt(limit) - 1);
    }

    const { data: periods, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline periods:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline periods',
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

    // Transform periods data
    const transformedPeriods = periods.map(period => ({
      id: period.id,
      period_slug: period.period_slug,
      start_year: period.start_year,
      end_year: period.end_year,
      is_ongoing: period.is_ongoing,
      name: lang === 'sd' ? period.sindhi_name : period.english_name,
      description: lang === 'sd' ? period.sindhi_description : period.english_description,
      characteristics: lang === 'sd' ? period.sindhi_characteristics : period.english_characteristics,
      color_code: period.color_code,
      icon_name: period.icon_name,
      is_featured: period.is_featured,
      sort_order: period.sort_order,
      created_at: period.created_at,
      updated_at: period.updated_at
    }));

    res.json({
      success: true,
      periods: transformedPeriods,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });

  } catch (error) {
    console.error('Error in timeline periods GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/timeline/periods/:id - Get single timeline period by ID
router.get('/periods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const { data: period, error } = await global.supabase
      .from('timeline_periods')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !period) {
      return res.status(404).json({
        success: false,
        message: 'Timeline period not found'
      });
    }

    // Transform period data
    const transformedPeriod = {
      id: period.id,
      period_slug: period.period_slug,
      start_year: period.start_year,
      end_year: period.end_year,
      is_ongoing: period.is_ongoing,
      name: lang === 'sd' ? period.sindhi_name : period.english_name,
      description: lang === 'sd' ? period.sindhi_description : period.english_description,
      characteristics: lang === 'sd' ? period.sindhi_characteristics : period.english_characteristics,
      color_code: period.color_code,
      icon_name: period.icon_name,
      is_featured: period.is_featured,
      sort_order: period.sort_order,
      created_at: period.created_at,
      updated_at: period.updated_at
    };

    res.json({
      success: true,
      period: transformedPeriod
    });

  } catch (error) {
    console.error('Error in timeline period GET /:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/timeline/periods - Create new timeline period
router.post('/periods', async (req, res) => {
  try {
    const {
      period_slug,
      start_year,
      end_year,
      is_ongoing = false,
      sindhi_name,
      sindhi_description,
      sindhi_characteristics = [],
      english_name,
      english_description,
      english_characteristics = [],
      color_code = '#3B82F6',
      icon_name,
      is_featured = false,
      sort_order = 0
    } = req.body;

    // Validate required fields
    if (!period_slug || !start_year || !sindhi_name || !english_name) {
      return res.status(400).json({
        success: false,
        message: 'Period slug, start year, and names in both languages are required'
      });
    }

    const { data: period, error } = await global.supabase
      .from('timeline_periods')
      .insert({
        period_slug,
        start_year,
        end_year,
        is_ongoing,
        sindhi_name,
        sindhi_description,
        sindhi_characteristics,
        english_name,
        english_description,
        english_characteristics,
        color_code,
        icon_name,
        is_featured,
        sort_order
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline period:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create timeline period',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Timeline period created successfully',
      period: period
    });

  } catch (error) {
    console.error('Error in timeline period POST:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/timeline/periods/:id - Update timeline period
router.put('/periods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;

    const { data: period, error } = await global.supabase
      .from('timeline_periods')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline period:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update timeline period',
        error: error.message
      });
    }

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Timeline period not found'
      });
    }

    res.json({
      success: true,
      message: 'Timeline period updated successfully',
      period: period
    });

  } catch (error) {
    console.error('Error in timeline period PUT:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/timeline/periods/:id - Delete timeline period (soft delete)
router.delete('/periods/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await global.supabase
      .from('timeline_periods')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting timeline period:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete timeline period',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Timeline period deleted successfully'
    });

  } catch (error) {
    console.error('Error in timeline period DELETE:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/timeline/events - Get all timeline events with pagination and filtering
router.get('/events', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      lang = 'en',
      sortBy = 'event_year',
      sortOrder = 'desc',
      event_type = '',
      period_id = '',
      poet_id = '',
      featured = false,
      countOnly = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query with joins
    let query = global.supabase
      .from('timeline_events')
      .select(`
        *,
        timeline_periods!left(
          id,
          period_slug,
          sindhi_name,
          english_name,
          color_code
        ),
        poets!left(
          id,
          poet_slug,
          sindhi_name,
          english_name,
          file_url
        )
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      if (lang === 'sd') {
        query = query.or(`sindhi_title.ilike.%${search}%,sindhi_description.ilike.%${search}%`);
      } else {
        query = query.or(`english_title.ilike.%${search}%,english_description.ilike.%${search}%`);
      }
    }

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (period_id) {
      query = query.eq('period_id', period_id);
    }
    if (poet_id) {
      query = query.eq('poet_id', poet_id);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (!countOnly) {
      query = query.range(offset, offset + parseInt(limit) - 1);
    }

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline events:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline events',
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

    // Transform events data
    const transformedEvents = events.map(event => ({
      id: event.id,
      event_slug: event.event_slug,
      event_date: event.event_date,
      event_year: event.event_year,
      is_approximate: event.is_approximate,
      title: lang === 'sd' ? event.sindhi_title : event.english_title,
      description: lang === 'sd' ? event.sindhi_description : event.english_description,
      location: lang === 'sd' ? event.sindhi_location : event.english_location,
      event_type: event.event_type,
      importance_level: event.importance_level,
      tags: event.tags,
      color_code: event.color_code,
      icon_name: event.icon_name,
      is_featured: event.is_featured,
      sort_order: event.sort_order,
      period: event.timeline_periods ? {
        id: event.timeline_periods.id,
        slug: event.timeline_periods.period_slug,
        name: lang === 'sd' ? event.timeline_periods.sindhi_name : event.timeline_periods.english_name,
        color_code: event.timeline_periods.color_code
      } : null,
      poet: event.poets ? {
        id: event.poets.id,
        slug: event.poets.poet_slug,
        name: lang === 'sd' ? event.poets.sindhi_name : event.poets.english_name,
        photo: event.poets.file_url
      } : null,
      created_at: event.created_at,
      updated_at: event.updated_at
    }));

    res.json({
      success: true,
      events: transformedEvents,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });

  } catch (error) {
    console.error('Error in timeline events GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/timeline/events/:id - Get single timeline event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const { data: event, error } = await global.supabase
      .from('timeline_events')
      .select(`
        *,
        timeline_periods!left(
          id,
          period_slug,
          sindhi_name,
          english_name,
          color_code
        ),
        poets!left(
          id,
          poet_slug,
          sindhi_name,
          english_name,
          file_url
        )
      `)
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Transform event data
    const transformedEvent = {
      id: event.id,
      event_slug: event.event_slug,
      event_date: event.event_date,
      event_year: event.event_year,
      is_approximate: event.is_approximate,
      title: lang === 'sd' ? event.sindhi_title : event.english_title,
      description: lang === 'sd' ? event.sindhi_description : event.english_description,
      location: lang === 'sd' ? event.sindhi_location : event.english_location,
      event_type: event.event_type,
      importance_level: event.importance_level,
      tags: event.tags,
      color_code: event.color_code,
      icon_name: event.icon_name,
      is_featured: event.is_featured,
      sort_order: event.sort_order,
      period: event.timeline_periods ? {
        id: event.timeline_periods.id,
        slug: event.timeline_periods.period_slug,
        name: lang === 'sd' ? event.timeline_periods.sindhi_name : event.timeline_periods.english_name,
        color_code: event.timeline_periods.color_code
      } : null,
      poet: event.poets ? {
        id: event.poets.id,
        slug: event.poets.poet_slug,
        name: lang === 'sd' ? event.poets.sindhi_name : event.poets.english_name,
        photo: event.poets.file_url
      } : null,
      created_at: event.created_at,
      updated_at: event.updated_at
    };

    res.json({
      success: true,
      event: transformedEvent
    });

  } catch (error) {
    console.error('Error in timeline event GET /:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/timeline/events - Create new timeline event
router.post('/events', async (req, res) => {
  try {
    const {
      event_slug,
      event_date,
      event_year,
      is_approximate = false,
      period_id,
      poet_id,
      poetry_id,
      sindhi_title,
      sindhi_description,
      sindhi_location,
      english_title,
      english_description,
      english_location,
      event_type = 'historical',
      importance_level = 1,
      tags = [],
      color_code,
      icon_name,
      is_featured = false,
      sort_order = 0
    } = req.body;

    // Validate required fields
    if (!event_slug || !event_date || !event_year || !sindhi_title || !english_title) {
      return res.status(400).json({
        success: false,
        message: 'Event slug, date, year, and titles in both languages are required'
      });
    }

    const { data: event, error } = await global.supabase
      .from('timeline_events')
      .insert({
        event_slug,
        event_date,
        event_year,
        is_approximate,
        period_id,
        poet_id,
        poetry_id,
        sindhi_title,
        sindhi_description,
        sindhi_location,
        english_title,
        english_description,
        english_location,
        event_type,
        importance_level,
        tags,
        color_code,
        icon_name,
        is_featured,
        sort_order
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create timeline event',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Timeline event created successfully',
      event: event
    });

  } catch (error) {
    console.error('Error in timeline event POST:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/timeline/events/:id - Update timeline event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;

    const { data: event, error } = await global.supabase
      .from('timeline_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update timeline event',
        error: error.message
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    res.json({
      success: true,
      message: 'Timeline event updated successfully',
      event: event
    });

  } catch (error) {
    console.error('Error in timeline event PUT:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/timeline/events/:id - Delete timeline event (soft delete)
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await global.supabase
      .from('timeline_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting timeline event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete timeline event',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Timeline event deleted successfully'
    });

  } catch (error) {
    console.error('Error in timeline event DELETE:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/timeline/overview - Get timeline overview with periods and events
router.get('/overview', async (req, res) => {
  try {
    const { lang = 'en', limit = 50 } = req.query;

    // Get featured periods
    const { data: periods, error: periodsError } = await global.supabase
      .from('timeline_periods')
      .select('*')
      .eq('is_featured', true)
      .eq('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (periodsError) {
      console.error('Error fetching featured periods:', periodsError);
    }

    // Get recent events
    const { data: events, error: eventsError } = await global.supabase
      .from('timeline_events')
      .select(`
        *,
        timeline_periods!left(
          id,
          period_slug,
          sindhi_name,
          english_name,
          color_code
        ),
        poets!left(
          id,
          poet_slug,
          sindhi_name,
          english_name,
          file_url
        )
      `)
      .eq('deleted_at', null)
      .order('event_year', { ascending: false })
      .limit(parseInt(limit));

    if (eventsError) {
      console.error('Error fetching recent events:', eventsError);
    }

    // Transform data
    const transformedPeriods = (periods || []).map(period => ({
      id: period.id,
      period_slug: period.period_slug,
      start_year: period.start_year,
      end_year: period.end_year,
      is_ongoing: period.is_ongoing,
      name: lang === 'sd' ? period.sindhi_name : period.english_name,
      description: lang === 'sd' ? period.sindhi_description : period.english_description,
      characteristics: lang === 'sd' ? period.sindhi_characteristics : period.english_characteristics,
      color_code: period.color_code,
      icon_name: period.icon_name,
      is_featured: period.is_featured,
      sort_order: period.sort_order
    }));

    const transformedEvents = (events || []).map(event => ({
      id: event.id,
      event_slug: event.event_slug,
      event_date: event.event_date,
      event_year: event.event_year,
      is_approximate: event.is_approximate,
      title: lang === 'sd' ? event.sindhi_title : event.english_title,
      description: lang === 'sd' ? event.sindhi_description : event.english_description,
      location: lang === 'sd' ? event.sindhi_location : event.english_location,
      event_type: event.event_type,
      importance_level: event.importance_level,
      tags: event.tags,
      color_code: event.color_code,
      icon_name: event.icon_name,
      is_featured: event.is_featured,
      period: event.timeline_periods ? {
        id: event.timeline_periods.id,
        slug: event.timeline_periods.period_slug,
        name: lang === 'sd' ? event.timeline_periods.sindhi_name : event.timeline_periods.english_name,
        color_code: event.timeline_periods.color_code
      } : null,
      poet: event.poets ? {
        id: event.poets.id,
        slug: event.poets.poet_slug,
        name: lang === 'sd' ? event.poets.sindhi_name : event.poets.english_name,
        photo: event.poets.file_url
      } : null
    }));

    res.json({
      success: true,
      periods: transformedPeriods,
      events: transformedEvents,
      total_periods: periods?.length || 0,
      total_events: events?.length || 0
    });

  } catch (error) {
    console.error('Error in timeline overview GET:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
