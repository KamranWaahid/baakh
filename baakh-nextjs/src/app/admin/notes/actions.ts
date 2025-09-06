'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const NoteSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().min(1),
  source_url: z.string().url().optional().or(z.literal('')),
  source_author: z.string().max(120).optional(),
  language: z.string().max(16).default('und'),
  status: z.enum(['inbox','review','approved','archived']).default('inbox'),
  tags: z.array(z.string()).default([])
});

export async function createNote(form: unknown) {
  const sb = await createClient();
  const parsed = NoteSchema.parse(form);

  if (parsed.tags.length) {
    const rows = parsed.tags.map(slug => ({ slug, label: slug }));
    await sb.from('tags').upsert(rows, { onConflict: 'slug' });
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: note, error } = await sb.from('sticky_notes')
    .insert({
      title: parsed.title || null,
      body: parsed.body,
      source_url: parsed.source_url || null,
      source_author: parsed.source_author || null,
      language: parsed.language,
      status: parsed.status,
      created_by: user.id,
      updated_by: user.id
    })
    .select('*')
    .single();
  if (error) throw error;

  if (parsed.tags.length) {
    const { data: tagRows } = await sb.from('tags').select('id,slug').in('slug', parsed.tags);
    if (tagRows?.length) {
      await sb.from('note_tags').insert(tagRows.map((t: any) => ({ note_id: note.id, tag_id: t.id })));
    }
  }

  revalidatePath('/admin/notes');
  return note;
}

export async function updateNote(id: string, patch: Partial<z.infer<typeof NoteSchema>> & { priority?: number }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { tags, ...fields } = patch as any;

  if (Object.keys(fields).length) {
    const { error } = await sb.from('sticky_notes').update({ ...fields, updated_by: user.id }).eq('id', id);
    if (error) throw error;
  }

  if (tags) {
    if (tags.length) {
      await sb.from('tags').upsert(tags.map((slug: string) => ({ slug, label: slug })), { onConflict: 'slug' });
      const { data: tagRows } = await sb.from('tags').select('id,slug').in('slug', tags as string[]);
      await sb.from('note_tags').delete().eq('note_id', id);
      if (tagRows?.length) {
        await sb.from('note_tags').insert(tagRows.map((t: any) => ({ note_id: id, tag_id: t.id })));
      }
    } else {
      await sb.from('note_tags').delete().eq('note_id', id);
    }
  }

  revalidatePath('/admin/notes');
}

export async function softDeleteNote(id: string) {
  const sb = await createClient();
  const { error } = await sb.from('sticky_notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/notes');
}


