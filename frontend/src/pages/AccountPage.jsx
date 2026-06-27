import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateProfile, logout } from '../redux/authSlice';
import useIsMobile from '../hooks/useIsMobile';
import BottomNav from '../components/BottomNav';

export default function AccountPage() {
  const { user, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [usernameVal, setUsernameVal] = useState(user?.username || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text: string }

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(null);

    const payload = {};
    if (usernameVal.trim() && usernameVal.trim() !== user?.username) {
      payload.username = usernameVal.trim();
    }
    if (newPw) {
      if (newPw !== confirmPw) { setMsg({ type: 'err', text: 'New passwords do not match' }); return; }
      payload.currentPassword = currentPw;
      payload.newPassword = newPw;
    }
    if (Object.keys(payload).length === 0) {
      setMsg({ type: 'err', text: 'Nothing changed' });
      return;
    }

    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) {
      setMsg({ type: 'ok', text: 'Profile updated!' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setMsg({ type: 'err', text: result.payload || 'Update failed' });
    }
  };

  return (
    <div style={S.page}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-logo">S</div>
          <button className="sidebar-btn" onClick={() => navigate('/')} title="Home"><HomeIcon /></button>
          <button className="sidebar-btn" onClick={() => navigate('/saved')} title="Saved"><SavedIcon /></button>
          <button className="sidebar-btn active" onClick={() => navigate('/account')} title="Account"><AccountIcon /></button>
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
            <button style={S.backBtn} onClick={() => navigate('/')}><ChevronIcon /></button>
          )}
          <h2 style={S.heading}>My Account</h2>
        </div>

        <div style={S.formWrap}>
          {/* Profile info banner */}
          <div style={S.infoBanner}>
            <div style={S.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <p style={S.displayName}>@{user?.username}</p>
              <p style={S.displayEmail}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={S.form}>
            <p style={S.sectionTitle}>Change Username</p>
            <input
              style={S.input}
              value={usernameVal}
              onChange={e => setUsernameVal(e.target.value)}
              placeholder="New username"
              maxLength={30}
            />

            <p style={{ ...S.sectionTitle, marginTop: 24 }}>Change Password</p>
            <input
              style={S.input}
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
            />
            <input
              style={S.input}
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
            <input
              style={S.input}
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />

            {msg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: msg.type === 'ok' ? 'var(--success)' : 'var(--danger)', fontSize: 13, marginTop: 4 }}
              >
                {msg.text}
              </motion.p>
            )}

            <button type="submit" style={S.saveBtn} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          <div style={S.danger}>
            <p style={S.sectionTitle}>Session</p>
            <button style={S.logoutBtn} onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}

// Inline icons
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const SavedIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const AccountIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 80 },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '20px 20px 12px', borderBottom: '1px solid #1e1e1e', flexShrink: 0,
  },
  backBtn: { color: '#fff', display: 'flex', padding: 4 },
  heading: { fontSize: 20, fontWeight: 700, color: '#fff' },
  formWrap: { padding: '24px 20px', maxWidth: 480 },
  infoBanner: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
    padding: '16px 20px', background: '#161616', borderRadius: 14,
    border: '1px solid #222',
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  displayName: { fontSize: 16, fontWeight: 700, color: '#fff' },
  displayEmail: { fontSize: 13, color: '#555', marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    padding: '12px 16px', borderRadius: 12, border: '1px solid #222',
    background: '#141414', color: '#f1f1f1', fontSize: 14,
  },
  saveBtn: {
    marginTop: 8, padding: '13px', borderRadius: 12,
    background: 'var(--accent)', color: '#fff', fontWeight: 700,
    fontSize: 15, border: 'none', cursor: 'pointer',
  },
  danger: { marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e1e1e' },
  logoutBtn: {
    padding: '12px 24px', borderRadius: 12,
    background: '#1e1e1e', color: 'var(--danger)', fontWeight: 700,
    fontSize: 14, border: '1px solid #2a2a2a', cursor: 'pointer',
  },
};
