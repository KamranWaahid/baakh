'use client';

import { useState } from 'react';
import { createNote } from './actions';

export default function NoteForm({ tags }: { tags: { id:number; slug:string; label:string }[] }) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title')?.toString() || '',
      body: formData.get('body')?.toString() || '',
      source_url: formData.get('source_url')?.toString() || '',
      source_author: formData.get('source_author')?.toString() || '',
      language: formData.get('language')?.toString() || 'und',
      status: 'inbox',
      tags: (formData.get('tags')?.toString() || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    };
    setBusy(true);
    try {
      await createNote(payload);
      (e.currentTarget as HTMLFormElement).reset();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input name="title" placeholder="Title (optional)" className="border px-3 py-2 rounded" />
      <input name="source_author" placeholder="@handle or author" className="border px-3 py-2 rounded" />
      <input name="source_url" placeholder="Source URL" className="border px-3 py-2 rounded w-72" />
      <input name="language" placeholder="lang (en/ur/…)" className="border px-3 py-2 rounded w-28" />
      <input name="tags" placeholder="tags,comma,separated" className="border px-3 py-2 rounded w-60" />
      <input name="body" placeholder="Paste poetry snippet…" className="border px-3 py-2 rounded w-[28rem]" required />
      <button disabled={busy} className="bg-black text-white px-4 py-2 rounded">
        {busy ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}


