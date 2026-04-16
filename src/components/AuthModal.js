'use client';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthModal.module.css';

const DEMO = [
  { username: 'elena_wanders', label: 'Elena Marchetti' },
  { username: 'kai_roams',     label: 'Kai Nakamura'   },
  { username: 'priya_travels', label: 'Priya Sharma'   },
];

export default function AuthModal({ mode, onClose, onSwitch }) {
  const { login, register } = useAuth();
  const [form, setForm]   = useState({ username: '', name: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    let r;
    if (mode === 'login') {
      r = login(form.username);
    } else {
      if (!form.name.trim()) { setError('Display name is required'); setBusy(false); return; }
      r = register(form.username, form.name);
    }
    setBusy(false);
    if (r?.error) { setError(r.error); return; }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>

        <div className={styles.header}>
          <div className={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2C12 2 8 8 8 12s4 10 4 10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2C12 2 16 8 16 12s-4 10-4 10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Join WanderLog'}</h2>
          <p>{mode === 'login' ? 'Sign in to your journal' : 'Start sharing your journeys'}</p>
        </div>

        {mode === 'login' && (
          <div className={styles.demos}>
            <p className={styles.demoLabel}>Try a demo account</p>
            <div className={styles.demoBtns}>
              {DEMO.map(d => (
                <button key={d.username} className={styles.demoBtn}
                  onClick={() => { login(d.username); onClose(); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={form.username} onChange={e => set('username', e.target.value)}
              placeholder="your_username" required autoComplete="username" />
          </div>

          {mode === 'register' && (
            <div className={styles.field}>
              <label htmlFor="name">Display name</label>
              <input id="name" type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your full name" required />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
          <button onClick={() => { setError(''); onSwitch(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Get started' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
