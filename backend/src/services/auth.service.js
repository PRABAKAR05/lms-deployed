const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async ({ username, email, password }) => {
  const password_hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username.trim(), email.toLowerCase().trim(), password_hash]
  );
  return rows[0];
};

const login = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return { token, user: { id: user.id, username: user.username, email: user.email } };
};

const getMe = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (!rows[0]) { const err = new Error('User not found'); err.status = 404; throw err; }
  return rows[0];
};

const updateProfile = async (userId, { username, currentPassword, newPassword }) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = rows[0];
  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }

  const updates = {};

  if (username && username.trim() !== user.username) {
    updates.username = username.trim();
  }

  if (newPassword) {
    const valid = await bcrypt.compare(currentPassword || '', user.password_hash);
    if (!valid) {
      const err = new Error('Current password is incorrect'); err.status = 400; throw err;
    }
    updates.password_hash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updates).length === 0) {
    return { id: user.id, username: user.username, email: user.email };
  }

  const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`);
  const params = [...Object.values(updates), userId];

  const { rows: updated } = await pool.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING id, username, email`,
    params
  );
  return updated[0];
};

module.exports = { register, login, getMe, updateProfile };
