import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../redux/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (token) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (!res.error) navigate('/');
  };

  return (
    <div style={styles.page}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 style={styles.logo}>SkillShorts</h1>
        <p style={styles.sub}>Learn anything, one short at a time.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <motion.button
            style={styles.btn}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </form>

        <p style={styles.link}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    height: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
  },
  card: {
    width: '100%', maxWidth: 400, padding: '40px 32px',
    background: 'var(--surface)', borderRadius: 16,
    border: '1px solid var(--border)',
  },
  logo: { fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 },
  sub: { color: 'var(--muted)', marginBottom: 32, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text)', fontSize: 15,
  },
  btn: {
    padding: '13px', borderRadius: 10, background: 'var(--accent)',
    color: '#fff', fontWeight: 600, fontSize: 15, marginTop: 4,
    opacity: 1, transition: 'opacity 0.2s',
  },
  error: { color: 'var(--danger)', fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 14 },
};
