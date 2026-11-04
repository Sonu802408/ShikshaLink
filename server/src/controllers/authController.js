import { User } from '../models/User.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { TutorProfile } from '../models/TutorProfile.js';
import { ROLES } from '../config/constants.js';

// Register Parent or Tutor
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, locality, city } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone number, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Never trust admin role from public registration
    const userRole = role === ROLES.TUTOR ? ROLES.TUTOR : ROLES.PARENT;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      passwordHash: password,
      role: userRole,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    let profile = null;
    if (userRole === ROLES.PARENT) {
      profile = await ParentProfile.create({
        user: user._id,
        city: city || 'Delhi',
        locality: locality || 'Mayur Vihar Phase 1'
      });
    } else {
      profile = await TutorProfile.create({
        user: user._id,
        fullName: name,
        city: city || 'Delhi',
        primaryLocality: locality || 'Mayur Vihar Phase 1',
        headline: `${name} - Academic Tutor`,
        profileStatus: 'draft',
        isPublished: true,
        registrationStep: 1
      });
    }

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.suspendedReason || 'Contact support'}`
      });
    }

    let profile = null;
    if (user.role === ROLES.PARENT) {
      profile = await ParentProfile.findOne({ user: user._id });
    } else if (user.role === ROLES.TUTOR) {
      profile = await TutorProfile.findOne({ user: user._id });
    }

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === ROLES.PARENT) {
      profile = await ParentProfile.findOne({ user: user._id });
    } else if (user.role === ROLES.TUTOR) {
      profile = await TutorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

// Update personal profile
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    if (req.file) {
      user.avatar = `/uploads/public/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// Bootstrap Initial Admin securely
export const bootstrapAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, bootstrapKey } = req.body;

    const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY;
    if (!expectedKey || bootstrapKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid bootstrap key. Administrator setup rejected.'
      });
    }

    let admin = await User.findOne({ email: email.toLowerCase().trim() });
    if (admin) {
      admin.role = ROLES.ADMIN;
      admin.passwordHash = password;
      await admin.save();
    } else {
      admin = await User.create({
        name: name || 'System Administrator',
        email: email.toLowerCase().trim(),
        phone: phone || '+91 9876543210',
        passwordHash: password,
        role: ROLES.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true
      });
    }

    const token = admin.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Administrator account configured successfully.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Reset Password via Registered Email or Phone
export const resetPassword = async (req, res, next) => {
  try {
    const { email, phone, newPassword } = req.body;

    if ((!email && !phone) || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email or phone number, along with the new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const queryConditions = [];
    if (email && email.trim()) {
      queryConditions.push({ email: email.toLowerCase().trim() });
    }
    if (phone && phone.trim()) {
      // Clean up phone search to match digits
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      queryConditions.push({ phone: phone.trim() });
      if (cleanPhone.length >= 10) {
        queryConditions.push({ phone: { $regex: cleanPhone.slice(-10) } });
      }
    }

    const user = await User.findOne({ $or: queryConditions }).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this registered email or phone number.'
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.name} (${user.email}). You can now log in with your new password.`
    });
  } catch (err) {
    next(err);
  }
};
