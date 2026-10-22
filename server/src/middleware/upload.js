import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../../uploads/public');
const privateDir = path.join(__dirname, '../../uploads/private');

// Ensure directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

// Public storage for profile avatars
const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Private storage for qualification documents & certificates
const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, privateDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// Avatar file filter: images only
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

// Document filter: PDF and images only
const documentFilter = (req, file, cb) => {
  const allowed = /pdf|jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, and PNG files are accepted for qualification verification.'));
  }
};

export const uploadAvatar = multer({
  storage: publicStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: imageFilter
});

export const uploadDocument = multer({
  storage: privateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: documentFilter
});
