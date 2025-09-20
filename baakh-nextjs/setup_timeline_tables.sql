-- Setup Timeline Management Database Tables for Baakh
-- This script creates the timeline system with periods, events, and relationships

-- Step 1: Create timeline_periods table
CREATE TABLE IF NOT EXISTS public.timeline_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_slug TEXT UNIQUE NOT NULL,
    
    -- Period information
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    is_ongoing BOOLEAN DEFAULT false,
    
    -- Sindhi language fields
    sindhi_name TEXT NOT NULL,
    sindhi_description TEXT,
    sindhi_characteristics TEXT[] DEFAULT '{}',
    
    -- English language fields
    english_name TEXT NOT NULL,
    english_description TEXT,
    english_characteristics TEXT[] DEFAULT '{}',
    
    -- Visual and organizational
    color_code TEXT DEFAULT '#3B82F6',
    icon_name TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create timeline_events table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_slug TEXT UNIQUE NOT NULL,
    
    -- Event information
    event_date DATE NOT NULL,
    event_year INTEGER NOT NULL,
    is_approximate BOOLEAN DEFAULT false,
    
    -- Foreign key relationships
    period_id UUID REFERENCES public.timeline_periods(id) ON DELETE SET NULL,
    poet_id UUID REFERENCES public.poets(id) ON DELETE SET NULL,
    poetry_id UUID REFERENCES public.poetry_main(id) ON DELETE SET NULL,
    
    -- Sindhi language fields
    sindhi_title TEXT NOT NULL,
    sindhi_description TEXT,
    sindhi_location TEXT,
    
    -- English language fields
    english_title TEXT NOT NULL,
    english_description TEXT,
    english_location TEXT,
    
    -- Event metadata
    event_type TEXT DEFAULT 'historical' CHECK (event_type IN ('historical', 'literary', 'cultural', 'political', 'birth', 'death', 'publication', 'award')),
    importance_level INTEGER DEFAULT 1 CHECK (importance_level BETWEEN 1 AND 5),
    tags TEXT[] DEFAULT '{}',
    
    -- Visual and organizational
    color_code TEXT,
    icon_name TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Step 3: Create timeline_connections table for relationships
CREATE TABLE IF NOT EXISTS public.timeline_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Connection between events/periods
    source_type TEXT NOT NULL CHECK (source_type IN ('period', 'event')),
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('period', 'event', 'poet', 'poetry')),
    target_id UUID NOT NULL,
    
    -- Connection metadata
    connection_type TEXT DEFAULT 'related' CHECK (connection_type IN ('related', 'influenced_by', 'influenced', 'contemporary', 'successor', 'predecessor', 'collaborated_with')),
    strength INTEGER DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique connections
    UNIQUE(source_type, source_id, target_type, target_id)
);

