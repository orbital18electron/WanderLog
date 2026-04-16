'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import AuthModal from './AuthModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/?q=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const openLogin    = () => { setAuthMode('login');    setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  return (
    <>
      <nav className={styles.nav}>
        <div className={`${styles.inner} container`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2C12 2 8 8 8 12s4 10 4 10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2C12 2 16 8 16 12s-4 10-4 10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>WanderLog</span>
          </Link>

          {/* Search */}
          <form className={styles.search} onSubmit={handleSearch}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={styles.searchIcon} aria-hidden>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search journals..."
              aria-label="Search"
            />
          </form>

          <div className={styles.actions}>
            {/* Theme toggle */}
            <button
              className={styles.themeBtn}
              onClick={toggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link href="/write" className={styles.writeBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Write
                </Link>

                <div className={styles.userWrap} ref={menuRef}>
                  <button className={styles.userBtn} onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen}>
                    <span className={styles.avatar}>{user.avatar}</span>
                  </button>
                  {menuOpen && (
                    <div className={styles.dropdown} onClick={() => setMenuOpen(false)}>
                      <div className={styles.dropdownHead}>
                        <span className={styles.dropAvatar}>{user.avatar}</span>
                        <div>
                          <div className={styles.dropName}>{user.name}</div>
                          <div className={styles.dropUser}>@{user.username}</div>
                        </div>
                      </div>
                      <div className={styles.dropDivider} />
                      <Link href={`/user/${user.username}`} className={styles.dropItem}>Profile</Link>
                      <Link href="/write" className={styles.dropItem}>New journal</Link>
                      <div className={styles.dropDivider} />
                      <button className={styles.dropItem} onClick={logout}>Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className={styles.loginBtn} onClick={openLogin}>Sign in</button>
                <button className={styles.registerBtn} onClick={openRegister}>Get started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitch={setAuthMode}
        />
      )}
    </>
  );
}
