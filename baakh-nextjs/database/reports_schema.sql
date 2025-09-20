-- Poetry Reports Database Schema for Supabase
-- This file contains the SQL schema for the poetry reporting system

-- Create enum types for report categories and reasons
CREATE TYPE report_category AS ENUM (
  'common',
  'additional'
);

CREATE TYPE report_reason AS ENUM (
  'contentError',
  'offensive',
  'copyright',
  'spam',
  'misinformation',
  'lowQuality',
  'wrongPoet',
  'triggering',
  'wrongCategory',
  'duplicate',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'under_review',
  'resolved',
  'dismissed',
  'escalated'
);

-- Main reports table
CREATE TABLE poetry_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poetry_id UUID NOT NULL REFERENCES poetry_main(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category report_category NOT NULL,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_poetry_reports_poetry_id ON poetry_reports(poetry_id);
CREATE INDEX idx_poetry_reports_reporter_id ON poetry_reports(reporter_id);
CREATE INDEX idx_poetry_reports_status ON poetry_reports(status);
CREATE INDEX idx_poetry_reports_created_at ON poetry_reports(created_at);
CREATE INDEX idx_poetry_reports_reason ON poetry_reports(reason);

-- Create a view for report statistics
CREATE VIEW report_statistics AS
SELECT 
  p.id as poetry_id,
  p.poetry_slug,
  COUNT(pr.id) as total_reports,
  COUNT(CASE WHEN pr.status = 'pending' THEN 1 END) as pending_reports,
  COUNT(CASE WHEN pr.status = 'under_review' THEN 1 END) as under_review_reports,
  COUNT(CASE WHEN pr.status = 'resolved' THEN 1 END) as resolved_reports,
  COUNT(CASE WHEN pr.status = 'dismissed' THEN 1 END) as dismissed_reports,
  COUNT(CASE WHEN pr.reason = 'contentError' THEN 1 END) as content_error_reports,
  COUNT(CASE WHEN pr.reason = 'offensive' THEN 1 END) as offensive_reports,
  COUNT(CASE WHEN pr.reason = 'copyright' THEN 1 END) as copyright_reports,
  COUNT(CASE WHEN pr.reason = 'spam' THEN 1 END) as spam_reports,
  COUNT(CASE WHEN pr.reason = 'misinformation' THEN 1 END) as misinformation_reports,
  COUNT(CASE WHEN pr.reason = 'lowQuality' THEN 1 END) as low_quality_reports,
  COUNT(CASE WHEN pr.reason = 'wrongPoet' THEN 1 END) as wrong_poet_reports,
  COUNT(CASE WHEN pr.reason = 'triggering' THEN 1 END) as triggering_reports,
  COUNT(CASE WHEN pr.reason = 'wrongCategory' THEN 1 END) as wrong_category_reports,
  COUNT(CASE WHEN pr.reason = 'duplicate' THEN 1 END) as duplicate_reports,
  COUNT(CASE WHEN pr.reason = 'other' THEN 1 END) as other_reports
FROM poetry_main p
LEFT JOIN poetry_reports pr ON p.id = pr.poetry_id
GROUP BY p.id, p.poetry_slug;

-- Create a view for admin dashboard
CREATE VIEW admin_reports_view AS
SELECT 
  pr.id,
  pr.poetry_id,
  p.poetry_slug,
  po.sindhi_name as poet_name,
  po.english_name as poet_english_name,
  pr.category,
  pr.reason,
  pr.description,
  pr.status,
  pr.admin_notes,
  pr.created_at,
  pr.updated_at,
  pr.resolved_at,
  u.email as reporter_email,
  u.raw_user_meta_data->>'full_name' as reporter_name,
  resolved_admin.email as resolved_by_email,
  resolved_admin.raw_user_meta_data->>'full_name' as resolved_by_name
FROM poetry_reports pr
JOIN poetry p ON pr.poetry_id = p.id
JOIN poets po ON p.poet_id = po.id
LEFT JOIN auth.users u ON pr.reporter_id = u.id
LEFT JOIN auth.users resolved_admin ON pr.resolved_by = resolved_admin.id
ORDER BY pr.created_at DESC;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_poetry_reports_updated_at 
  BEFORE UPDATE ON poetry_reports 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check if user can report (prevent spam)
CREATE OR REPLACE FUNCTION can_user_report(poetry_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  report_count INTEGER;
  last_report_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user has reported this poetry in the last 24 hours
  SELECT COUNT(*), MAX(created_at)
  INTO report_count, last_report_time
  FROM poetry_reports 
  WHERE poetry_id = poetry_uuid 
    AND reporter_id = user_uuid 
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Allow if no reports in last 24 hours
  RETURN report_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get report reasons with translations
CREATE OR REPLACE FUNCTION get_report_reasons_translations()
RETURNS TABLE (
  reason_key report_reason,
  english_title TEXT,
  english_description TEXT,
  sindhi_title TEXT,
  sindhi_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'contentError'::report_reason,
    'Content Error',
    'factual/grammatical issues, broken formatting, or wrong attribution',
    'مواد ۾ غلطي',
    'حقيقتي/گرامر غلطيون، ٽٽل فارميٽ، يا غلط نسبت'
  UNION ALL
  SELECT 
    'offensive'::report_reason,
    'Offensive / Inappropriate Content',
    'hate speech, explicit content, harassment, etc.',
    'نازيبا / نامناسب مواد',
    'نفرت ڀريو خطاب، غير اخلاقي مواد، يا هراساڻي'
  UNION ALL
  SELECT 
    'copyright'::report_reason,
    'Copyright / Plagiarism',
    'if the poem is stolen or improperly credited',
    'ڪاپي رائيٽ / چوري ٿيل مواد',
    'جيڪڏهن نظم چوري ٿيل يا غلط طريقي سان منسوب ٿيل هجي'
  UNION ALL
  SELECT 
    'spam'::report_reason,
    'Spam / Irrelevant Content',
    'advertisements, unrelated text, or repeated junk',
    'اسپام / غير لاڳاپيل مواد',
    'اشتهار، غير لاڳاپيل متن، يا بيڪار ورجايل مواد'
  UNION ALL
  SELECT 
    'misinformation'::report_reason,
    'Misinformation',
    'false claims presented as facts',
    'غلط ڄاڻ',
    'ڪوڙو دعويٰ جيڪو حقيقت طور پيش ڪيو ويو هجي'
  UNION ALL
  SELECT 
    'lowQuality'::report_reason,
    'Low Quality / Not a Poem',
    'random text, gibberish, or non-poetry content',
    'گهٽ معيار / نظم نه آهي',
    'بي ترتيب لفظ، بڪواس، يا غير شاعراڻو مواد'
  UNION ALL
  SELECT 
    'wrongPoet'::report_reason,
    'Wrong Poet',
    'poem attributed to the wrong poet',
    'غلط شاعر',
    'نظم غلط شاعر سان منسوب ٿيل'
  UNION ALL
  SELECT 
    'triggering'::report_reason,
    'Triggering / Sensitive Content',
    'mentions of self-harm, violence, etc.',
    'حساس / ڏک پهچائيندڙ مواد',
    'خودڪشي، تشدد وغيره جا حوالا'
  UNION ALL
  SELECT 
    'wrongCategory'::report_reason,
    'Wrong Category / Tag',
    'poem placed in the wrong genre',
    'غلط درجو / ٽيگ',
    'نظم غلط صنف ۾ رکيل'
  UNION ALL
  SELECT 
    'duplicate'::report_reason,
    'Duplicate Entry',
    'already exists on the platform',
    'ورجايل داخلا',
    'هي نظم اڳ ۾ ئي موجود آهي'
  UNION ALL
  SELECT 
    'other'::report_reason,
    'Other (Free Text)',
    'for anything not covered',
    'ٻيو (آزاد لکت)',
    'جيڪو مٿي بيان ٿيل ناهي';
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE poetry_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create reports
CREATE POLICY "Users can create reports" ON poetry_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports" ON poetry_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports" ON poetry_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update all reports
CREATE POLICY "Admins can update all reports" ON poetry_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can delete reports
CREATE POLICY "Admins can delete reports" ON poetry_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create a function to submit a report
CREATE OR REPLACE FUNCTION submit_poetry_report(
  poetry_uuid UUID,
  report_category report_category,
  report_reason report_reason,
  report_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_report_id UUID;
  user_id UUID;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to submit a report';
  END IF;
  
  -- Check if user can report (prevent spam)
  IF NOT can_user_report(poetry_uuid, user_id) THEN
    RAISE EXCEPTION 'You have already reported this poetry recently. Please wait 24 hours before reporting again.';
  END IF;
  
  -- Insert the report
  INSERT INTO poetry_reports (
    poetry_id,
    reporter_id,
    category,
    reason,
    description
  ) VALUES (
    poetry_uuid,
    user_id,
    report_category,
    report_reason,
    report_description
  ) RETURNING id INTO new_report_id;
  
  RETURN new_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get reports for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_reports(
  status_filter report_status DEFAULT NULL,
  reason_filter report_reason DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  report_id UUID,
  poetry_id UUID,
  poetry_slug TEXT,
  poet_name TEXT,
  poet_english_name TEXT,
  category report_category,
  reason report_reason,
  description TEXT,
  status report_status,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  reporter_email TEXT,
  reporter_name TEXT,
  resolved_by_email TEXT,
  resolved_by_name TEXT
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    pr.id as report_id,
    pr.poetry_id,
    p.poetry_slug,
    po.sindhi_name as poet_name,
    po.english_name as poet_english_name,
    pr.category,
    pr.reason,
    pr.description,
    pr.status,
    pr.admin_notes,
    pr.created_at,
    pr.updated_at,
    pr.resolved_at,
    u.email as reporter_email,
    u.raw_user_meta_data->>'full_name' as reporter_name,
    resolved_admin.email as resolved_by_email,
    resolved_admin.raw_user_meta_data->>'full_name' as resolved_by_name
  FROM poetry_reports pr
  JOIN poetry p ON pr.poetry_id = p.id
  JOIN poets po ON p.poet_id = po.id
  LEFT JOIN auth.users u ON pr.reporter_id = u.id
  LEFT JOIN auth.users resolved_admin ON pr.resolved_by = resolved_admin.id
  WHERE 
    (status_filter IS NULL OR pr.status = status_filter)
    AND (reason_filter IS NULL OR pr.reason = reason_filter)
  ORDER BY pr.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update report status
CREATE OR REPLACE FUNCTION update_report_status(
  report_uuid UUID,
  new_status report_status,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = user_id 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Update the report
  UPDATE poetry_reports 
  SET 
    status = new_status,
    admin_notes = COALESCE(admin_notes, admin_notes),
    resolved_by = CASE WHEN new_status IN ('resolved', 'dismissed') THEN user_id ELSE resolved_by END,
    resolved_at = CASE WHEN new_status IN ('resolved', 'dismissed') THEN NOW() ELSE resolved_at END,
    updated_at = NOW()
  WHERE id = report_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing (optional)
-- INSERT INTO poetry_reports (poetry_id, reporter_id, category, reason, description) 
-- VALUES (
--   'your-poetry-uuid-here',
--   'your-user-uuid-here',
--   'common',
--   'contentError',
--   'This poem has grammatical errors in the Sindhi text'
-- );

-- Create a view for public report statistics (without sensitive data)
CREATE VIEW public_report_stats AS
SELECT 
  p.id as poetry_id,
  p.poetry_slug,
  COUNT(pr.id) as total_reports,
  COUNT(CASE WHEN pr.status = 'resolved' THEN 1 END) as resolved_reports
FROM poetry_main p
LEFT JOIN poetry_reports pr ON p.id = pr.poetry_id
GROUP BY p.id, p.poetry_slug
HAVING COUNT(pr.id) > 0;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public_report_stats TO authenticated;
GRANT EXECUTE ON FUNCTION submit_poetry_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_report_reasons_translations TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_report TO authenticated;

-- Grant admin permissions
GRANT ALL ON poetry_reports TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_reports TO authenticated;
GRANT EXECUTE ON FUNCTION update_report_status TO authenticated;
