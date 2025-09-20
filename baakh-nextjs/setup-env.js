#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up environment variables for Baakh Poetry Archive...\n');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.local.backup'));
}

// Generate CSRF secret
const csrfSecret = crypto.randomBytes(32).toString('hex');

// Create .env.local template
const envTemplate = `# Supabase Configuration
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Security Configuration
CSRF_SECRET=${csrfSecret}

# Admin Configuration (Optional - for auto-elevation)
ADMIN_EMAIL_ALLOWLIST=admin@example.com,your-email@example.com
AUTO_ELEVATE_ADMINS=true

# Security Alerts (Optional)
ADMIN_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
SECURITY_WEBHOOK_URL=https://your-webhook-endpoint.com/security

# Threat Intelligence (Optional)
THREAT_INTELLIGENCE_API_KEY=your-api-key
IP_GEOLOCATION_API_KEY=your-api-key
`;

// Write the file
fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env.local file with template values');
console.log('✅ Generated secure CSRF secret');
console.log('\n📋 Next steps:');
console.log('1. Get your Supabase credentials from: https://app.supabase.com');
console.log('2. Replace the placeholder values in .env.local');
console.log('3. Create an admin user in Supabase Auth');
console.log('4. Run the database migration');
console.log('5. Restart your development server');
console.log('\n🔗 For detailed instructions, see: ENVIRONMENT_SETUP.md');
console.log('\n⚠️  IMPORTANT: Never commit .env.local to version control!');



