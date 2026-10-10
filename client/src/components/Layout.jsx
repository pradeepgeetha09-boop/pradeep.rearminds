import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CheckSquare, LayoutDashboard, ListTodo, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('ctm_theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ctm_theme', dark ? 'dark' : 'light');
  }, [dark]);
  const signOut = () => { logout(); navigate('/login'); };
  const linkClass = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`;

  return <div className="min-h-screen bg-[#f6f7fb] text-slate-800 dark:bg-[#0b1120] dark:text-slate-100 md:flex">
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111827] md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r md:p-6">
      <div className="mb-5 flex items-center gap-3 md:mb-10">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><CheckSquare size={22}/></div>
        <div><p className="text-lg font-extrabold tracking-tight">Taskflow</p><p className="text-xs text-slate-400">Work better together</p></div>
      </div>
      <nav className="flex gap-2 md:flex-col">
        <NavLink to="/" end className={linkClass}><LayoutDashboard size={18}/> Dashboard</NavLink>
        <NavLink to="/tasks" className={linkClass}><ListTodo size={18}/> Tasks</NavLink>
      </nav>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800 md:mt-auto md:block">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><UserRound size={18}/></div>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{user?.name}</p><p className="text-xs text-slate-400">{user?.role === 'MANAGER' ? 'Manager' : 'Team member'}</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setDark(!dark)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">{dark ? <Sun size={16}/> : <Moon size={16}/>} {dark ? 'Light' : 'Dark'} mode</button>
          <button onClick={signOut} title="Sign out" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700"><LogOut size={18}/></button>
        </div>
      </div>
    </aside>
    <main className="min-w-0 flex-1 p-4 sm:p-7 md:ml-64 md:p-10"><Outlet/></main>
  </div>;
}
