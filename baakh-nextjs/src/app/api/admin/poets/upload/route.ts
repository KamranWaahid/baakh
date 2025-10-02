export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();

    const formData = await request.formData();
    const file = formData.get('file') as unknown as File | null;
    const providedName = (formData.get('filename') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const safeExt = (file.type?.split('/')[1] || 'webp').replace(/[^a-zA-Z0-9]/g, '') || 'webp';
    const baseName = providedName && providedName.trim().length > 0
      ? providedName
      : `poet-${Date.now()}.${safeExt}`;

    // Upload using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from('poet-images')
      .upload(baseName, bytes, {
        contentType: file.type || 'image/webp',
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('poet-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}


