import { CalendarDays, Clock3, Pencil, Trash2, UserRound } from 'lucide-react';

const statusStyle = {
  TODO: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
};
const statusLabel = { TODO: 'To do', IN_PROGRESS: 'In progress', COMPLETED: 'Completed' };
export default function TaskCard({ task, isManager, onEdit, onDelete, onStatus, onActivity }) {
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-[#111827]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[task.status]}`}>{statusLabel[task.status]}</span><h3 className="mt-3 break-words text-base font-extrabold">{task.title}</h3></div>
      {isManager && <div className="flex shrink-0 gap-1"><button onClick={() => onEdit(task)} title="Edit task" className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"><Pencil size={16}/></button><button onClick={() => onDelete(task)} title="Delete task" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 size={16}/></button></div>}
    </div>
    <p className="mt-2 min-h-10 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500 dark:text-slate-400">{task.description || 'No description added.'}</p>
    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <p className="flex items-center gap-2"><UserRound size={14}/>{isManager ? `Assigned to ${task.assignee?.name || 'Unknown user'}` : `Created by ${task.creator?.name || 'Manager'}`}</p>
      <p className="flex items-center gap-2"><CalendarDays size={14}/>{task.dueDate ? `Due ${task.dueDate}` : 'No due date'}</p>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      {!isManager ? <select aria-label={`Update status for ${task.title}`} value={task.status} onChange={e => onStatus(task, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select> : <span className="flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13}/>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>}
      <button onClick={() => onActivity(task)} className="rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950">Activity history</button>
    </div>
  </article>;
}
