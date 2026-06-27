import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './redux/authSlice';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedPage from './pages/SavedPage';
import AccountPage from './pages/AccountPage';

// Only blocks routes that require a logged-in user
const AuthRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
    else dispatch({ type: 'auth/me/rejected' });
  }, []);

  // Only show the spinner when we have a token and are waiting for user data
  if (token && !initialized) {
    return (
      <div style={{ height: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public: reels feed — no login required to watch */}
      <Route path="/" element={<HomePage />} />

      {/* Auth-required routes */}
      <Route path="/saved" element={<AuthRoute><SavedPage /></AuthRoute>} />
      <Route path="/account" element={<AuthRoute><AccountPage /></AuthRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
