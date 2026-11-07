import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../server/.env') });

import { connectDB } from '../config/db.js';
import { PlatformSettings } from '../models/PlatformSettings.js';

async function update() {
  await connectDB();
  let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
  if (!settings) {
    settings = new PlatformSettings({ singletonKey: 'global_settings' });
  }

  settings.paymentSettings = {
    ...settings.paymentSettings,
    businessDisplayName: 'ShikshaLink Education',
    upiId: '8130550381@pthdfc',
    upiPayeeName: 'ShikshaLink Education (Sonu Kumar)',
    upiQrCodeUrl: '/uploads/public/payments/paytm-qr.png',
    isOnlinePaymentEnabled: true,
    isCashPaymentEnabled: false,
    paymentInstructions: 'Pay securely using any UPI App (Paytm, Google Pay, PhonePe, BHIM) or scan the QR code below.'
  };

  await settings.save();
  console.log('SUCCESS: PlatformSettings updated with Paytm UPI details:', settings.paymentSettings);
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
