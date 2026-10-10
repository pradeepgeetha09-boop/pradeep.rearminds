import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckSquare, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthPages({ mode }) {
  const signup = mode === 'signup';
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace/>;
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError('');
    if (signup && form.password.length < 8) return setError('Use at least 8 characters for your password.');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/${signup ? 'signup' : 'login'}`, form);
      authenticate(data); navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Unable to connect. Make sure the backend is running.'); }
    finally { setLoading(false); }
  };
  const field = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-950';
  return <div className="grid min-h-screen bg-white dark:bg-[#0b1120] lg:grid-cols-2">
    <section className="hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-900 p-12 text-white lg:flex">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-white/15 p-3"><CheckSquare size={25}/></div><span className="text-xl font-extrabold">Taskflow</span></div>
      <div className="max-w-lg"><p className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wide">COLLABORATE WITH CLARITY</p><h1 className="text-5xl font-black leading-tight">Great work happens when teams work together.</h1><p className="mt-5 max-w-md text-lg leading-8 text-indigo-100">Organize tasks, track progress, and keep every teammate moving in the same direction.</p><div className="mt-9 flex gap-2"><span className="h-1.5 w-10 rounded-full bg-white"/><span className="h-1.5 w-5 rounded-full bg-white/40"/><span className="h-1.5 w-5 rounded-full bg-white/40"/></div></div>
      <p className="text-sm text-indigo-200">Taskflow · Collaborative Task Manager</p>
    </section>
    <section className="grid place-items-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-9 flex items-center gap-3 lg:hidden"><div className="rounded-xl bg-indigo-600 p-2.5 text-white"><CheckSquare size={22}/></div><span className="text-xl font-extrabold dark:text-white">Taskflow</span></div>
        <p className="text-sm font-bold text-indigo-600">{signup ? 'GET STARTED' : 'WELCOME BACK'}</p><h2 className="mt-2 text-3xl font-black tracking-tight dark:text-white">{signup ? 'Create your account' : 'Sign in to Taskflow'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{signup ? 'Set up your account to start collaborating.' : 'Enter your details to access your workspace.'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {signup && <><label className="block text-sm font-bold dark:text-slate-200">Full name<div className="relative mt-2"><UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={18}/><input className={field} name="name" value={form.name} onChange={change} placeholder="Your name" autoComplete="name" required maxLength="100"/></div></label>
          <label className="block text-sm font-bold dark:text-slate-200">Account role<select className={`${field} mt-2 !pl-4`} name="role" value={form.role} onChange={change}><option value="USER">User — assigned tasks</option><option value="MANAGER">Manager — manage tasks</option></select></label></>}
          <label className="block text-sm font-bold dark:text-slate-200">Email address<div className="relative mt-2"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18}/><input className={field} type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" required/></div></label>
          <label className="block text-sm font-bold dark:text-slate-200">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={18}/><input className={field} type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={change} placeholder={signup ? 'At least 8 characters' : 'Your password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : 1}/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60 dark:shadow-none">{loading ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">{signup ? 'Already have an account?' : "Don't have an account?"} <Link className="font-extrabold text-indigo-600 hover:underline" to={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</Link></p>
        <p className="mt-8 text-center text-xs leading-5 text-slate-400">Assessment demo: role selection is open during signup. Restrict Manager creation before production use.</p>
      </div>
    </section>
  </div>;
}