-- Step 4: Create indexes for better performance
-- Periods indexes
CREATE INDEX IF NOT EXISTS idx_timeline_periods_slug ON public.timeline_periods(period_slug);
CREATE INDEX IF NOT EXISTS idx_timeline_periods_start_year ON public.timeline_periods(start_year);
CREATE INDEX IF NOT EXISTS idx_timeline_periods_end_year ON public.timeline_periods(end_year);
CREATE INDEX IF NOT EXISTS idx_timeline_periods_featured ON public.timeline_periods(is_featured);
CREATE INDEX IF NOT EXISTS idx_timeline_periods_sort_order ON public.timeline_periods(sort_order);
CREATE INDEX IF NOT EXISTS idx_timeline_periods_deleted_at ON public.timeline_periods(deleted_at);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_timeline_events_slug ON public.timeline_events(event_slug);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON public.timeline_events(event_date);
CREATE INDEX IF NOT EXISTS idx_timeline_events_year ON public.timeline_events(event_year);
CREATE INDEX IF NOT EXISTS idx_timeline_events_period_id ON public.timeline_events(period_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_poet_id ON public.timeline_events(poet_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_poetry_id ON public.timeline_events(poetry_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON public.timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_importance ON public.timeline_events(importance_level);
CREATE INDEX IF NOT EXISTS idx_timeline_events_featured ON public.timeline_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_timeline_events_deleted_at ON public.timeline_events(deleted_at);

-- Connections indexes
CREATE INDEX IF NOT EXISTS idx_timeline_connections_source ON public.timeline_connections(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_timeline_connections_target ON public.timeline_connections(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_timeline_connections_type ON public.timeline_connections(connection_type);

-- Step 5: Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_timeline_periods_sindhi_search ON public.timeline_periods USING gin(to_tsvector('sindhi', sindhi_name || ' ' || COALESCE(sindhi_description, '')));
CREATE INDEX IF NOT EXISTS idx_timeline_periods_english_search ON public.timeline_periods USING gin(to_tsvector('english', english_name || ' ' || COALESCE(english_description, '')));

CREATE INDEX IF NOT EXISTS idx_timeline_events_sindhi_search ON public.timeline_events USING gin(to_tsvector('sindhi', sindhi_title || ' ' || COALESCE(sindhi_description, '')));
CREATE INDEX IF NOT EXISTS idx_timeline_events_english_search ON public.timeline_events USING gin(to_tsvector('english', english_title || ' ' || COALESCE(english_description, '')));

-- Step 6: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timeline_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_timeline_periods_updated_at 
    BEFORE UPDATE ON public.timeline_periods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timeline_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at 
    BEFORE UPDATE ON public.timeline_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timeline_updated_at_column();

CREATE TRIGGER update_timeline_connections_updated_at 
    BEFORE UPDATE ON public.timeline_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timeline_updated_at_column();

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE public.timeline_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to timeline periods" ON public.timeline_periods
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow public read access to timeline events" ON public.timeline_events
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Allow public read access to timeline connections" ON public.timeline_connections
    FOR SELECT USING (true);

-- Create policies for admin access
CREATE POLICY "Allow admin full access to timeline periods" ON public.timeline_periods
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to timeline events" ON public.timeline_events
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to timeline connections" ON public.timeline_connections
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 8: Grant permissions
GRANT ALL ON public.timeline_periods TO authenticated;
GRANT ALL ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_connections TO authenticated;

GRANT SELECT ON public.timeline_periods TO anon;
GRANT SELECT ON public.timeline_events TO anon;
GRANT SELECT ON public.timeline_connections TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 9: Insert sample data
-- Insert sample periods
INSERT INTO public.timeline_periods (
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
) VALUES 
    (
        'classical-sindhi-poetry',
        1500,
        1800,
        false,
        'ڪلاسيڪل سنڌي شاعري',
        'سنڌي شاعري جو سنھري دور، جتي عظيم شاعر پيدا ٿيا',
        ARRAY['صوفي شاعري', 'ڪلاسيڪل انداز', 'عربي فارسي اثر'],
        'Classical Sindhi Poetry',
        'The golden age of Sindhi poetry, producing great poets and mystical works',
        ARRAY['Sufi Poetry', 'Classical Style', 'Arabic-Persian Influence'],
        '#8B5CF6',
        'book-open',
        true,
        1
    ),
    (
        'modern-sindhi-literature',
        1800,
        1950,
        false,
        'جديد سنڌي ادب',
        'سنڌي ادب ۾ نئين تحريڪن جو دور',
        ARRAY['جديد شاعري', 'نثري ادب', 'ترقي پسند تحريڪ'],
        'Modern Sindhi Literature',
        'Era of new movements and modern approaches in Sindhi literature',
        ARRAY['Modern Poetry', 'Prose Literature', 'Progressive Movement'],
        '#06B6D4',
        'zap',
        true,
        2
    ),
    (
        'contemporary-sindhi-poetry',
        1950,
        null,
        true,
        'عصري سنڌي شاعري',
        'هاڻوڪو دور، جتي سنڌي شاعري نئين اونچائي تي آهي',
        ARRAY['عصري موضوعات', 'نئين صنفون', 'عالمي اثر'],
        'Contemporary Sindhi Poetry',
        'Present era where Sindhi poetry reaches new heights',
        ARRAY['Contemporary Themes', 'New Genres', 'Global Influence'],
        '#10B981',
        'sparkles',
        true,
        3
    )
ON CONFLICT (period_slug) DO NOTHING;

-- Insert sample events
INSERT INTO public.timeline_events (
    event_slug,
    event_date,
    event_year,
    is_approximate,
    period_id,
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
) VALUES 
    (
        'shah-abdul-latif-birth',
        '1689-01-01',
        1689,
        true,
        (SELECT id FROM public.timeline_periods WHERE period_slug = 'classical-sindhi-poetry'),
        'شاه عبداللطيف ڀٽائي جي پيدائش',
        'سنڌي شاعري جي عظيم شاعر شاه عبداللطيف ڀٽائي جو جنم',
        'ڀٽ شاه، سنڌ',
        'Birth of Shah Abdul Latif Bhittai',
        'Birth of the great Sindhi poet Shah Abdul Latif Bhittai',
        'Bhit Shah, Sindh',
        'birth',
        5,
        ARRAY['شاعر', 'صوفي', 'ڪلاسيڪل'],
        '#8B5CF6',
        'user',
        true,
        1
    ),
    (
        'shah-abdul-latif-death',
        '1752-01-01',
        1752,
        true,
        (SELECT id FROM public.timeline_periods WHERE period_slug = 'classical-sindhi-poetry'),
        'شاه عبداللطيف ڀٽائي جي وفات',
        'سنڌي شاعري جي عظيم شاعر شاه عبداللطيف ڀٽائي جي وفات',
        'ڀٽ شاه، سنڌ',
        'Death of Shah Abdul Latif Bhittai',
        'Death of the great Sindhi poet Shah Abdul Latif Bhittai',
        'Bhit Shah, Sindh',
        'death',
        5,
        ARRAY['شاعر', 'صوفي', 'ڪلاسيڪل'],
        '#8B5CF6',
        'user',
        true,
        2
    ),
    (
        'sachal-sarmast-birth',
        '1739-01-01',
        1739,
        true,
        (SELECT id FROM public.timeline_periods WHERE period_slug = 'classical-sindhi-poetry'),
        'سچل سرمست جي پيدائش',
        'سنڌي شاعري جي عظيم صوفي شاعر سچل سرمست جو جنم',
        'درازه، سنڌ',
        'Birth of Sachal Sarmast',
        'Birth of the great Sindhi Sufi poet Sachal Sarmast',
        'Daraza, Sindh',
        'birth',
        5,
        ARRAY['شاعر', 'صوفي', 'مڌي'],
        '#8B5CF6',
        'user',
        true,
        3
    )
ON CONFLICT (event_slug) DO NOTHING;

-- Step 10: Create views for easier querying
CREATE OR REPLACE VIEW public.timeline_periods_view AS
SELECT 
    p.*,
    COUNT(e.id) as event_count,
    MIN(e.event_year) as earliest_event_year,
    MAX(e.event_year) as latest_event_year
FROM public.timeline_periods p
LEFT JOIN public.timeline_events e ON p.id = e.period_id AND e.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;

CREATE OR REPLACE VIEW public.timeline_events_view AS
SELECT 
    e.*,
    p.period_slug,
    p.sindhi_name as period_sindhi_name,
    p.english_name as period_english_name,
    po.sindhi_name as poet_sindhi_name,
    po.english_name as poet_english_name,
    po.poet_slug
FROM public.timeline_events e
LEFT JOIN public.timeline_periods p ON e.period_id = p.id
LEFT JOIN public.poets po ON e.poet_id = po.id
WHERE e.deleted_at IS NULL;

-- Step 11: Verify the setup
SELECT 'Timeline periods count:' as info, COUNT(*) as count FROM public.timeline_periods WHERE deleted_at IS NULL
UNION ALL
SELECT 'Timeline events count:', COUNT(*) FROM public.timeline_events WHERE deleted_at IS NULL
UNION ALL
SELECT 'Timeline connections count:', COUNT(*) FROM public.timeline_connections;
