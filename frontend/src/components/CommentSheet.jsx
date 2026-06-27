import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../api/axios';

export default function CommentSheet({ videoId, onClose, onCommentAdded }) {
  const { user } = useSelector((s) => s.auth);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/videos/${videoId}/comments`)
      .then(({ data }) => setComments(data.comments))
      .catch(() => {});
  }, [videoId]);

  // Prevent touch events from bubbling to the scroll-snap feed
  const stopTouch = (e) => e.stopPropagation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/videos/${videoId}/comment`, { content: text.trim() });
      setComments((prev) => [data.comment, ...prev]);
      setText('');
      onCommentAdded?.();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        style={S.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onTouchStart={stopTouch}
        onTouchMove={stopTouch}
        onTouchEnd={stopTouch}
      />

      {/* Sheet — fixed so keyboard push doesn't hide input */}
      <motion.div
        style={S.sheet}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 420, damping: 42 }}
        onTouchStart={stopTouch}
        onTouchMove={stopTouch}
        onTouchEnd={stopTouch}
      >
        <div style={S.handle} />
        <div style={S.header}>
          <h3 style={S.title}>Comments {comments.length > 0 && <span style={S.countBadge}>{comments.length}</span>}</h3>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>

        <div style={S.list}>
          {comments.length === 0 ? (
            <p style={S.empty}>No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={S.comment}>
                <div style={S.avatar}>{c.username?.[0]?.toUpperCase()}</div>
                <div>
                  <span style={S.username}>{c.username}</span>
                  <p style={S.content}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} style={S.form}>
            <input
              ref={inputRef}
              style={S.input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              maxLength={500}
            />
            <button type="submit" style={S.sendBtn} disabled={!text.trim() || loading}>
              {loading ? '…' : '➤'}
            </button>
          </form>
        ) : (
          <div style={S.loginPrompt}>
            <a href="/login" style={S.loginLink}>Sign in to comment</a>
          </div>
        )}
      </motion.div>
    </>,
    document.body
  );
}

const S = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 900,
  },
  sheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 901,
    background: '#1a1a1a', borderRadius: '20px 20px 0 0',
    maxHeight: '75vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, background: '#333',
    margin: '12px auto 0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px 8px',
  },
  title: { fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: {
    fontSize: 12, background: '#2a2a2a', color: '#888', borderRadius: 10,
    padding: '2px 8px', fontWeight: 600,
  },
  closeBtn: { fontSize: 16, color: '#666', padding: 4 },
  list: { flex: 1, overflowY: 'auto', padding: '8px 20px 12px' },
  empty: { color: '#666', fontSize: 14, textAlign: 'center', padding: '32px 0' },
  comment: { display: 'flex', gap: 12, marginBottom: 18 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0, color: '#fff',
  },
  username: { fontSize: 13, fontWeight: 600, color: 'var(--accent)' },
  content: { fontSize: 14, color: '#e0e0e0', marginTop: 3, lineHeight: 1.45 },
  form: {
    display: 'flex', gap: 10, padding: '12px 16px',
    borderTop: '1px solid #2a2a2a',
  },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: 20,
    border: '1px solid #2a2a2a', background: '#0d0d0d',
    color: '#f1f1f1', fontSize: 14,
  },
  sendBtn: {
    padding: '10px 14px', borderRadius: 20, background: 'var(--accent)',
    color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0,
  },
  loginPrompt: {
    padding: '16px 20px', borderTop: '1px solid #2a2a2a', textAlign: 'center',
  },
  loginLink: {
    color: 'var(--accent)', fontSize: 14, fontWeight: 600,
    textDecoration: 'none',
  },
};
