'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { createPost, updatePost, getPost, ROUTES, JOURNEY_TYPES } from '../../../lib/store';
import styles from './write.module.css';

const BLANK_DAY = { day: 1, location: '', lat: '', lng: '', title: '', content: '' };

const AI_SUGGESTIONS = [
  'Describe the atmosphere and sensory details of this place',
  'Add historical context about this destination',
  'Suggest what I might have eaten or drunk here',
  'Write a reflective closing paragraph for today',
  'Describe the feeling of arriving somewhere new',
];

export default function WritePage() {
  const { user } = useAuth();
  const router   = useRouter();
  const params   = useParams();
  const editId   = params?.id;

  const [form, setForm] = useState({
    title: '', excerpt: '', cover: '',
    route: '', journeyType: '', duration: '', startDate: '', tags: '',
    days: [{ ...BLANK_DAY }],
  });

  const [tab,        setTab]        = useState('meta');
  const [dayIdx,     setDayIdx]     = useState(0);
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [aiOpen,     setAiOpen]     = useState(false);
  const [aiPrompt,   setAiPrompt]   = useState('');
  const [aiResult,   setAiResult]   = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    if (editId) {
      const p = getPost(editId);
      if (!p || p.authorId !== user.id) { router.replace('/'); return; }
      setForm({
        title: p.title || '', excerpt: p.excerpt || '', cover: p.cover || '',
        route: p.route || '', journeyType: p.journeyType || '',
        duration: p.duration || '', startDate: p.startDate || '',
        tags: p.tags?.join(', ') || '',
        days: p.days?.length ? p.days : [{ ...BLANK_DAY }],
      });
    }
  }, [user, editId]);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setDay = (i, k, v) => {
    const days = [...form.days];
    days[i] = { ...days[i], [k]: v };
    setForm(f => ({ ...f, days }));
  };

  const addDay = () => {
    const last = form.days[form.days.length - 1];
    setForm(f => ({ ...f, days: [...f.days, { ...BLANK_DAY, day: last.day + 1 }] }));
    setDayIdx(form.days.length);
  };

  const removeDay = (i) => {
    if (form.days.length <= 1) return;
    const days = form.days.filter((_, idx) => idx !== i);
    setForm(f => ({ ...f, days }));
    setDayIdx(Math.min(dayIdx, days.length - 1));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.route)        e.route = 'Route required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { setTab('meta'); return; }
    setSaving(true);
    const data = {
      authorId: user.id,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      cover: form.cover.trim(),
      route: form.route,
      journeyType: form.journeyType,
      duration: parseInt(form.duration) || form.days.length,
      startDate: form.startDate,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      days: form.days.map(d => ({
        ...d,
        lat: parseFloat(d.lat) || null,
        lng: parseFloat(d.lng) || null,
      })),
      mapCenter: form.days[0]?.lat
        ? [parseFloat(form.days[0].lat), parseFloat(form.days[0].lng)]
        : null,
      mapZoom: 6,
    };

    if (editId) {
      updatePost(editId, data);
      router.push(`/post/${editId}`);
    } else {
      const p = createPost(data);
      router.push(`/post/${p.id}`);
    }
    setSaving(false);
  };

  const runAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult('');
    const day = form.days[dayIdx];
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You are a travel writing assistant for WanderLog. Help the user write vivid, authentic journal entries. Be concise and evocative. Current journal: "${form.title || 'untitled'}"`,
          messages: [{
            role: 'user',
            content: `${aiPrompt}\n\nContext — Day ${day.day}, ${day.location || 'unknown location'}.\nExisting entry: "${(day.content || '').slice(0, 300)}"`
          }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data.content?.map(c => c.text || '').join('') || 'No response.');
    } catch (err) {
      setAiResult(`Error: ${err.message || 'Could not reach AI assistant. Check your .env.local file.'}`);
    }
    setAiLoading(false);
  };

  const appendAi = () => {
    const cur = form.days[dayIdx].content || '';
    setDay(dayIdx, 'content', cur + (cur ? '\n\n' : '') + aiResult);
    setAiResult('');
    setAiPrompt('');
  };

  if (!user) return null;

  const curDay = form.days[dayIdx];

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={`${styles.topBarInner} container`}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.topBarTitle}>{editId ? 'Edit journal' : 'New journal'}</h1>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
            <button className={styles.publishBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.inner}>
          {/* Tab bar */}
          <div className={styles.tabBar}>
            {['meta', 'days', 'preview'].map(t => (
              <button
                key={t}
                className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'meta' ? 'Overview' : t === 'days' ? 'Day entries' : 'Preview'}
              </button>
            ))}
          </div>

          {/* ── META TAB ── */}
          {tab === 'meta' && (
            <div className={`${styles.panel} animate-fadeUp`}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullCol}`}>
                  <label>Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Three Weeks in Japan: Cherry Blossoms and Mountain Silence"
                    className={errors.title ? styles.fieldError : ''}
                  />
                  {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
                </div>

                <div className={`${styles.field} ${styles.fullCol}`}>
                  <label>Opening excerpt</label>
                  <textarea
                    rows={3}
                    value={form.excerpt}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="One paragraph that draws readers in — your first impression, the moment you arrived, the thing that made this journey different…"
                  />
                </div>

                <div className={`${styles.field} ${styles.fullCol}`}>
                  <label>Cover image URL</label>
                  <input
                    type="url"
                    value={form.cover}
                    onChange={e => set('cover', e.target.value)}
                    placeholder="https://images.unsplash.com/…"
                  />
                  {form.cover && (
                    <div className={styles.coverPreview}>
                      <img src={form.cover} alt="Cover preview" onError={e => { e.target.style.display='none'; }} />
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Route / region *</label>
                  <select
                    value={form.route}
                    onChange={e => set('route', e.target.value)}
                    className={errors.route ? styles.fieldError : ''}
                  >
                    <option value="">Select…</option>
                    {ROUTES.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}
                  </select>
                  {errors.route && <span className={styles.errorMsg}>{errors.route}</span>}
                </div>

                <div className={styles.field}>
                  <label>Journey type</label>
                  <select value={form.journeyType} onChange={e => set('journeyType', e.target.value)}>
                    <option value="">Select…</option>
                    {JOURNEY_TYPES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Start date</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label>Duration (days)</label>
                  <input type="number" min="1" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="14" />
                </div>

                <div className={`${styles.field} ${styles.fullCol}`}>
                  <label>Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                    placeholder="Japan, solo, spring, culture, hiking  (comma-separated)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── DAYS TAB ── */}
          {tab === 'days' && (
            <div className={`${styles.daysPanel} animate-fadeUp`}>
              {/* Day list */}
              <div className={styles.dayList}>
                {form.days.map((d, i) => (
                  <div
                    key={i}
                    className={`${styles.dayListItem} ${dayIdx === i ? styles.dayListActive : ''}`}
                    onClick={() => setDayIdx(i)}
                  >
                    <div className={styles.dayListNum}>Day {d.day}</div>
                    <div className={`${styles.dayListLoc} truncate`}>{d.location || 'No location'}</div>
                    <button
                      className={styles.dayListRemove}
                      onClick={e => { e.stopPropagation(); removeDay(i); }}
                      title="Remove day"
                    >×</button>
                  </div>
                ))}
                <button className={styles.addDayBtn} onClick={addDay}>+ Add day</button>
              </div>

              {/* Day editor */}
              <div className={styles.dayEditor}>
                <div className={styles.dayMeta}>
                  <div className={styles.field}>
                    <label>Day #</label>
                    <input type="number" min="1" value={curDay.day} onChange={e => setDay(dayIdx, 'day', parseInt(e.target.value))} />
                  </div>
                  <div className={`${styles.field} ${styles.spanTwo}`}>
                    <label>Location</label>
                    <input type="text" value={curDay.location} onChange={e => setDay(dayIdx, 'location', e.target.value)} placeholder="Kyoto, Japan" />
                  </div>
                  <div className={styles.field}>
                    <label>Latitude</label>
                    <input type="number" step="0.0001" value={curDay.lat} onChange={e => setDay(dayIdx, 'lat', e.target.value)} placeholder="35.0116" />
                  </div>
                  <div className={styles.field}>
                    <label>Longitude</label>
                    <input type="number" step="0.0001" value={curDay.lng} onChange={e => setDay(dayIdx, 'lng', e.target.value)} placeholder="135.7681" />
                  </div>
                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label>Day title</label>
                    <input type="text" value={curDay.title} onChange={e => setDay(dayIdx, 'title', e.target.value)} placeholder="e.g. The Philosopher's Path at Dawn" />
                  </div>
                </div>

                {/* AI copilot */}
                <div className={styles.aiBar}>
                  <button className={styles.aiToggle} onClick={() => setAiOpen(o => !o)}>
                    <span className={styles.aiSparkle}>✦</span>
                    AI writing assistant
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden style={{ transform: aiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {aiOpen && (
                  <div className={`${styles.aiPanel} animate-fadeUp`}>
                    <div className={styles.aiSuggestions}>
                      {AI_SUGGESTIONS.map(s => (
                        <button key={s} className={styles.aiSugg} onClick={() => setAiPrompt(s)}>{s}</button>
                      ))}
                    </div>

                    <div className={styles.aiInputRow}>
                      <input
                        type="text"
                        className={styles.aiInput}
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="Ask for writing help, historical context, food suggestions…"
                        onKeyDown={e => e.key === 'Enter' && runAi()}
                      />
                      <button className={styles.aiSendBtn} onClick={runAi} disabled={aiLoading || !aiPrompt.trim()}>
                        {aiLoading
                          ? <span className={styles.aiSpinner} />
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 2 15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </button>
                    </div>

                    {aiResult && (
                      <div className={styles.aiResult}>
                        <div className={styles.aiResultText}>{aiResult}</div>
                        <div className={styles.aiResultActions}>
                          <button className={styles.aiAppend} onClick={appendAi}>Append to entry</button>
                          <button className={styles.aiDiscard} onClick={() => { setAiResult(''); setAiPrompt(''); }}>Discard</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.field}>
                  <div className={styles.entryLabel}>
                    <label>Journal entry</label>
                    <span className={styles.charCount}>{(curDay.content || '').length} chars</span>
                  </div>
                  <textarea
                    className={styles.journalTextarea}
                    rows={18}
                    value={curDay.content}
                    onChange={e => setDay(dayIdx, 'content', e.target.value)}
                    placeholder="Write about your day — what you saw, felt, ate, who you met. Use two line breaks to separate paragraphs…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── PREVIEW TAB ── */}
          {tab === 'preview' && (
            <div className={`${styles.previewPanel} animate-fadeUp`}>
              {form.cover && (
                <div className={styles.previewCover}>
                  <img src={form.cover} alt="Cover" onError={e => { e.target.style.display='none'; }} />
                </div>
              )}
              <h1 className={styles.previewTitle}>{form.title || 'Untitled Journal'}</h1>
              {form.excerpt && <p className={styles.previewLead}>{form.excerpt}</p>}

              <div className={styles.previewMeta}>
                {form.route && <span>{ROUTES.find(r=>r.id===form.route)?.emoji} {ROUTES.find(r=>r.id===form.route)?.name}</span>}
                {form.journeyType && <span>{JOURNEY_TYPES.find(t=>t.id===form.journeyType)?.emoji} {JOURNEY_TYPES.find(t=>t.id===form.journeyType)?.label}</span>}
                {form.duration && <span>{form.duration} days</span>}
              </div>

              {form.days.filter(d => d.content).map((day, i) => (
                <div key={i} className={styles.previewDay}>
                  <span className={styles.previewDayLabel}>Day {day.day}</span>
                  <h2 className={styles.previewDayTitle}>{day.title || 'Untitled'}</h2>
                  {day.location && <p className={styles.previewDayLoc}>📍 {day.location}</p>}
                  {day.content.split('\n\n').map((p, j) => (
                    <p key={j} className={styles.previewBody}>{p}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
