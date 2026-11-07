import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { TutorProfile } from '../src/models/TutorProfile.js';
import dotenv from 'dotenv';
dotenv.config();

async function repairTutorProfiles() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink');
  console.log('Connected to MongoDB. Repairing tutor profiles...');

  const profiles = await TutorProfile.find().populate('user');
  console.log(`Found ${profiles.length} total tutor profiles to inspect.`);

  let updatedCount = 0;
  for (const p of profiles) {
    let changed = false;

    // 1. Ensure fullName
    if (!p.fullName && p.user?.name) {
      p.fullName = p.user.name;
      changed = true;
    }

    // 2. Ensure applicationId
    if (!p.applicationId) {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      p.applicationId = `SL-TUT-${randomSuffix}`;
      changed = true;
    }

    // 3. Ensure applicationStatus
    if (!p.applicationStatus || p.applicationStatus === '') {
      if (p.profileStatus === 'published') {
        p.applicationStatus = 'approved';
      } else if (p.profileStatus === 'pending_review' || (p.subjects && p.subjects.length > 0) || p.registrationStep > 1) {
        // Tutors who filled their details
        p.applicationStatus = 'applied';
        p.profileStatus = 'pending_review';
        p.submittedAt = p.submittedAt || new Date();
      } else {
        p.applicationStatus = 'draft';
      }
      changed = true;
    }

    // 4. Ensure isInCart
    if (p.isInCart === undefined || p.isInCart === null) {
      p.isInCart = true;
      changed = true;
    }

    if (changed) {
      await p.save();
      updatedCount++;
      console.log(`Updated profile ${p._id}: Name=${p.fullName} | AppId=${p.applicationId} | AppStatus=${p.applicationStatus} | ProfileStatus=${p.profileStatus}`);
    }
  }

  console.log(`Repair completed. Successfully updated ${updatedCount} profiles.`);
  process.exit(0);
}

repairTutorProfiles().catch(e => { console.error('Repair error:', e); process.exit(1); });
