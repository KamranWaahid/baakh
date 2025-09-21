#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all files that need fixing
const filesToFix = [
  'baakh-nextjs/src/app/api/admin/settings/test/route.ts',
  'baakh-nextjs/src/app/api/admin/romanizer/sync/route.ts',
  'baakh-nextjs/src/app/api/admin/poets/route.ts',
  'baakh-nextjs/src/app/api/tags/route.ts',
  'baakh-nextjs/src/app/api/mutations/route.ts',
  'baakh-nextjs/src/app/api/poets/[id]/direct/route.ts',
  'baakh-nextjs/src/app/api/couplets/bookmark/route.ts',
  'baakh-nextjs/src/app/api/couplets/like/route.ts',
  'baakh-nextjs/src/app/api/feedback/route.ts',
  'baakh-nextjs/src/app/api/test-db/route.ts',
  'baakh-nextjs/src/app/api/poets/debug/route.ts',
  'baakh-nextjs/src/app/api/auth/save-sindhi-name/route.ts',
  'baakh-nextjs/src/app/api/admin/settings/password/route.ts',
  'baakh-nextjs/src/app/api/admin/settings/admin/route.ts',
  'baakh-nextjs/src/app/api/user/settings/route.ts',
  'baakh-nextjs/src/app/api/admin/settings/production/route.ts',
  'baakh-nextjs/src/app/api/admin/settings/status/route.ts',
  'baakh-nextjs/src/app/api/admin/settings/route.ts',
  'baakh-nextjs/src/app/api/poetry/by-poet/route.ts',
  'baakh-nextjs/src/app/api/admin/romanizer/roman-words/route.ts'
];

function fixSupabaseClient(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file already has the fix
    if (content.includes('function getSupabaseClient()') || content.includes('function getAdminClient()')) {
      console.log(`✅ Already fixed: ${filePath}`);
      return false;
    }
    
    // Pattern to match module-level Supabase client creation (multiline)
    const moduleClientPattern = /const\s+(\w+)\s*=\s*createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!?\s*,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY!?\s*\);?/g;
    
    const match = content.match(moduleClientPattern);
    if (!match) {
      console.log(`ℹ️  No module-level Supabase client found in: ${filePath}`);
      return false;
    }
    
    // Extract the variable name
    const varName = match[0].match(/const\s+(\w+)\s*=/)[1];
    
    // Replace module-level client with function
    const replacement = `function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}`;
    
    content = content.replace(moduleClientPattern, replacement);
    
    // Replace all usages of the old variable with getSupabaseClient()
    const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
    content = content.replace(usagePattern, 'getSupabaseClient()');
    
    // Write the fixed content back
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing all remaining Supabase client initializations...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixSupabaseClient(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files out of ${filesToFix.length} total files.`);
