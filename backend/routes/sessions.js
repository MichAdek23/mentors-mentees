import express from 'express';
import { auth } from '../middleware/auth.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { sendSessionEmail } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST api/sessions/create
// @desc    Create a new session
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { mentor, date, duration, topic, type, notes, description } = req.body;

    // Validate that the user is not trying to create a session with themselves
    if (mentor === req.user.id) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Create a unique Jitsi room ID using timestamp and random number
    const jitsiRoomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const session = new Session({
      mentor,
      mentee: req.user.id,
      date,
      duration,
      topic,
      type,
      notes: notes || '',
      description: description || '',
      status: 'pending',
      jitsiRoomId,
    });

    await session.save();

    const mentorUser = await User.findById(mentor);
    const menteeUser = await User.findById(req.user.id);

    // Send session booking email
    const emailData = {
      recipientName: `${mentorUser.firstName} ${mentorUser.lastName}`,
      creatorName: `${menteeUser.firstName} ${menteeUser.lastName}`,
      date,
      time: new Date(date).toLocaleTimeString(),
      topic,
      description,
      acceptUrl: `${process.env.FRONTEND_URL}/sessions/${session._id}/accept`,
      rejectUrl: `${process.env.FRONTEND_URL}/sessions/${session._id}/reject`,
    };
    await sendSessionEmail(mentorUser.email, 'session-booking', emailData);

    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error while creating session' });
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, [
  body('mentor', 'Mentor ID is required').notEmpty(),
  body('date', 'Date is required').notEmpty(),
  body('duration', 'Duration is required').isNumeric(),
  body('topic', 'Topic is required').notEmpty(),
  body('type', 'Type must be one-on-one or group').isIn(['one-on-one', 'group'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { mentor, date, duration, topic, type, notes, description } = req.body;
    const mentee = req.user.id;

    // Validate that the user is not trying to create a session with themselves
    if (mentor === mentee) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Create a unique Jitsi room ID using timestamp and random number
    const jitsiRoomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const session = new Session({
      mentor,
      mentee,
      date,
      duration,
      topic,
      type,
      notes: notes || '',
      description: description || '',
      status: 'pending',
      jitsiRoomId
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Server error while creating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/sessions
// @desc    Get all sessions for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ]
    })
    .populate('mentor', 'name email profileImage')
    .populate('mentee', 'name email profileImage')
    .sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
});

// @route   GET /api/sessions/pending
// @desc    Get pending sessions for the current user
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Debug: Log the authenticated user
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ],
      status: 'pending',
      date: { $gte: new Date() }
    })
    .populate('mentor', 'name email profileImage')
    .populate('mentee', 'name email profileImage')
    .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching pending sessions:', err);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
});

// @route   GET /api/sessions/accepted
// @desc    Get accepted sessions for the current user
// @access  Private
router.get('/accepted', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ],
      status: 'accepted',
      date: { $gte: new Date() }
    })
    .populate('mentor', 'name email profileImage')
    .populate('mentee', 'name email profileImage')
    .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching accepted sessions:', err);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
});

// @route   GET /api/sessions/history
// @desc    Get completed sessions for the current user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ],
      status: 'completed'
    })
    .populate('mentor', 'name email profileImage')
    .populate('mentee', 'name email profileImage')
    .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching session history:', err);
    res.status(500).json({ message: 'Server error while fetching session history' });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name email profileImage')
      .populate('mentee', 'name email profileImage');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to view this session
    if (session.mentor._id.toString() !== req.user.id && 
        session.mentee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this session' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error while fetching session' });
  }
});

// @route   PUT /api/sessions/:id/status
// @desc    Update session status (accept/reject/complete/cancel)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const { status } = req.body;

    // Validate status
    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if user is authorized to update this session
    if (session.mentor.toString() !== req.user.id && session.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    const mentorUser = await User.findById(session.mentor);
    const menteeUser = await User.findById(session.mentee);

    session.status = status;
    await session.save();

    // Send appropriate email based on status
    const emailData = {
      creatorName: `${menteeUser.firstName} ${menteeUser.lastName}`,
      recipientName: `${mentorUser.firstName} ${mentorUser.lastName}`,
      date: session.date,
      time: new Date(session.date).toLocaleTimeString(),
      topic: session.topic,
      description: session.description,
      roomLink: `${process.env.FRONTEND_URL}/jitsi/${session.jitsiRoomId}`,
    };

    switch (status) {
      case 'accepted':
        await sendSessionEmail(menteeUser.email, 'session-accepted', emailData);
        break;
      case 'rejected':
        await sendSessionEmail(menteeUser.email, 'session-rejected', emailData);
        break;
      case 'cancelled':
        await sendSessionEmail(mentorUser.email, 'session-canceled', emailData);
        break;
      case 'completed':
        await sendSessionEmail(menteeUser.email, 'session-completed', emailData);
        break;
    }

    res.json(session);
  } catch (err) {
    console.error('Error updating session status:', err);
    res.status(500).json({ message: 'Server error while updating session status' });
  }
});

// Get all sessions for a mentee
router.get('/mentee', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ mentee: req.user.id })
      .populate('mentor', 'name email profileImage')
      .sort({ date: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming sessions
router.get('/upcoming', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      mentee: req.user.id,
      date: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('mentor', 'name email profileImage')
      .sort({ date: 1 })
      .limit(5);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sessions/upcoming/count
// @desc    Get the count of upcoming sessions for the current user
// @access  Private
router.get('/upcoming/count', auth, async (req, res) => {
  try {
    const count = await Session.countDocuments({
      $or: [{ mentor: req.user.id }, { mentee: req.user.id }],
      date: { $gte: new Date() },
      status: 'scheduled',
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching upcoming sessions count:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming sessions count' });
  }
});

// Update session status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to update this session
    if (session.mentee.toString() !== req.user.id && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = req.body.status;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback to session
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to add feedback
    if (session.mentee.toString() !== req.user.id && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.feedback.push({
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;