'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPosts, ROUTES, JOURNEY_TYPES } from '../lib/store';
import PostCard from '../components/PostCard';
import styles from './home.module.css';

const TABS = [
  { id: 'new', label: 'Latest' },
  { id: 'top', label: 'Top' },
  { id: 'hot', label: 'Trending' },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [posts,       setPosts]       = useState([]);
  const [tab,         setTab]         = useState('new');
  const [routeFilter, setRouteFilter] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');

  const load = () => {
    let all = getPosts();
    if (q) {
      const qLow = q.toLowerCase();
      all = all.filter(p =>
        p.title.toLowerCase().includes(qLow) ||
        p.excerpt?.toLowerCase().includes(qLow) ||
        p.tags?.some(t => t.toLowerCase().includes(qLow)) ||
        p.days?.some(d => d.location?.toLowerCase().includes(qLow))
      );
    }
    if (routeFilter) all = all.filter(p => p.route === routeFilter);
    if (typeFilter)  all = all.filter(p => p.journeyType === typeFilter);
    if (tab === 'new') {
      all = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (tab === 'top') {
      all = all.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      all = all.sort((a, b) => {
        const age = (d) => (Date.now() - new Date(d).getTime()) / 86400000;
        return (b.upvotes / (1 + age(b.createdAt))) - (a.upvotes / (1 + age(a.createdAt)));
      });
    }
    setPosts(all);
  };

  useEffect(() => { load(); }, [tab, routeFilter, typeFilter, q]);

  return (
    <div className={styles.page}>
      {!q && !routeFilter && (
        <div className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <p className={styles.heroEyebrow}>Travel Journal Community</p>
              <h1 className={styles.heroTitle}>
                Every journey deserves<br />
                <em>a story worth reading.</em>
              </h1>
              <p className={styles.heroSub}>
                Real journals from real travellers. Day-by-day itineraries,
                honest observations, and the places that changed us.
              </p>
            </div>
          </div>
          <div className={styles.heroDivider} />
        </div>
      )}

      <div className="container">
        {q && (
          <div className={styles.searchBanner}>
            <h2>Results for <em>"{q}"</em></h2>
            <p>{posts.length} journal{posts.length !== 1 ? 's' : ''}</p>
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.feed}>
            <div className={styles.controls}>
              <div className={styles.tabs}>
                {TABS.map(t => (
                  <button
                    key={t.id}
                    className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <select
                className={styles.typeSelect}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {JOURNEY_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>

            {posts.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyIcon}>🗺️</p>
                <h3>No journals found</h3>
                <p>Try different filters, or <Link href="/write">write the first one</Link>.</p>
              </div>
            ) : (
              <div className={styles.posts}>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onRefresh={load} />
                ))}
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sideSection}>
              <h3 className={styles.sideTitle}>Routes</h3>
              <nav className={styles.routeList}>
                <button
                  className={`${styles.routeItem} ${routeFilter === '' ? styles.routeActive : ''}`}
                  onClick={() => setRouteFilter('')}
                >
                  <span className={styles.routeEmoji}>🌍</span>
                  <span className={styles.routeName}>All destinations</span>
                </button>
                {ROUTES.map(r => (
                  <button
                    key={r.id}
                    className={`${styles.routeItem} ${routeFilter === r.id ? styles.routeActive : ''}`}
                    onClick={() => setRouteFilter(routeFilter === r.id ? '' : r.id)}
                  >
                    <span className={styles.routeEmoji}>{r.emoji}</span>
                    <div className={styles.routeInfo}>
                      <span className={styles.routeName}>{r.name}</span>
                      <span className={styles.routeCount}>{r.members.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            <div className={styles.sideSection}>
              <h3 className={styles.sideTitle}>Write</h3>
              <p className={styles.sideCopy}>Share your itinerary, day-by-day observations, and the moments that made it worth going.</p>
              <Link href="/write" className={styles.sideWriteBtn}>Start a journal</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper required by Next.js when using useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <HomeContent />
    </Suspense>
  );
}
