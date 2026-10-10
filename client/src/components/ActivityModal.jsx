import { useEffect, useState } from 'react';
import { X, History, CircleDot } from 'lucide-react';
import api from '../services/api';

const pretty = action => ({ TASK_CREATED: 'Task created', TASK_REASSIGNED: 'Task reassigned', TASK_UPDATED: 'Task updated', STATUS_CHANGED: 'Status changed' }[action] || action.replaceAll('_', ' ').toLowerCase());
export default function ActivityModal({ task, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!task) return;
    setLoading(true); setError('');
    api.get(`/tasks/${task.id}/activity`).then(({ data }) => setItems(data.activity)).catch(err => setError(err.response?.data?.message || 'Could not load activity.')).finally(() => setLoading(false));
  }, [task]);
  if (!task) return null;
  const describe = item => {
    const d = item.details || {};
    if (item.action === 'STATUS_CHANGED') return `${d.from?.replaceAll('_', ' ')} → ${d.to?.replaceAll('_', ' ')}`;
    if (item.action === 'TASK_CREATED') return `Created "${d.title || task.title}"`;
    const changes = Object.entries(d).map(([key, val]) => `${key}: ${val?.from ?? '—'} → ${val?.to ?? '—'}`).join(' · ');
    return changes || 'Task details changed';
  };
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"><section className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111827]"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-indigo-600"><History size={18}/><span className="text-xs font-extrabold uppercase tracking-wider">Audit trail</span></div><h2 className="mt-2 text-xl font-extrabold">Activity history</h2><p className="mt-1 text-sm text-slate-500">{task.title}</p></div><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={19}/></button></div>
    {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading activity…</p> : error ? <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : items.length ? <div className="mt-6 space-y-5">{items.map(item => <div key={item.id} className="flex gap-3"><div className="mt-1 text-indigo-500"><CircleDot size={16}/></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{pretty(item.action)}</p><p className="mt-1 break-words text-sm text-slate-500">{describe(item)}</p><p className="mt-2 text-xs text-slate-400">{item.actor?.name || 'Team member'} · {new Date(item.createdAt).toLocaleString()}</p></div></div>)}</div> : <p className="py-10 text-center text-sm text-slate-500">No activity recorded yet.</p>}
    <button onClick={onClose} className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold dark:border-slate-700">Close</button></section></div>;
}
