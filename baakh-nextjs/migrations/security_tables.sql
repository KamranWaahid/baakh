-- Security Tables Migration
-- Run this SQL in your Supabase SQL editor

-- Create login_attempts table for server-side lockout
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- email or IP address
  attempts INTEGER NOT NULL DEFAULT 1,
  last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on identifier for efficient lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier);

-- Create index on locked_until for cleanup queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until ON login_attempts(locked_until);

-- Create audit_log table for comprehensive logging
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Create CSRF tokens table for additional security
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);

-- Create function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_records()
RETURNS void AS $$
BEGIN
  -- Clean up expired CSRF tokens
  DELETE FROM csrf_tokens WHERE expires_at < NOW();
  
  -- Clean up old login attempts (older than 24 hours)
  DELETE FROM login_attempts WHERE last_attempt < NOW() - INTERVAL '24 hours';
  
  -- Clean up old audit logs (older than 90 days)
  DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-records', '0 2 * * *', 'SELECT cleanup_expired_records();');

-- Enable Row Level Security on all tables
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for login_attempts (only service role can access)
CREATE POLICY "Service role can manage login attempts" ON login_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for audit_log (only service role can insert, admins can read)
CREATE POLICY "Service role can manage audit log" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can read audit log" ON audit_log
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create RLS policies for csrf_tokens (users can only access their own tokens)
CREATE POLICY "Users can manage own CSRF tokens" ON csrf_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage CSRF tokens" ON csrf_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for login_attempts
CREATE TRIGGER update_login_attempts_updated_at
  BEFORE UPDATE ON login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE login_attempts_id_seq TO service_role;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO service_role;
GRANT USAGE ON SEQUENCE csrf_tokens_id_seq TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON login_attempts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_log TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON csrf_tokens TO service_role;

-- Grant read access to authenticated users for audit_log
GRANT SELECT ON audit_log TO authenticated;
