-- Fix the get_admin_reports function to work with correct data types
-- This function will be used by the service role and doesn't require user authentication

CREATE OR REPLACE FUNCTION get_admin_reports_service(
  status_filter report_status DEFAULT NULL,
  reason_filter report_reason DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  report_id UUID,
  poetry_id BIGINT,
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
  -- No authentication check - this function is for service role use
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
  JOIN poetry_main p ON pr.poetry_id = p.id
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

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_admin_reports_service TO service_role;
