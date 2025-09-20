import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();

  const result = {
    database: { healthy: false as boolean, message: '' as string },
    api: { healthy: true as boolean, message: 'API reachable' },
    storage: { healthy: false as boolean, message: '' as string },
    timestamp: new Date().toISOString(),
  };

  // Database health: simple head count query
  try {
    const { count, error } = await supabase
      .from('poets')
      .select('id', { head: true, count: 'exact' });
    if (error) throw error;
    result.database.healthy = true;
    result.database.message = `OK${typeof count === 'number' ? ` (${count} poets)` : ''}`;
  } catch (err: any) {
    result.database.healthy = false;
    result.database.message = err?.message || 'Database check failed';
  }

  // Storage health: list buckets
  try {
    const { data, error } = await (supabase as any).storage.listBuckets();
    if (error) throw error;
    result.storage.healthy = true;
    result.storage.message = `OK (${Array.isArray(data) ? data.length : 0} buckets)`;
  } catch (err: any) {
    result.storage.healthy = false;
    result.storage.message = err?.message || 'Storage check failed';
  }

  return NextResponse.json(result);
}


