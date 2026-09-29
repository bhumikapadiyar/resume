import bcrypt from 'bcryptjs';
import express from 'express';
import User from '../models/User.js';
import { createAccessToken } from '../middleware/auth.js';
import { normalizeEmail, validateCredentials } from '../utils/validation.js';

const router = express.Router();

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const error = validateCredentials({ name, email, password }, true);
    if (error) return res.status(400).json({ error });
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ error: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    res.status(201).json({ user: publicUser(user), token: createAccessToken(user) });
  } catch (error) { next(error); }
});

router.post(['/login', '/signin'], async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const error = validateCredentials({ email, password }, false);
    if (error) return res.status(400).json({ error });
    const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash');
    const valid = user && await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Email or password is incorrect.' });
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ user: publicUser(user), token: createAccessToken(user) });
  } catch (error) { next(error); }
});

export default router;
