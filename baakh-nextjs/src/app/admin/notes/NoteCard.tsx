'use client';

export default function NoteCard({ note, onPromote, onMove, onDelete }:{
  note:any; onPromote:()=>void; onMove:(status:string)=>void; onDelete:()=>void;
}) {
  return (
    <div className="border bg-white rounded p-3 shadow-sm">
      {note.title && <div className="font-medium">{note.title}</div>}
      <div className="whitespace-pre-wrap text-sm mt-1">{note.body}</div>
      <div className="text-xs text-gray-500 mt-2 flex gap-2 flex-wrap">
        {note.source_author && <span>by {note.source_author}</span>}
        {note.source_url && <a className="underline" href={note.source_url} target="_blank">source</a>}
        {note.language && <span>· {note.language}</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <select defaultValue={note.status} onChange={e => onMove(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="inbox">Inbox</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={onPromote} className="text-xs border px-2 py-1 rounded">Bump</button>
        <button onClick={onDelete} className="text-xs text-red-600 border px-2 py-1 rounded">Delete</button>
      </div>
    </div>
  );
}


