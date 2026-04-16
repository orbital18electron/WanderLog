'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, register, logout, updateProfile } from '../lib/store';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  const doLogin = (username) => {
    const r = login(username);
    if (r.user) setUser(r.user);
    return r;
  };
  const doRegister = (username, name) => {
    const r = register(username, name);
    if (r.user) setUser(r.user);
    return r;
  };
  const doLogout = () => { logout(); setUser(null); };
  const doUpdateProfile = (updates) => {
    const u = updateProfile(updates);
    if (u) setUser(u);
    return u;
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login: doLogin, register: doRegister, logout: doLogout, updateProfile: doUpdateProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
