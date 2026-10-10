import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPages mode="login"/>}/>
    <Route path="/signup" element={<AuthPages mode="signup"/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<Layout/>}>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/tasks" element={<Dashboard/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
