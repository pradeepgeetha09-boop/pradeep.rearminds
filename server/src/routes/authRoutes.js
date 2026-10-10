import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const publicUser = user => ({ id: user.id, name: user.name, email: user.email, role: user.role });

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (!['MANAGER', 'USER'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.unscoped().findOne({ where: { email: normalizedEmail } })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.unscoped().findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
