const validateRegister = ({ username, email, password }) => {
  if (!username || username.trim().length < 3 || username.trim().length > 30)
    return 'Username must be 3–30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
    return 'Username may only contain letters, numbers, and underscores';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Valid email is required';
  if (!password || password.length < 6 || password.length > 128)
    return 'Password must be 6–128 characters';
  return null;
};

const validateLogin = ({ email, password }) => {
  if (!email || !password) return 'Email and password are required';
  return null;
};

const validateComment = ({ content }) => {
  if (!content || content.trim().length === 0) return 'Comment cannot be empty';
  if (content.trim().length > 500) return 'Comment must be under 500 characters';
  return null;
};

const validateProfileUpdate = ({ username, currentPassword, newPassword }) => {
  if (username !== undefined) {
    if (username.trim().length < 3 || username.trim().length > 30)
      return 'Username must be 3–30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
      return 'Username may only contain letters, numbers, and underscores';
  }
  if (newPassword !== undefined) {
    if (!currentPassword) return 'Current password is required to set a new password';
    if (newPassword.length < 6 || newPassword.length > 128)
      return 'New password must be 6–128 characters';
  }
  return null;
};

module.exports = { validateRegister, validateLogin, validateComment, validateProfileUpdate };
