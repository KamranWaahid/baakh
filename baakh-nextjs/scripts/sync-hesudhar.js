#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local if it exists
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
} catch (error) {
  console.warn('⚠️ Could not load .env.local file:', error.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const HESUDHAR_FILE_PATH = path.join(__dirname, '../hesudhar.txt');

async function syncHesudharFile() {
  try {
    console.log('🔄 Syncing hesudhar corrections from database...');
    
    // Fetch all hesudhar corrections from database with pagination
    let allEntries = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: hesudharEntries, error } = await supabase
        .from('baakh_hesudhars')
        .select('word, correct')
        .is('deleted_at', null)
        .order('id', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!hesudharEntries || hesudharEntries.length === 0) {
        hasMore = false;
        break;
      }

      allEntries = allEntries.concat(hesudharEntries);
      
      if (hesudharEntries.length < pageSize) {
        hasMore = false;
      }
      
      page++;
      console.log(`📄 Fetched page ${page} with ${hesudharEntries.length} entries...`);
    }

    const hesudharEntries = allEntries;

    if (!hesudharEntries || hesudharEntries.length === 0) {
      console.log('⚠️  No hesudhar entries found in database');
      return;
    }

    // Create file content
    let fileContent = `# Hesudhar Corrections File\n`;
    fileContent += `# Format: incorrect_word|corrected_word\n`;
    fileContent += `# This file is automatically updated when the database changes\n`;
    fileContent += `# Last updated: ${new Date().toISOString().split('T')[0]}\n\n`;

    // Add each correction
    hesudharEntries.forEach(entry => {
      fileContent += `${entry.word}|${entry.correct}\n`;
    });

    // Write to file
    fs.writeFileSync(HESUDHAR_FILE_PATH, fileContent, 'utf8');
    
    console.log(`✅ Successfully synced ${hesudharEntries.length} hesudhar corrections to ${HESUDHAR_FILE_PATH}`);
    
    // Show sample entries
    console.log('\n📝 Sample entries:');
    hesudharEntries.slice(0, 5).forEach(entry => {
      console.log(`   ${entry.word} → ${entry.correct}`);
    });
    
    if (hesudharEntries.length > 5) {
      console.log(`   ... and ${hesudharEntries.length - 5} more`);
    }

  } catch (error) {
    console.error('❌ Error syncing hesudhar file:', error.message);
    process.exit(1);
  }
}

// Run sync if called directly
if (require.main === module) {
  syncHesudharFile();
}

module.exports = { syncHesudharFile };
