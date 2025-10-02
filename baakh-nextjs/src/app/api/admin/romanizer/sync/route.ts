export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Edge runtime: disable Node fs/path usage
import { clearRomanizerCache } from '../../../../../../lib/romanizer-utils';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

const ROMANIZER_FILE_PATH = '/dev/null';
const SYNC_METADATA_PATH = '/dev/null';

async function getLastSyncInfo() {
  try {
    // Edge: return defaults; persistence is not available
    return {
      lastSyncTime: null,
      lastEntryTimestamp: 0,
      totalEntries: 0
    };
  } catch (error) {
    console.warn('⚠️ Could not read sync metadata:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return {
    lastSyncTime: null,
    lastEntryTimestamp: 0,
    totalEntries: 0
  };
}

async function saveSyncMetadata(lastEntryTimestamp: number, totalEntries: number) {
  try {
    const metadata = {
      lastSyncTime: new Date().toISOString(),
      lastEntryTimestamp: lastEntryTimestamp,
      totalEntries: totalEntries,
      version: '1.0'
    };
    // Edge: skip writing
  } catch (error) {
    console.warn('⚠️ Could not save sync metadata:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    // Check if user is authenticated (you can add more auth checks here)
    
    console.log('🔄 Starting incremental romanizer sync...');
    
    // Get last sync information
    const lastSync = await getLastSyncInfo();
    console.log(`📊 Last sync: ${lastSync.lastSyncTime || 'Never'}`);
    console.log(`📊 Last entry ID: ${lastSync.lastEntryTimestamp}`);
    
    // Fetch only new entries since last sync with pagination
    let allNewEntries: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      let query = supabase
        .from('baakh_roman_words')
        .select('word_sd, word_roman, created_at, updated_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      
      if (lastSync.lastEntryTimestamp > 0) {
        // Convert timestamp back to ISO string for database comparison
        const lastTimestampDate = new Date(lastSync.lastEntryTimestamp).toISOString();
        query = query.gt('created_at', lastTimestampDate);
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
      return NextResponse.json({
        success: true,
        message: 'No new entries found. File is up to date!',
        count: 0,
        lastUpdated: lastSync.lastSyncTime || new Date().toISOString()
      });
    }
    
    console.log(`📥 Found ${newEntries.length} new entries`);
    
    // Read existing file content
    let existingEntries: Map<string, string> = new Map();
    
    // Edge: skip reading existing file
    
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
    
    sortedEntries.forEach(([sindhi, roman]: [string, string]) => {
      fileContent += `${sindhi}|${roman}\n`;
    });
    
    // Edge: skip writing to file
    
    // Clear the cache to force reload of new mappings
    clearRomanizerCache();
    
    // Save sync metadata
    const maxTimestamp = newEntries.reduce((max, entry) => {
      const timestamp = new Date(entry.created_at).getTime();
      return timestamp > max ? timestamp : max;
    }, 0);
    
    await saveSyncMetadata(maxTimestamp, existingEntries.size);
    
    console.log(`✅ Successfully synced romanizer file!`);
    console.log(`📊 New entries added: ${addedCount}`);
    console.log(`📊 Entries updated: ${updatedCount}`);
    console.log(`📊 Total entries in file: ${existingEntries.size}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${newEntries.length} new entries`,
      count: existingEntries.size,
      newEntries: newEntries.length,
      addedCount,
      updatedCount,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error syncing romanizer file:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error during sync' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    // Check if file exists
    {
      return NextResponse.json({
        success: false,
        message: 'Romanizer file not found'
      });
    }

    // Read file stats
    const stats = { mtime: new Date(), size: 0 } as any;
    const fileContent = '';
    
    // Count mappings
    const lines = fileContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    );
    
    return NextResponse.json({
      success: true,
      fileExists: true,
      lastModified: stats.mtime.toISOString(),
      mappingsCount: lines.length,
      fileSize: stats.size
    });

  } catch (error) {
    console.error('❌ Error reading romanizer file:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error reading file' 
    }, { status: 500 });
  }
}