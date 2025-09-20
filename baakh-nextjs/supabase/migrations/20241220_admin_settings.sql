-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_settings JSONB DEFAULT '{}',
  security_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  system_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_at ON admin_settings(updated_at);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only allow users to access their own settings
CREATE POLICY "Users can view their own settings" ON admin_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON admin_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON admin_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON admin_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Insert default settings for existing admin users
INSERT INTO admin_settings (user_id, profile_settings, security_settings, notification_settings, system_settings)
SELECT 
  u.id,
  '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "' || COALESCE(u.email, '') || '",
    "phone": "",
    "avatar": "",
    "bio": "System administrator for Baakh poetry archive"
  }'::jsonb,
  '{
    "twoFactorEnabled": false,
    "sessionTimeout": "30",
    "loginNotifications": true
  }'::jsonb,
  '{
    "emailNotifications": true,
    "pushNotifications": false,
    "smsNotifications": false,
    "weeklyReports": true,
    "systemAlerts": true,
    "userActivity": false
  }'::jsonb,
  '{
    "language": "en",
    "timezone": "Asia/Karachi",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "theme": "light",
    "autoBackup": true,
    "backupFrequency": "daily"
  }'::jsonb
FROM auth.users u
WHERE u.user_metadata->>'role' IN ('SuperAdmin', 'Admin')
  AND NOT EXISTS (
    SELECT 1 FROM admin_settings WHERE user_id = u.id
  );
