import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import crypto from 'crypto';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendVerificationEmail, sendLoginNotificationEmail, sendProfileCompletionEmail, sendPasswordResetNotification, sendPasswordChangeNotification, sendConnectionEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'profiles'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 12 * 1024 * 1024 // 12MB limit
  },
  fileFilter: fileFilter
});

// @route   POST api/users/register
// @desc    Register a user (Step 1: Basic Info)
// @access  Public
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body; // Email is extracted from the request body
  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Save verification token to user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Construct the verification URL using the frontend URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// @route   PUT api/users/complete-profile
// @desc    Complete user profile (Step 2: Role-specific details)
// @access  Private
router.put('/complete-profile', auth, [
  body('department').if(body('role').equals('student')).notEmpty(),
  body('yearOfStudy').if(body('role').equals('student')).notEmpty(),
  body('expertise').if(body('role').equals('mentor')).isArray(),
  body('experience').if(body('role').equals('mentor')).notEmpty(),
  body('bio').optional(),
  body('overview').optional(),
  body('profilePicture').optional(),
  body('gender').optional(),
  body('social').optional(),
  body('interests').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields based on role
    if (user.role === 'student') {
      user.department = req.body.department;
      user.yearOfStudy = req.body.yearOfStudy;
    } else if (user.role === 'mentor') {
      user.expertise = req.body.expertise;
      user.experience = req.body.experience;
    }

    // Update common profile fields
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.gender = req.body.gender || user.gender;
    user.bio = req.body.bio || user.bio;
    user.overview = req.body.overview || user.overview;
    user.interests = req.body.interests || user.interests;

    // Update social media links
    if (req.body.social) {
      user.social = {
        linkedIn: req.body.social.linkedIn || user.social?.linkedIn || '',
        twitter: req.body.social.twitter || user.social?.twitter || '',
        instagram: req.body.social.instagram || user.social?.instagram || '',
        website: req.body.social.website || user.social?.website || ''
      };
    }

    user.profileCompleted = true;
    await user.save();

    if (!user.profileCompleted) {
      await sendProfileCompletionEmail(user.email, user.firstName); // Send profile completion email
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user.id,
      role: user.role,
      profileCompleted: user.profileCompleted,
      paymentCompleted: user.paymentCompleted,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT generation error:', err.message);
          return res.status(500).json({ message: 'Error generating token' });
        }

        console.log('Generated Token:', token); // Debug: Log the generated token
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            profileCompleted: user.profileCompleted,
            paymentCompleted: user.paymentCompleted,
          },
        });
      }
    );
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST api/users/verify-email
// @desc    Verify email using the token
// @access  Public
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email is already verified', user });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully', user });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// @route   POST api/users/resend-verification
// @desc    Resend email verification link
// @access  Public
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate a new verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(email, verificationUrl);

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
});

