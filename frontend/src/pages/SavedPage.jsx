import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../api/axios';
import useIsMobile from '../hooks/useIsMobile';
import BottomNav from '../components/BottomNav';
import { logout } from '../redux/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SavedPage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/videos/saved')
      .then(({ data }) => setVideos(data.videos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const thumb = (v) => {
    const src = v.file_path.startsWith('http') ? v.file_path : `${API_URL}${v.file_path}`;
    return src;
  };

  return (
    <div style={S.page}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-logo">S</div>
          <button className="sidebar-btn" onClick={() => navigate('/')} title="Home">
            <HomeIcon />
          </button>
          <button className="sidebar-btn active" onClick={() => navigate('/saved')} title="Saved">
            <SavedIcon />
          </button>
          <button className="sidebar-btn" onClick={() => navigate('/account')} title="Account">
            <AccountIcon />
          </button>
          <div className="sidebar-spacer" />
          <span style={{ fontSize: 10, color: '#444', marginBottom: 4, textAlign: 'center', padding: '0 4px' }}>
            @{user?.username?.slice(0, 7)}
          </span>
          <button className="sidebar-btn" onClick={handleLogout} title="Logout"><LogoutIcon /></button>
        </aside>
      )}

      <div style={S.content}>
        {/* Header */}
        <div style={S.header}>
          {isMobile && (
            <button style={S.backBtn} onClick={() => navigate('/')}>
              <ChevronIcon />
            </button>
          )}
          <h2 style={S.heading}>Saved Reels</h2>
        </div>

        {loading ? (
          <div style={S.center}>
            <motion.div style={S.spinner}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
          </div>
        ) : videos.length === 0 ? (
          <div style={S.center}>
            <p style={{ color: '#555', fontSize: 15 }}>No saved reels yet.</p>
            <button style={S.browseBtn} onClick={() => navigate('/')}>Browse Reels</button>
          </div>
        ) : (
          <div style={S.grid}>
            {videos.map((v) => (
              <motion.div
                key={v.id}
                style={S.card}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/', { state: { scrollToId: v.id } })}
              >
                <video src={thumb(v)} style={S.cardVideo} muted preload="metadata" />
                <div style={S.cardOverlay}>
                  <span style={S.cardCategory}>{v.category}</span>
                  <p style={S.cardTitle}>{v.title}</p>
                  <div style={S.cardMeta}>
                    <span>❤️ {v.like_count ?? 0}</span>
                    <span>💬 {v.comment_count ?? 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}

// Inline icons for sidebar
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const SavedIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const AccountIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const S = {
  page: { display: 'flex', height: '100vh', background: '#0d0d0d', overflow: 'hidden' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 60 },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '20px 20px 12px', borderBottom: '1px solid #1e1e1e', flexShrink: 0,
  },
  backBtn: { color: '#fff', display: 'flex', padding: 4 },
  heading: { fontSize: 20, fontWeight: 700, color: '#fff' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #222', borderTopColor: 'var(--accent)' },
  browseBtn: {
    padding: '10px 24px', borderRadius: 20, background: 'var(--accent)',
    color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 2, padding: '12px 4px',
  },
  card: {
    position: 'relative', aspectRatio: '9/16', background: '#000',
    overflow: 'hidden', cursor: 'pointer', borderRadius: 4,
  },
  cardVideo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
  },
  cardCategory: {
    fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase',
    letterSpacing: 0.5, display: 'block', marginBottom: 3,
  },
  cardTitle: { fontSize: 12, color: '#fff', fontWeight: 600, lineHeight: 1.3, marginBottom: 4 },
  cardMeta: { display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
};
