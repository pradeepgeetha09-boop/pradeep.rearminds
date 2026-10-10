import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function TaskModal({ open, onClose, onSave, users, task, saving }) {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', status: 'TODO', dueDate: '' });
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setForm(task ? { title: task.title || '', description: task.description || '', assignedTo: task.assignedTo || task.assignee?.id || '', status: task.status || 'TODO', dueDate: task.dueDate || '' } : { title: '', description: '', assignedTo: users[0]?.id || '', status: 'TODO', dueDate: '' });
      setError('');
    }
  }, [open, task, users]);
  if (!open) return null;
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Please enter a task title.');
    if (!form.assignedTo) return setError('Please choose a user to assign this task.');
    setError('');
    await onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  };
  const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950';
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111827]">
      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">{task ? 'Edit task' : 'Create a task'}</h2><p className="mt-1 text-sm text-slate-500">Keep your team moving forward.</p></div><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">Task title<input className={field} name="title" value={form.title} onChange={change} maxLength="160" placeholder="e.g. Build login page" required/></label>
        <label className="block text-sm font-semibold">Description<textarea className={field} name="description" value={form.description} onChange={change} rows="3" placeholder="Add details or acceptance notes"/></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Assign to<select className={field} name="assignedTo" value={form.assignedTo} onChange={change} required><option value="">Select a user</option>{users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select></label>
          <label className="block text-sm font-semibold">Status<select className={field} name="status" value={form.status} onChange={change}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
        </div>
        <label className="block text-sm font-semibold">Due date<input className={field} type="date" name="dueDate" value={form.dueDate} onChange={change}/></label>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
        <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </div>
  </div>;
}
