'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  getPost, getUser, getPostComments, addComment,
  togglePostVote, hasVotedPost,
  toggleCommentVote, hasVotedComment,
  deletePost, ROUTES, JOURNEY_TYPES
} from '../../../lib/store';
import { useAuth } from '../../../hooks/useAuth';
import dynamic from 'next/dynamic';
import styles from './post.module.css';

const TripMap = dynamic(() => import('../../../components/TripMap'), { ssr: false });

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post,      setPost]      = useState(null);
  const [comments,  setComments]  = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [voted,     setVoted]     = useState(false);
  const [upvotes,   setUpvotes]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [replyTo,   setReplyTo]   = useState(null);
  const [notFound,  setNotFound]  = useState(false);
  const commentBoxRef = useRef(null);

  useEffect(() => {
    const p = getPost(id);
    if (!p) { setNotFound(true); return; }
    setPost(p);
    setUpvotes(p.upvotes);
    setVoted(hasVotedPost(id, user?.id));
    setComments(getPostComments(id));
  }, [id, user?.id]);

  if (notFound) return (
    <div className={styles.notFound}>
      <p>🗺️</p>
      <h2>Journal not found</h2>
      <Link href="/">← Back to feed</Link>
    </div>
  );

  if (!post) return null;

  const author      = getUser(post.authorId);
  const route       = ROUTES.find(r => r.id === post.route);
  const journeyType = JOURNEY_TYPES.find(t => t.id === post.journeyType);
  const isAuthor    = user?.id === post.authorId;

  const handleVote = () => {
    if (!user) return;
    const r = togglePostVote(id, user.id);
    if (r) { setVoted(r.voted); setUpvotes(r.upvotes); }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    addComment(id, user.id, comment.trim(), replyTo);
    setComments(getPostComments(id));
    setComment('');
    setReplyTo(null);
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this journal entry?')) return;
    deletePost(id);
    router.push('/');
  };

  const topLevel = comments.filter(c => !c.parentId).sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className={styles.page}>
      {/* Cover */}
      {post.cover && (
        <div className={styles.cover}>
          <img src={post.cover} alt={post.title} priority="true" />
          <div className={styles.coverFade} />
        </div>
      )}

      <div className="container">
        <div className={styles.layout}>

          {/* Article */}
          <article className={styles.article}>

            {/* Header */}
            <header className={styles.header}>
              <div className={styles.badges}>
                {route && (
                  <Link href={`/?route=${route.id}`} className={styles.routeBadge}>
                    {route.emoji} {route.name}
                  </Link>
                )}
                {journeyType && (
                  <span className={styles.typeBadge}>{journeyType.emoji} {journeyType.label}</span>
                )}
                {post.duration && (
                  <span className={styles.typeBadge}>{post.duration} days</span>
                )}
              </div>

              <h1 className={styles.title}>{post.title}</h1>

              {post.excerpt && (
                <p className={styles.lead}>{post.excerpt}</p>
              )}

              {/* Byline */}
              <div className={styles.byline}>
                <Link href={`/user/${author?.username}`} className={styles.bylineAuthor}>
                  <span className={styles.bylineAvatar}>{author?.avatar}</span>
                  <div className={styles.bylineMeta}>
                    <span className={styles.bylineName}>{author?.name}</span>
                    <span className={styles.bylineDate}>
                      {post.startDate && `${format(new Date(post.startDate), 'MMMM yyyy')} · `}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>

                <div className={styles.bylineActions}>
                  <button
                    className={`${styles.voteHero} ${voted ? styles.voteHeroActive : ''}`}
                    onClick={handleVote}
                    title={user ? (voted ? 'Remove vote' : 'Upvote') : 'Sign in to vote'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {upvotes}
                  </button>

                  {isAuthor && (
                    <>
                      <Link href={`/write/${id}`} className={styles.editBtn}>Edit</Link>
                      <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
                    </>
                  )}
                </div>
              </div>

              {post.tags?.length > 0 && (
                <div className={styles.tags}>
                  {post.tags.map(t => (
                    <Link key={t} href={`/?q=${t}`} className={styles.tag}>{t}</Link>
                  ))}
                </div>
              )}
            </header>

            {/* Map */}
            {post.days?.some(d => d.lat) && (
              <div className={styles.mapWrap}>
                <TripMap
                  days={post.days}
                  activeDay={activeDay}
                  center={post.mapCenter}
                  zoom={post.mapZoom}
                />
              </div>
            )}

            {/* Day timeline */}
            {post.days?.length > 0 && (
              <section className={styles.timeline}>
                <div className={styles.dayTabs} role="tablist">
                  {post.days.map((day, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={activeDay === i}
                      className={`${styles.dayTab} ${activeDay === i ? styles.dayTabActive : ''}`}
                      onClick={() => setActiveDay(i)}
                    >
                      <span className={styles.dayNum}>Day {day.day}</span>
                      <span className={`${styles.dayLoc} truncate`}>{day.location?.split(',')[0]}</span>
                    </button>
                  ))}
                </div>

                {post.days.map((day, i) => (
                  <div
                    key={i}
                    role="tabpanel"
                    className={`${styles.dayPanel} ${activeDay === i ? styles.dayPanelActive : ''}`}
                    hidden={activeDay !== i}
                  >
                    <div className={styles.dayHeader}>
                      <span className={styles.dayLabel}>Day {day.day}</span>
                      <h2 className={styles.dayTitle}>{day.title}</h2>
                      <p className={styles.dayLocation}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
                        </svg>
                        {day.location}
                      </p>
                    </div>
                    <div className={styles.dayBody}>
                      {day.content.split('\n\n').map((para, j) => (
                        <p key={j}>{para}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Divider */}
            <div className={styles.divider} />

            {/* Comments */}
            <section id="comments" className={styles.comments} ref={commentBoxRef}>
              <h3 className={styles.commentsTitle}>
                {comments.length} {comments.length === 1 ? 'response' : 'responses'}
              </h3>

              {user ? (
                <form className={styles.commentForm} onSubmit={handleComment}>
                  {replyTo && (
                    <div className={styles.replyBanner}>
                      <span>Replying to a comment</span>
                      <button type="button" onClick={() => setReplyTo(null)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className={styles.commentInputRow}>
                    <span className={styles.commentAvatar}>{user.avatar}</span>
                    <textarea
                      className={styles.commentInput}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your thoughts…"
                      rows={3}
                    />
                  </div>
                  <div className={styles.commentActions}>
                    <button
                      type="submit"
                      className={styles.commentSubmit}
                      disabled={!comment.trim()}
                    >
                      Respond
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.commentGuest}>
                  Sign in to join the conversation
                </div>
              )}

              <div className={styles.commentList}>
                {topLevel.map(c => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    replies={comments.filter(r => r.parentId === c.id)}
                    user={user}
                    onVote={() => setComments(getPostComments(id))}
                    onReply={(cid) => {
                      setReplyTo(cid);
                      commentBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  />
                ))}
              </div>
            </section>
          </article>

          {/* Sticky sidebar */}
          <aside className={styles.sidebar}>
            <Link href={`/user/${author?.username}`} className={styles.sideAuthor}>
              <span className={styles.sideAvatar}>{author?.avatar}</span>
              <div>
                <div className={styles.sideAuthorName}>{author?.name}</div>
                {author?.bio && <div className={styles.sideAuthorBio}>{author.bio}</div>}
              </div>
            </Link>

            {post.days?.length > 0 && (
              <div className={styles.sideNav}>
                <div className={styles.sideNavTitle}>In this journal</div>
                {post.days.map((day, i) => (
                  <button
                    key={i}
                    className={`${styles.sideNavItem} ${activeDay === i ? styles.sideNavActive : ''}`}
                    onClick={() => setActiveDay(i)}
                  >
                    <span className={styles.sideNavDay}>Day {day.day}</span>
                    <span className={`${styles.sideNavLoc} truncate`}>{day.location?.split(',')[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, replies, user, onVote, onReply }) {
  const author = getUser(comment.authorId);
  const [voted,   setVoted]   = useState(hasVotedComment(comment.id, user?.id));
  const [upvotes, setUpvotes] = useState(comment.upvotes);

  const handleVote = () => {
    if (!user) return;
    const r = toggleCommentVote(comment.id, user.id);
    if (r) { setVoted(r.voted); setUpvotes(r.upvotes); onVote(); }
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <Link href={`/user/${author?.username}`} className={styles.commentAuthor}>
          <span className={styles.commentAvatar}>{author?.avatar}</span>
          <strong>{author?.name}</strong>
        </Link>
        <span className={styles.commentTime}>
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className={styles.commentBody}>{comment.content}</p>
      <div className={styles.commentFoot}>
        <button
          className={`${styles.commentVote} ${voted ? styles.commentVoteActive : ''}`}
          onClick={handleVote}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {upvotes}
        </button>
        {user && (
          <button className={styles.replyBtn} onClick={() => onReply(comment.id)}>Reply</button>
        )}
      </div>
      {replies?.length > 0 && (
        <div className={styles.replies}>
          {replies.map(r => (
            <CommentItem key={r.id} comment={r} replies={[]} user={user} onVote={onVote} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
