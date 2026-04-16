'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getUser, togglePostVote, hasVotedPost, ROUTES } from '../lib/store';
import { useAuth } from '../hooks/useAuth';
import styles from './PostCard.module.css';

export default function PostCard({ post, onRefresh, variant = 'default' }) {
  const { user } = useAuth();
  const author = getUser(post.authorId);
  const route  = ROUTES.find(r => r.id === post.route);
  const [voted,   setVoted]   = useState(hasVotedPost(post.id, user?.id));
  const [upvotes, setUpvotes] = useState(post.upvotes);

  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const r = togglePostVote(post.id, user.id);
    if (r) { setVoted(r.voted); setUpvotes(r.upvotes); }
    onRefresh?.();
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  if (variant === 'compact') {
    return (
      <article className={styles.compact}>
        <Link href={`/post/${post.id}`} className={styles.compactLink}>
          <div className={styles.compactMeta}>
            <span className={styles.authorAvatar}>{author?.avatar}</span>
            <span className={styles.authorName}>{author?.name}</span>
          </div>
          <h3 className={styles.compactTitle}>{post.title}</h3>
          <div className={styles.compactFoot}>
            <span className={styles.timeAgo}>{timeAgo}</span>
            <button className={`${styles.voteBtn} ${voted ? styles.voted : ''}`} onClick={handleVote}>
              <ArrowUp /> {upvotes}
            </button>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <Link href={`/post/${post.id}`} className={styles.cardLink}>
        <div className={styles.cardBody}>
          {/* Author row */}
          <div className={styles.meta}>
            <Link href={`/user/${author?.username}`} className={styles.author} onClick={e => e.stopPropagation()}>
              <span className={styles.authorAvatar}>{author?.avatar}</span>
              <span className={styles.authorName}>{author?.name}</span>
            </Link>
            <span className={styles.dot}>·</span>
            <span className={styles.timeAgo}>{timeAgo}</span>
            {route && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.routeBadge}>{route.emoji} {route.name}</span>
              </>
            )}
          </div>

          <div className={styles.content}>
            <div className={styles.text}>
              <h2 className={styles.title}>{post.title}</h2>
              {post.excerpt && <p className={`${styles.excerpt} line-clamp-2`}>{post.excerpt}</p>}
            </div>

            {post.cover && (
              <div className={styles.thumb}>
                <img src={post.cover} alt="" loading="lazy" />
              </div>
            )}
          </div>

          <div className={styles.foot}>
            <div className={styles.tags}>
              {post.tags?.slice(0, 3).map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
              {post.duration && (
                <span className={styles.duration}>{post.duration} days</span>
              )}
            </div>

            <div className={styles.footRight}>
              <button
                className={`${styles.voteBtn} ${voted ? styles.voted : ''}`}
                onClick={handleVote}
                aria-label={voted ? 'Remove upvote' : 'Upvote'}
              >
                <ArrowUp />
                <span>{upvotes}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArrowUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
