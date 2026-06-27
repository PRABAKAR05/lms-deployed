import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerUser, clearError } from '../redux/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => () => dispatch(clearError()), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerUser(form));
    if (!res.error) navigate('/login', { state: { registered: true } });
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
        <p style={styles.sub}>Create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
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
            placeholder="Password (min 6 chars)"
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
            {loading ? 'Creating account…' : 'Create Account'}
          </motion.button>
        </form>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
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
  },
  error: { color: 'var(--danger)', fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 14 },
};
