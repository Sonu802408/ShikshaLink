import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const tutors = await TutorProfile.find({}).populate('user');
  console.log(`Processing ${tutors.length} tutors...`);

  for (const t of tutors) {
    const u = t.user;
    if (!u) continue;

    let effectiveAvatar = t.avatar || u.avatar || '';

    // If avatar was empty, generate a branded default avatar URL
    if (!effectiveAvatar || effectiveAvatar.trim() === '') {
      const name = t.fullName || u.name || 'Tutor';
      effectiveAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&size=256&bold=true`;
    }

    t.avatar = effectiveAvatar;
    await t.save();

    u.avatar = effectiveAvatar;
    await u.save();

    console.log(`Synced avatar for ${t.fullName || u.name}: ${effectiveAvatar.substring(0, 50)}...`);
  }

  console.log('All tutors and users updated successfully!');
  await mongoose.disconnect();
}

fix().catch(console.error);
