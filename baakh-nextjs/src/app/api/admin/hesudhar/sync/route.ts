export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type HesudharMemoryFile = {
  content: string;
  updatedAt: string;
};

function getMemoryFile(): HesudharMemoryFile {
  const globalScope = globalThis as typeof globalThis & {
    __hesudharMemoryFile?: HesudharMemoryFile;
  };

  if (!globalScope.__hesudharMemoryFile) {
    globalScope.__hesudharMemoryFile = {
      content: '',
      updatedAt: new Date(0).toISOString()
    };
  }

  return globalScope.__hesudharMemoryFile;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getLastSyncInfo() {
  try {
    // Edge: return defaults; persistence is not available
    return {
      lastSyncTime: null,
      lastEntryId: 0,
      totalEntries: 0
    };
  } catch (error) {
    console.warn('⚠️ Could not read sync metadata:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return {
    lastSyncTime: null,
    lastEntryId: 0,
    totalEntries: 0
  };
}

async function saveSyncMetadata(lastEntryId: number, totalEntries: number) {
  try {
    console.debug('ℹ️ Sync metadata update skipped on Edge runtime', {
      lastEntryId,
      totalEntries,
      lastSyncTime: new Date().toISOString()
    });
  } catch (error) {
    console.warn('⚠️ Could not save sync metadata:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (you can add more auth checks here)
    
    console.log('🔄 Starting incremental hesudhar sync...');
    
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Get last sync information
    const lastSync = await getLastSyncInfo();
    console.log(`📊 Last sync: ${lastSync.lastSyncTime || 'Never'}`);
    console.log(`📊 Last entry ID: ${lastSync.lastEntryId}`);
    
    // Fetch only new entries since last sync
    let query = supabase
      .from('baakh_hesudhars')
      .select('id, word, correct, created_at, updated_at')
      .is('deleted_at', null)
      .order('id', { ascending: true });
    
    if (lastSync.lastEntryId > 0) {
      query = query.gt('id', lastSync.lastEntryId);
      console.log(`🔍 Fetching entries with ID > ${lastSync.lastEntryId}`);
    } else {
      console.log('🔍 Fetching all entries (first sync)');
    }
    
    const { data: newEntries, error } = await query;
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
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
    const existingEntries: Map<string, string> = new Map();
    const memoryFile = getMemoryFile();

    if (memoryFile.content) {
      memoryFile.content.split('\n').forEach((rawLine: string) => {
        const trimmedLine = rawLine.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [incorrect, correct] = trimmedLine.split('|');
          if (incorrect && typeof correct === 'string') {
            existingEntries.set(incorrect, correct);
          }
        }
      });

      console.log(`📖 Existing in-memory file has ${existingEntries.size} entries`);
    }
    
    // Add new entries to the map
    let addedCount = 0;
    let updatedCount = 0;
    
    newEntries.forEach(entry => {
      const existingCorrect = existingEntries.get(entry.word);
      if (existingCorrect !== entry.correct) {
        existingEntries.set(entry.word, entry.correct);
        if (existingCorrect !== undefined) {
          updatedCount++;
        } else {
          addedCount++;
        }
      }
    });
    
    // Create new file content
    let fileContent = `# Hesudhar Corrections File\n`;
    fileContent += `# Format: incorrect_word|corrected_word\n`;
    fileContent += `# This file is automatically updated when the database changes\n`;
    fileContent += `# Last updated: ${new Date().toISOString().split('T')[0]}\n`;
    fileContent += `# Total entries: ${existingEntries.size}\n\n`;
    
    // Sort entries alphabetically for consistency
    const sortedEntries = Array.from(existingEntries.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedEntries.forEach(([incorrect, correct]: [string, string]) => {
      fileContent += `${incorrect}|${correct}\n`;
    });
    
    // Write to file
    memoryFile.content = fileContent;
    memoryFile.updatedAt = new Date().toISOString();
    
    // Save sync metadata
    const maxId = Math.max(...newEntries.map(e => e.id));
    await saveSyncMetadata(maxId, existingEntries.size);
    
    console.log(`✅ Successfully synced hesudhar file!`);
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
    console.error('❌ Error syncing hesudhar file:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error during sync' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if file exists
    const memoryFile = getMemoryFile();

    if (!memoryFile.content) {
      return NextResponse.json({
        success: false,
        message: 'Hesudhar file not found'
      });
    }

    const fileContent = memoryFile.content;
    
    // Count corrections
    const lines = fileContent.split('\n').filter((line: string) => 
      line.trim() && !line.startsWith('#')
    );
    
    return NextResponse.json({
      success: true,
      fileExists: true,
      lastModified: memoryFile.updatedAt,
      correctionsCount: lines.length,
      fileSize: fileContent.length
    });

  } catch (error) {
    console.error('❌ Error reading hesudhar file:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error reading file' 
    }, { status: 500 });
  }
}
