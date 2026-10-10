import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, CircleDashed, ListTodo, Plus, RefreshCw, Search, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ActivityModal from '../components/ActivityModal';

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user.role === 'MANAGER';
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activityTask, setActivityTask] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [taskRes, userRes] = await Promise.all([api.get('/tasks'), isManager ? api.get('/tasks/users') : Promise.resolve({ data: { users: [] } })]);
      setTasks(taskRes.data.tasks); setUsers(userRes.data.users);
    } catch (err) { setError(err.response?.data?.message || 'Could not load tasks. Check the API connection.'); }
    finally { setLoading(false); }
  }, [isManager]);
  useEffect(() => { load(); }, [load]);

  const saveTask = async data => {
    setSaving(true); setNotice('');
    try {
      if (editing) await api.patch(`/tasks/${editing.id}`, data);
      else await api.post('/tasks', data);
      setModal(false); setEditing(null); setNotice(editing ? 'Task updated successfully.' : 'Task created and assigned.'); await load();
    } catch (err) { setNotice(err.response?.data?.message || 'Unable to save task.'); }
    finally { setSaving(false); }
  };
  const editTask = task => { setEditing(task); setModal(true); };
  const newTask = () => { setEditing(null); setModal(true); };
  const deleteTask = async task => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try { await api.delete(`/tasks/${task.id}`); setNotice('Task deleted.'); await load(); }
    catch (err) { setNotice(err.response?.data?.message || 'Could not delete task.'); }
  };
  const updateStatus = async (task, status) => {
    try { await api.patch(`/tasks/${task.id}`, { status }); setNotice('Task status updated.'); await load(); }
    catch (err) { setNotice(err.response?.data?.message || 'Could not update status.'); }
  };
  const visible = tasks.filter(t => `${t.title} ${t.description || ''} ${t.assignee?.name || ''}`.toLowerCase().includes(query.toLowerCase()));
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < new Date().toISOString().slice(0,10) && t.status !== 'COMPLETED').length;
  const stats = [
    { label: 'Total tasks', value: tasks.length, icon: ListTodo, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300' },
    { label: 'In progress', value: inProgress, icon: CircleDashed, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' },
    { label: isManager ? 'Team members' : 'Overdue tasks', value: isManager ? users.length : overdue, icon: isManager ? UsersRound : ArrowUpRight, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300' }
  ];

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-indigo-600">WORKSPACE / OVERVIEW</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Good day, {user.name.split(' ')[0]} <span aria-hidden="true">✦</span></h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{isManager ? 'Here is what is happening across the tasks you manage.' : 'Here are the tasks assigned to you and what needs your attention.'}</p></div><div className="flex gap-2"><button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827]"><RefreshCw size={16}/> Refresh</button>{isManager && <button onClick={newTask} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none"><Plus size={17}/> New task</button>}</div></div>
    {notice && <div role="status" className="mt-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">{notice}<button onClick={() => setNotice('')} className="font-bold">Dismiss</button></div>}
    {error && <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error} <button onClick={load} className="ml-2 font-bold underline">Try again</button></div>}
    <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">{stats.map(s => <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500 sm:text-sm">{s.label}</span><span className={`rounded-xl p-2.5 ${s.color}`}><s.icon size={19}/></span></div><p className="mt-4 text-3xl font-black tracking-tight">{loading ? '—' : s.value}</p><p className="mt-1 text-xs text-slate-400">Current overview</p></div>)}</div>
    <div className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold"> {isManager ? 'Tasks you manage' : 'My assigned tasks'} </h2><p className="mt-1 text-sm text-slate-500">{visible.length} task{visible.length === 1 ? '' : 's'} shown</p></div><div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-[#111827]"/></div></div>
    {loading ? <div className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"/>)}</div> :
      visible.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(task => <TaskCard key={task.id} task={task} isManager={isManager} onEdit={editTask} onDelete={deleteTask} onStatus={updateStatus} onActivity={setActivityTask}/>)}</div> :
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-[#111827]"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><ListTodo size={26}/></div><h3 className="mt-4 text-lg font-extrabold">{query ? 'No matching tasks' : 'Your task list is clear'}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{query ? 'Try a different search term.' : isManager ? 'Create your first task and assign it to a team member.' : 'When a manager assigns you a task, it will appear here.'}</p>{isManager && !query && <button onClick={newTask} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="mr-1 inline" size={16}/> Create first task</button>}</div>}
    <TaskModal open={modal} onClose={() => {setModal(false); setEditing(null);}} onSave={saveTask} users={users} task={editing} saving={saving}/>
    <ActivityModal task={activityTask} onClose={() => setActivityTask(null)}/>
  </div>;
}
