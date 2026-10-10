import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { sequelize } from './models/index.js';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177'
];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):517[3-9]$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Collaborative Task Manager API' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Email already exists.' });
  if (err.name?.startsWith('SequelizeValidation')) return res.status(400).json({ message: 'Invalid data supplied.' });
  res.status(500).json({ message: 'Server error. Check backend logs.' });
});

const port = Number(process.env.PORT || 5000);
try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in server/.env');
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(port, () => console.log(`API ready at http://localhost:${port}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
