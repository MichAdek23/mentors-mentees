import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/mentor/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .select('-createdAt')
      .select('-updatedAt')
      .select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error in profile GET:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mentor/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      role,
      email,
      mentorshipStatus,
      gender,
      modeOfContact,
      availability,
      bio,
      overview,
      profilePicture,
      social
    } = req.body;

    // Build profile object
    const profileFields = {
      firstName,
      lastName,
      role,
      email,
      mentorshipStatus,
      gender,
      modeOfContact,
      availability,
      bio,
      overview,
      profilePicture,
      social: {
        twitter: social?.twitter || '',
        facebook: social?.facebook || '',
        whatsapp: social?.whatsapp || '',
        instagram: social?.instagram || ''
      },
      updatedAt: Date.now()
    };

    // Remove undefined fields
    Object.keys(profileFields).forEach(key => 
      profileFields[key] === undefined && delete profileFields[key]
    );

    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password -createdAt -updatedAt -__v');

    res.json(user);
  } catch (err) {
    console.error('Error in profile PUT:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 