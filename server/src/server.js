import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { User } from './models/User.js';
import { TutorProfile } from './models/TutorProfile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Body Parser & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

// Public Static Files (Avatars only; private documents are guarded via /api/tutors/qualifications/:id/document)
app.use('/uploads/public', express.static(path.join(__dirname, '../uploads/public')));

// Dynamic fallback for public uploads (e.g. avatars) when file is absent from ephemeral disk
app.get('/uploads/public/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const avatarRef = `/uploads/public/${filename}`;
    const [user, tutor] = await Promise.all([
      User.findOne({ avatar: avatarRef }).select('name avatar'),
      TutorProfile.findOne({ avatar: avatarRef }).select('fullName avatar')
    ]);

    const displayName = user?.name || tutor?.fullName || filename.replace(/^avatar-/, '').replace(/[-_.]/g, ' ') || 'Tutor';
    const initials = displayName
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'TL';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f766e" /><stop offset="100%" stop-color="#0284c7" /></linearGradient></defs><rect width="256" height="256" rx="40" fill="url(#g)" /><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="96" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(svg);
  } catch (err) {
    return res.status(404).send('Avatar not found');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShikshaLink API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isTest = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test'));

if (!isTest) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[ShikshaLink Server] Running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
  });
}
