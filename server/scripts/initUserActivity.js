import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';
import { Booking } from '../src/models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink';
    await mongoose.connect(mongoURI);
    console.log('[Init] Connected to MongoDB');

    const users = await User.find({});
    console.log(`[Init] Found ${users.length} total users.`);

    const now = new Date();

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      let needsUpdate = false;

      if (!u.loginCount || u.loginCount === 0) {
        u.loginCount = Math.floor(Math.random() * 5) + 1;
        needsUpdate = true;
      }

      if (!u.lastLogin) {
        const pastLogin = new Date(now.getTime() - (i * 45 + 10) * 60 * 1000);
        u.lastLogin = pastLogin;
        needsUpdate = true;
      }

      // Mark first parent and first tutor as currently live online
      if (i === 0 || i === 1 || u.role === 'admin' || (u.role === 'parent' && i < 3) || (u.role === 'tutor' && i < 4)) {
        u.lastActive = new Date(now.getTime() - Math.floor(Math.random() * 4) * 60 * 1000);
        u.isOnline = true;
        needsUpdate = true;
      } else {
        u.lastActive = u.lastLogin;
        u.isOnline = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await u.save({ validateModifiedOnly: true });
        console.log(`Updated user ${u.name} (${u.role}): loginCount=${u.loginCount}, isOnline=${u.isOnline}`);
      }
    }

    const bookingCount = await Booking.countDocuments();
    console.log(`[Init] Total bookings in database: ${bookingCount}`);

    console.log('[Init] User activity initialized successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Init Error]:', err);
    process.exit(1);
  }
};

run();
