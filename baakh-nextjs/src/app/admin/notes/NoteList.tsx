export default function NoteList({ notes }:{ notes:any[] }) {
  return (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-gray-50">
          <th className="p-2 text-left">Title</th>
          <th className="p-2 text-left">Snippet</th>
          <th className="p-2">Status</th>
          <th className="p-2">Tags</th>
          <th className="p-2">Source</th>
          <th className="p-2">Created</th>
        </tr>
      </thead>
      <tbody>
        {notes?.map(n => (
          <tr key={n.id} className="border-t">
            <td className="p-2">{n.title}</td>
            <td className="p-2">{(n.body || '').slice(0,160)}</td>
            <td className="p-2 text-center">{n.status}</td>
            <td className="p-2">{n.note_tags?.map((nt:any)=>nt.tags?.label).filter(Boolean).join(', ')}</td>
            <td className="p-2">
              {n.source_url ? <a className="underline" href={n.source_url} target="_blank">link</a> : '—'}
            </td>
            <td className="p-2">{new Date(n.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


