const authService = require('../services/auth.service');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../utils/validators');

const register = async (req, res, next) => {
  try {
    const error = validateRegister(req.body);
    if (error) return res.status(400).json({ error });
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or username already taken' });
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const error = validateLogin(req.body);
    if (error) return res.status(400).json({ error });
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const error = validateProfileUpdate(req.body);
    if (error) return res.status(400).json({ error });
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
