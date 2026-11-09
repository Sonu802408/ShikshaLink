import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const tutors = await TutorProfile.find({}).populate('user', 'name email avatar role');
  console.log('Total TutorProfiles:', tutors.length);
  for (const t of tutors) {
    console.log({
      id: t._id,
      fullName: t.fullName,
      tutorAvatar: t.avatar,
      userAvatar: t.user?.avatar,
      userEmail: t.user?.email,
      applicationId: t.applicationId
    });
  }

  const allUsers = await User.find({});
  console.log('\nUsers with avatar:');
  for (const u of allUsers) {
    if (u.avatar) {
      console.log(`- ${u.name} (${u.email}): ${u.avatar}`);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
