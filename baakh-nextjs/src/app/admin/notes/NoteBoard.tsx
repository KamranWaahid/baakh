'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { updateNote, softDeleteNote } from './actions';
import NoteCard from './NoteCard';
import type { StickyNote } from '@/types/database';

const columns = ['inbox','review','approved','archived'] as const;

export default function NoteBoard({ initialNotes }: { initialNotes: StickyNote[] }) {
  const [notes, setNotes] = useState<StickyNote[]>(initialNotes);

  useEffect(() => {
    const channel = supabase
      .channel('notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sticky_notes' }, payload => {
        if (payload.eventType === 'INSERT') setNotes(prev => [payload.new as StickyNote, ...prev]);
        if (payload.eventType === 'UPDATE') setNotes(prev => prev.map(n => n.id === (payload.new as StickyNote).id ? payload.new as StickyNote : n));
        if (payload.eventType === 'DELETE') setNotes(prev => prev.filter(n => n.id !== (payload.old as StickyNote).id));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function onDrop(note: StickyNote, status: string) {
    await updateNote(note.id, { status: status as 'inbox' | 'review' | 'approved' | 'archived' });
  }

  async function bump(note: StickyNote) {
    await updateNote(note.id, { priority: (note.priority ?? 0) + 1 });
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(col => (
        <div key={col} className="bg-gray-50 rounded p-3 min-h-[60vh]">
          <div className="font-semibold mb-3 uppercase text-xs">{col}</div>
          <div className="space-y-3">
            {notes.filter(n => n.status === col).map(n =>
              <NoteCard key={n.id} note={n}
                onDelete={() => softDeleteNote(n.id)}
                onPromote={() => bump(n)}
                onMove={(s) => onDrop(n, s)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