// @route   GET api/users/profile
// @desc    Get the current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Debug: Log the authenticated user
    const user = await User.findById(req.user._id).select('-password'); // Use req.user._id
    if (!user) {
      console.error('User not found for ID:', req.user._id); // Debug: Log missing user
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Define updatable fields based on EditProfile
    const updatableFields = [
      'firstName', 'lastName', 'email', 'title', 
      'department', 'overview', 'expertise', 'experience',
      'interests', 'gender', 'modeOfContact', 'availability',
      'profilePicture', 'bio', 'social'
    ];
    // Update all provided fields
    updatableFields.forEach(field => {
      if (field === 'social' && req.body[field]) {
        user.social = {
          ...user.social,
          linkedIn: req.body.social.linkedIn || user.social?.linkedIn || '',
          twitter: req.body.social.twitter || user.social?.twitter || '',
          instagram: req.body.social.instagram || user.social?.instagram || '',
          website: req.body.social.website || user.social?.website || '',
          facebook: req.body.social.facebook || user.social?.facebook || '',
          whatsapp: req.body.social.whatsapp || user.social?.whatsapp || ''
        };
      } else if (field === 'expertise' && req.body[field]) {
        // Handle expertise array
        user.expertise = Array.isArray(req.body.expertise) 
          ? req.body.expertise 
          : req.body.expertise.split(',').map(item => item.trim());
      } else if (field === 'interests' && req.body[field]) {
        // Handle interests array
        user.interests = Array.isArray(req.body.interests)
          ? req.body.interests
          : req.body.interests.split(',').map(item => item.trim());
      } else if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    // Update the timestamp
    user.updatedAt = Date.now();
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload' });
    }

    // Get the URL for the uploaded file
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user's profile picture URL in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profilePicture = imageUrl;
    await user.save();

    res.json({ profilePicture: imageUrl });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size cannot exceed 12MB' });
    }
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// @route   PUT api/users/update-profile-picture-and-gender
// @desc    Update user's profile picture and gender
// @access  Private
router.put('/update-profile-picture-and-gender', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { gender } = req.body;
    // Validate gender
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender selected' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update gender
    if (gender) user.gender = gender;
    // Update profile picture if a file is uploaded
    if (req.file) {
      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      user.profilePicture = imageUrl;
    }
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/update-step-2
// @desc    Update user profile step 2 data
// @access  Private
router.put('/update-step-2', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const {
      title,
      expertise,
      experience,
      department,
      social,
      role
    } = req.body;
    // Update based on role
    if (role === 'mentor') {
      user.title = title || user.title;
      user.expertise = expertise || user.expertise;
      user.experience = experience || user.experience;
    } else {
      user.title = title || user.title;
      user.department = department || user.department;
    }
    // Update social links
    if (social) {
      user.social = {
        ...user.social,
        linkedIn: social.linkedIn || user.social?.linkedIn || '',
        twitter: social.twitter || user.social?.twitter || '',
        instagram: social.instagram || user.social?.instagram || ''
      };
    }
    // Update completion status
    user.partialProfileStep = 2;
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile step 2:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/update-step-3
// @desc    Update user profile step 3 data
// @access  Private
router.put('/update-step-3', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { interests, role } = req.body;
    // Validate interests array
    if (!Array.isArray(interests) || interests.length !== 3) {
      return res.status(400).json({ 
        message: 'Please provide exactly 3 areas of interest' 
      });
    }
    // Update user fields
    user.interests = interests;
    user.partialProfileStep = 3;
    await user.save();
    res.json({
      message: 'Profile step 3 updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile step 3:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/update-step-4
// @desc    Update user profile step 4 data
// @access  Private
router.put('/update-step-4', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { bio, overview } = req.body;
    // Update user fields
    user.bio = bio || user.bio;
    user.overview = overview || user.overview;
    user.profileCompleted = true; // Mark profile as completed
    user.partialProfileStep = 4;
    await user.save();
    res.json({
      message: 'Profile completed successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile step 4:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Updated the /forgot-password route to generate OTP and reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    console.log('Generated OTP:', { email, otp }); // Debug log
    await user.save();

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      // Send OTP and reset URL to the user
      await sendPasswordResetNotification(user.email, resetUrl, user.firstName, otp);
    } catch (emailError) {
      console.error('Error sending email:', emailError); // Log email sending error
      return res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
    }

    res.json({
      success: true,
      message: 'Password reset email and OTP sent successfully',
      redirect: '/get-otp', // Use lowercase path
      email, // Include email in the response for frontend to store in localStorage
      token: resetToken, // Include reset token in the response
    });
  } catch (error) {
    console.error('Error in forgot-password:', error); // Debug log
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new route to verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate email and OTP
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid, clear it from the database
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      redirect: '/change-password', // Redirect user to change password page
      token: user.resetPasswordToken, // Include reset token in the response
    });
  } catch (error) {
    console.error('Error in verify-otp:', error); // Debug log
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in reset-password:', error); // Debug log
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/users/mentors
// @desc    Get all mentors
// @access  Private
router.get('/mentors', auth, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(mentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/mentees
// @desc    Get all mentees
// @access  Private
router.get('/mentees', auth, async (req, res) => {
  try {
    const mentees = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(mentees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total sessions
    const totalSessions = await Session.countDocuments({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ]
    });
    // Get total hours (assuming each session is 1 hour)
    const totalHours = totalSessions;
    // Get total messages
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ],
    });
    // Get upcoming sessions
    const upcomingSessions = await Session.countDocuments({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ],
      status: 'scheduled',
      date: { $gte: new Date() }
    });
    res.json({
      totalSessions,
      totalHours,
      totalMessages,
      upcomingSessions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user with the token
    const user = await User.findOne({
      _id: decoded.userId,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user's verification status
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate a new auth token for the user
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Email verified successfully', token: authToken });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// @route   PUT api/users/update-role
// @desc    Update the user's role
// @access  Private
router.put('/update-role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    // Validate role
    if (!['mentor', 'mentee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }
    // Update the user's role
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/payment-status
// @desc    Get user's payment status
// @access  Private
router.get('/payment-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentCompleted');
    res.json({ 
      success: true,
      paymentCompleted: user.paymentCompleted
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { excludeUserId } = req.query;

    // Debug: Log the excludeUserId to verify the query parameter
    console.log('Exclude User ID:', excludeUserId);

    // Build the query to exclude the logged-in user if `excludeUserId` is provided
    const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

    // Debug: Log the query to verify it is constructed correctly
    console.log('Query:', query);

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Debug: Log the fetched users to verify the response
    console.log('Fetched Users:', users);

    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Define updatable fields
    const updatableFields = [
      'firstName', 'lastName', 'email', 'title', 
      'department', 'overview', 'expertise', 'experience',
      'interests', 'gender', 'modeOfContact', 'availability',
      'profilePicture', 'bio', 'social'
    ];
    // Update fields
    updatableFields.forEach(field => {
      if (field === 'social' && req.body[field]) {
        user.social = {
          ...user.social,
          linkedIn: req.body.social.linkedIn || user.social?.linkedIn || '',
          twitter: req.body.social.twitter || user.social?.twitter || '',
          instagram: req.body.social.instagram || user.social?.instagram || '',
          website: req.body.social.website || user.social?.website || ''
        };
      } else if (field === 'expertise' && req.body[field]) {
        user.expertise = Array.isArray(req.body.expertise)
          ? req.body.expertise
          : req.body.expertise.split(',').map(item => item.trim());
      } else if (field === 'interests' && req.body[field]) {
        user.interests = Array.isArray(req.body.interests)
          ? req.body.interests
          : req.body.interests.split(',').map(item => item.trim());
      } else if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notify user after password reset request
router.post('/send-reset-notification', async (req, res) => {
  const { email } = req.body;
  try {
    await sendPasswordResetNotification(email);
    res.status(200).json({ message: 'Reset notification sent successfully' });
  } catch (error) {
    console.error('Error sending reset notification:', error);
    res.status(500).json({ message: 'Failed to send reset notification' });
  }
});

// Notify user after successful password change
router.post('/send-change-notification', async (req, res) => {
  const { email } = req.body;
  try {
    await sendPasswordChangeNotification(email);
    res.status(200).json({ message: 'Change notification sent successfully' });
  } catch (error) {
    console.error('Error sending change notification:', error);
    res.status(500).json({ message: 'Failed to send change notification' });
  }
});

// @route   PUT api/users/password
// @desc    Update user's password during signup
// @access  Private
router.put('/password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Debug log to confirm received data
    console.log('Received data:', { token, newPassword });

    // Validate newPassword
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Trim the password to remove extra spaces
    const trimmedPassword = newPassword.trim();

    // Validate trimmed password length
    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed token:', resetPasswordToken);

    // Find the user by reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.error('User not found or token expired');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Replace the previous password with the new one
    user.password = trimmedPassword;
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpire = undefined; // Clear token expiration
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/:id
// @desc    Get user details by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;