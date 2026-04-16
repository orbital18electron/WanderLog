'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('wl_theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored || system;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('wl_theme', next);
      return next;
    });
  };

  // Avoid flash of wrong theme on SSR
  if (!mounted) return (
    <ThemeCtx.Provider value={{ theme: 'light', toggle }}>
      <div style={{ visibility: 'hidden' }}>{children}</div>
    </ThemeCtx.Provider>
  );

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
