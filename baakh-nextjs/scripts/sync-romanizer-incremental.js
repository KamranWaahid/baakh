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

const ROMANIZER_FILE_PATH = path.join(__dirname, '../romanizer.txt');
const SYNC_METADATA_PATH = path.join(__dirname, '../.romanizer-sync-metadata.json');

async function getLastSyncInfo() {
  try {
    if (fs.existsSync(SYNC_METADATA_PATH)) {
      const metadata = JSON.parse(fs.readFileSync(SYNC_METADATA_PATH, 'utf8'));
      return {
        lastSyncTime: metadata.lastSyncTime,
        lastEntryId: metadata.lastEntryId,
        totalEntries: metadata.totalEntries
      };
    }
  } catch (error) {
    console.warn('⚠️ Could not read sync metadata:', error.message);
  }
  
  return {
    lastSyncTime: null,
    lastEntryId: 0,
    totalEntries: 0
  };
}

async function saveSyncMetadata(lastEntryId, totalEntries) {
  try {
    const metadata = {
      lastSyncTime: new Date().toISOString(),
      lastEntryId: lastEntryId,
      totalEntries: totalEntries,
      version: '1.0'
    };
    fs.writeFileSync(SYNC_METADATA_PATH, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.warn('⚠️ Could not save sync metadata:', error.message);
  }
}

async function incrementalSyncRomanizer() {
  try {
    console.log('🔄 Starting incremental romanizer sync...');
    
    // Get last sync information
    const lastSync = await getLastSyncInfo();
    console.log(`📊 Last sync: ${lastSync.lastSyncTime || 'Never'}`);
    console.log(`📊 Last entry ID: ${lastSync.lastEntryId}`);
    console.log(`📊 Total entries in file: ${lastSync.totalEntries}`);
    
    // Fetch only new entries since last sync with pagination
    let allNewEntries = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      let query = supabase
        .from('baakh_roman_words')
        .select('id, word_sd, word_roman, created_at, updated_at')
        .is('deleted_at', null)
        .order('id', { ascending: true });
      
      if (lastSync.lastEntryId > 0) {
        query = query.gt('id', lastSync.lastEntryId);
      }
      
      const { data: pageEntries, error } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!pageEntries || pageEntries.length === 0) {
        hasMore = false;
        break;
      }
      
      allNewEntries = allNewEntries.concat(pageEntries);
      
      if (pageEntries.length < pageSize) {
        hasMore = false;
      }
      
      page++;
      console.log(`📄 Fetched page ${page} with ${pageEntries.length} entries...`);
    }
    
    const newEntries = allNewEntries;
    
    if (!newEntries || newEntries.length === 0) {
      console.log('✅ No new entries found. File is up to date!');
      return;
    }
    
    console.log(`📥 Found ${newEntries.length} new entries`);
    
    // Read existing file content
    let existingEntries = new Map();
    
    if (fs.existsSync(ROMANIZER_FILE_PATH)) {
      const existingContent = fs.readFileSync(ROMANIZER_FILE_PATH, 'utf8');
      
      // Parse existing entries
      existingContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const parts = line.split('|');
          if (parts.length === 2) {
            existingEntries.set(parts[0], parts[1]);
          }
        }
      });
      
      console.log(`📖 Existing file has ${existingEntries.size} entries`);
    }
    
    // Add new entries to the map
    let addedCount = 0;
    let updatedCount = 0;
    
    newEntries.forEach(entry => {
      const existingRoman = existingEntries.get(entry.word_sd);
      if (existingRoman !== entry.word_roman) {
        existingEntries.set(entry.word_sd, entry.word_roman);
        if (existingRoman !== undefined) {
          updatedCount++;
        } else {
          addedCount++;
        }
      }
    });
    
    // Create new file content
    let fileContent = `# Romanizer Mappings File\n`;
    fileContent += `# Format: sindhi_word|roman_word\n`;
    fileContent += `# This file is automatically updated when the database changes\n`;
    fileContent += `# Last updated: ${new Date().toISOString().split('T')[0]}\n`;
    fileContent += `# Total entries: ${existingEntries.size}\n\n`;
    
    // Sort entries alphabetically for consistency
    const sortedEntries = Array.from(existingEntries.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedEntries.forEach(([sindhi, roman]) => {
      fileContent += `${sindhi}|${roman}\n`;
    });
    
    // Write to file
    fs.writeFileSync(ROMANIZER_FILE_PATH, fileContent, 'utf8');
    
    // Save sync metadata
    const maxId = Math.max(...newEntries.map(e => e.id));
    await saveSyncMetadata(maxId, existingEntries.size);
    
    console.log(`✅ Successfully synced romanizer file!`);
    console.log(`📊 New entries added: ${addedCount}`);
    console.log(`📊 Entries updated: ${updatedCount}`);
    console.log(`📊 Total entries in file: ${existingEntries.size}`);
    console.log(`📊 Last entry ID synced: ${maxId}`);
    
    // Show sample of new entries
    if (newEntries.length > 0) {
      console.log('\n📝 Sample of new/updated entries:');
      newEntries.slice(0, 5).forEach(entry => {
        console.log(`   ${entry.word_sd} → ${entry.word_roman} (ID: ${entry.id})`);
      });
      
      if (newEntries.length > 5) {
        console.log(`   ... and ${newEntries.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error during incremental sync:', error.message);
    process.exit(1);
  }
}

// Run sync if called directly
if (require.main === module) {
  incrementalSyncRomanizer();
}

module.exports = { incrementalSyncRomanizer };
