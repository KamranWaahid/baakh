import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth';
import NoteBoard from './NoteBoard';
import NoteList from './NoteList';
import NoteForm from './NoteForm';

export const dynamic = 'force-dynamic';

export default async function NotesPage({ searchParams }: { searchParams: Promise<Record<string,string | string[] | undefined>> }) {
  const gate = await requireEditor();
  if (!gate.allowed) return <div>Access denied.</div>;

  const sb = await createClient();

  const resolvedSearchParams = await searchParams;
  const status = (resolvedSearchParams.status as string) || 'inbox';
  const q = (resolvedSearchParams.q as string) || '';
  const view = (resolvedSearchParams.view as string) || 'board';

  let query = sb
    .from('sticky_notes')
    .select('*, note_tags(tag_id, tags:tags(label,slug)), note_attachments(id,file_path,mime_type)')
    .is('deleted_at', null)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (q) query = query.textSearch('body', q, { type: 'websearch' });

  const { data: notes } = await query;
  const { data: allTags } = await sb.from('tags').select('id,slug,label').order('label');

  // Transform tags to match NoteForm expected type
  const transformedTags = allTags?.map(tag => ({
    id: Number(tag.id),
    slug: tag.slug,
    label: tag.label
  })) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sticky Notes</h1>
        <NoteForm tags={transformedTags} />
      </div>

      {view === 'board'
        ? <NoteBoard initialNotes={notes ?? []} />
        : <NoteList notes={notes ?? []} />}
    </div>
  );
}


