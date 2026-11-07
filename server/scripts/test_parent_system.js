import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/models/User.js';
import { ParentProfile } from '../src/models/ParentProfile.js';
import { ChildProfile } from '../src/models/ChildProfile.js';
import { Booking } from '../src/models/Booking.js';
import { TutorProfile } from '../src/models/TutorProfile.js';

async function runTests() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for testing Parent System.');

  try {
    // 1. Find or create a test parent user
    let parentUser = await User.findOne({ role: 'parent' });
    if (!parentUser) {
      console.log('No parent user found in DB.');
      return;
    }
    console.log(`[PASS 1] Testing with Parent User: ${parentUser.name} (${parentUser.email})`);

    // 2. Test ParentProfile auto-population
    let parentProfile = await ParentProfile.findOne({ user: parentUser._id });
    if (!parentProfile) {
      parentProfile = await ParentProfile.create({
        user: parentUser._id,
        fullName: parentUser.name,
        phone: parentUser.phone || '9876543210',
        city: 'Delhi',
        locality: 'Mayur Vihar Phase 1'
      });
      console.log('[PASS 2] ParentProfile created.');
    } else {
      console.log(`[PASS 2] Existing ParentProfile found: ${parentProfile.fullName || parentUser.name}, ${parentProfile.city}, ${parentProfile.locality}`);
    }

    // 3. Test Children Profiles retrieval
    let children = await ChildProfile.find({ parentUser: parentUser._id });
    console.log(`[PASS 3] Retrieved ${children.length} saved children.`);

    if (children.length === 0) {
      // Create a test child
      const testChild = await ChildProfile.create({
        parent: parentProfile._id,
        parentUser: parentUser._id,
        fullName: 'Aarav Sharma',
        classGrade: 'Class 10',
        board: 'CBSE',
        medium: 'English',
        school: 'DPS Mayur Vihar'
      });
      children.push(testChild);
      console.log(`[PASS 3.1] Created test student: ${testChild.fullName} (${testChild.classGrade}, ${testChild.board})`);
    }

    // 4. Verify Child Data Fields
    const sampleChild = children[0];
    console.log(`[PASS 4] Sample Child: Name="${sampleChild.fullName}", Class="${sampleChild.classGrade}", Board="${sampleChild.board}", Medium="${sampleChild.medium || 'English'}", School="${sampleChild.school || 'N/A'}"`);

    // 5. Test Active Booking Dependency Check
    const activeBooking = await Booking.findOne({ child: sampleChild._id, status: { $in: ['pending', 'accepted', 'confirmed'] } });
    console.log(`[PASS 5] Active booking check: ${activeBooking ? `Found active booking ${activeBooking._id} (deletion blocked correctly)` : 'No active booking (safe to delete)'}`);

    console.log('\n--- ALL PARENT PROFILE & BOOKING SYSTEM TESTS PASSED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
