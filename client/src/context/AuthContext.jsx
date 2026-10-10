import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ctm_user') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ctm_token');
    if (!token) { setChecking(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); localStorage.setItem('ctm_user', JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem('ctm_token'); localStorage.removeItem('ctm_user'); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  const authenticate = (data) => {
    localStorage.setItem('ctm_token', data.token);
    localStorage.setItem('ctm_user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('ctm_token');
    localStorage.removeItem('ctm_user');
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, checking, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
