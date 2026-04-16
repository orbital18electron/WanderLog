'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getByUsername, getPosts, JOURNEY_TYPES } from '../../../lib/store';
import { useAuth } from '../../../hooks/useAuth';
import PostCard from '../../../components/PostCard';
import styles from './profile.module.css';

const AVATARS = ['🌍','🧭','✈️','🏔️','🌊','🗺️','⛺','🌺','🌿','📷','🎒','🏄','🧗','🚵','🤿','🌏','🦅','🐋'];

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({ name: '', bio: '', avatar: '' });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const u = getByUsername(username);
    if (!u) { setNotFound(true); return; }
    setProfile(u);
    setDraft({ name: u.name, bio: u.bio || '', avatar: u.avatar });
    setPosts(getPosts().filter(p => p.authorId === u.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [username]);

  if (notFound) return (
    <div className={styles.notFound}>
      <p>👤</p>
      <h2>User not found</h2>
      <Link href="/">← Back to feed</Link>
    </div>
  );

  if (!profile) return null;

  const isMe        = me?.id === profile.id;
  const totalVotes  = posts.reduce((s, p) => s + p.upvotes, 0);
  const topRouteEntry = (() => {
    const counts = {};
    posts.forEach(p => { if (p.route) counts[p.route] = (counts[p.route]||0)+1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  })();

  const saveEdit = () => {
    updateProfile(draft);
    setProfile(p => ({ ...p, ...draft }));
    setEditing(false);
  };

  return (
    <div className={styles.page}>
      {/* Profile header */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.left}>
              <div className={styles.avatar}>{editing ? draft.avatar : profile.avatar}</div>
              <div className={styles.info}>
                {editing ? (
                  <div className={styles.editForm}>
                    <div className={styles.avatarPicker}>
                      {AVATARS.map(a => (
                        <button
                          key={a}
                          className={`${styles.avatarOpt} ${draft.avatar === a ? styles.avatarOptActive : ''}`}
                          onClick={() => setDraft(d => ({ ...d, avatar: a }))}
                        >{a}</button>
                      ))}
                    </div>
                    <input
                      className={styles.editInput}
                      value={draft.name}
                      onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                      placeholder="Display name"
                    />
                    <textarea
                      className={styles.editBio}
                      rows={2}
                      value={draft.bio}
                      onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                      placeholder="A sentence about how you travel…"
                    />
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={saveEdit}>Save</button>
                      <button className={styles.cancelEditBtn} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className={styles.name}>{profile.name}</h1>
                    <p className={styles.handle}>@{profile.username}</p>
                    {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                    <p className={styles.joined}>Member since {format(new Date(profile.joined), 'MMMM yyyy')}</p>
                    {isMe && (
                      <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit profile</button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>{posts.length}</span>
                <span className={styles.statLabel}>Journals</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{totalVotes}</span>
                <span className={styles.statLabel}>Upvotes</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{posts.reduce((s,p) => s + (p.duration||0), 0)}</span>
                <span className={styles.statLabel}>Days travelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                {isMe ? 'Your journals' : 'Journals'}
              </h2>
              <span className={styles.sectionCount}>{posts.length}</span>
            </div>

            {posts.length === 0 ? (
              <div className={styles.empty}>
                <p>🗺️</p>
                <h3>No journals yet</h3>
                {isMe && <Link href="/write" className={styles.emptyLink}>Write your first journal →</Link>}
              </div>
            ) : (
              posts.map(p => <PostCard key={p.id} post={p} />)
            )}
          </main>

          <aside className={styles.sidebar}>
            {JOURNEY_TYPES.filter(t => posts.some(p => p.journeyType === t.id)).length > 0 && (
              <div className={styles.sideBox}>
                <div className={styles.sideBoxTitle}>Journey types</div>
                {JOURNEY_TYPES.map(t => {
                  const count = posts.filter(p => p.journeyType === t.id).length;
                  if (!count) return null;
                  return (
                    <div key={t.id} className={styles.typeRow}>
                      <span>{t.emoji} {t.label}</span>
                      <span className={styles.typeCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {isMe && (
              <div className={styles.sideBox}>
                <div className={styles.sideBoxTitle}>Keep writing</div>
                <p className={styles.sideCopy}>Every trip is worth documenting. Your next journal is waiting.</p>
                <Link href="/write" className={styles.sideWriteBtn}>New journal</Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
