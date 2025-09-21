#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'baakh-nextjs/src/app/api/auth/local/login/route.ts',
  'baakh-nextjs/src/app/api/admin/categories/route.ts',
  'baakh-nextjs/src/app/api/admin/poets/route.ts',
  'baakh-nextjs/src/app/api/categories/[slug]/route.ts',
  'baakh-nextjs/src/app/api/categories/[slug]/poetry/route.ts',
  'baakh-nextjs/src/app/api/categories/route.ts',
  'baakh-nextjs/src/app/api/timeline/periods/route.ts',
  'baakh-nextjs/src/app/api/timeline/periods/by-slug/[slug]/route.ts',
  'baakh-nextjs/src/app/api/test-db/route.ts',
  'baakh-nextjs/src/app/api/poetry/by-poet/route.ts',
  'baakh-nextjs/src/app/api/tags/debug/route.ts',
  'baakh-nextjs/src/app/api/tags/route.ts',
  'baakh-nextjs/src/app/api/feedback/route.ts',
  'baakh-nextjs/src/app/api/user/bookmark/route.ts',
  'baakh-nextjs/src/app/api/user/like/route.ts',
  'baakh-nextjs/src/app/api/user/settings/route.ts',
  'baakh-nextjs/src/app/api/admin/users/route.ts',
  'baakh-nextjs/src/app/api/admin/tags/route.ts',
  'baakh-nextjs/src/app/api/admin/tags/search/route.ts',
  'baakh-nextjs/src/app/api/mutations/route.ts',
  'baakh-nextjs/src/app/api/auth/me/route.ts',
  'baakh-nextjs/src/app/api/auth/local/signup/route.ts',
  'baakh-nextjs/src/app/api/poets/debug/route.ts',
  'baakh-nextjs/src/app/api/poets/[id]/direct/route.ts'
];

function fixSupabaseRoute(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file has the old pattern
    if (!content.includes('const supabase = createClient(')) {
      console.log(`✅ File already fixed: ${filePath}`);
      return false;
    }

    // Replace the old pattern with the new function pattern
    const oldPattern = /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL!?;\s*const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY!?;\s*const supabase = createClient\(supabaseUrl, supabaseServiceKey\);/g;
    
    const newPattern = `// Create Supabase client function to avoid build-time errors
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}`;

    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newPattern);
      
      // Now add supabase client creation to each function
      const functionPattern = /export async function (\w+)\(/g;
      content = content.replace(functionPattern, (match, functionName) => {
        return `export async function ${functionName}(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    `;
      });

      // Fix the function signatures that were changed
      content = content.replace(/export async function (\w+)\(request: NextRequest\) \{\s*try \{\s*const supabase = createSupabaseClient\(\);\s*const body = await request\.json\(\);/g, 
        (match, functionName) => {
          return `export async function ${functionName}(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();`;
        });

      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No old pattern found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing Supabase routes...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixSupabaseRoute(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
