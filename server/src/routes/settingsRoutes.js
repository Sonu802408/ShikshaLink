import express from 'express';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { DEFAULT_LOCALITIES, CLASSES, BOARDS, SUBJECTS } from '../config/constants.js';

const router = express.Router();

// Publicly read platform categories, subjects, classes, localities
router.get('/config', async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne({ singletonKey: 'global_settings' });
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    res.json({
      success: true,
      config: {
        platformName: settings.platformName || 'ShikshaLink',
        supportEmail: settings.supportEmail || 'support@shikshalink.in',
        supportPhone: settings.supportPhone || '+91 98765 43210',
        localities: settings.supportedLocalities && settings.supportedLocalities.length > 0 ? settings.supportedLocalities : DEFAULT_LOCALITIES,
        classes: settings.supportedClasses && settings.supportedClasses.length > 0 ? settings.supportedClasses : CLASSES,
        boards: settings.supportedBoards && settings.supportedBoards.length > 0 ? settings.supportedBoards : BOARDS,
        subjects: settings.supportedSubjects && settings.supportedSubjects.length > 0 ? settings.supportedSubjects : SUBJECTS,
        cancellationPolicyText: settings.cancellationPolicyText,
        safetyPolicyText: settings.safetyPolicyText
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
