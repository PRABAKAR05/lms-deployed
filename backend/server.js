require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const videoRoutes = require('./src/routes/video.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

// Security headers (disable CSP for dev, enable in prod if needed)
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin === o || origin.startsWith(o))) return cb(null, true);
    if (process.env.NODE_ENV !== 'production' && origin.endsWith('.trycloudflare.com')) return cb(null, true);
    const err = new Error('Not allowed by CORS');
    err.status = 403;
    return cb(err);
  },
  credentials: true,
}));

// Rate limiting (auth endpoints only)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authLimiter, authRoutes);
app.use('/videos', videoRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
