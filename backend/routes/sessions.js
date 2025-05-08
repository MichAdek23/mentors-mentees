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
    // Rename 'mentor' from req.body to 'recipientId' for clarity
    const { mentor: recipientId, date, duration, topic, type, notes, description } = req.body;

    // Validate that the user is not trying to create a session with themselves
    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Create a unique Jitsi room ID using timestamp and random number
    const jitsiRoomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const session = new Session({
      mentor: recipientId, // Store the recipientId in the 'mentor' field (schema requirement)
      mentee: req.user.id, // The authenticated user is the initiator (mentee)
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

    const recipientUser = await User.findById(recipientId); // Find the recipient user
    const initiatorUser = await User.findById(req.user.id); // Find the initiator user

    // Send session booking email to the recipient
    const emailData = {
      recipientName: `${recipientUser.firstName} ${recipientUser.lastName}`,
      creatorName: `${initiatorUser.firstName} ${initiatorUser.lastName}`,
      date,
      time: new Date(date).toLocaleTimeString(),
      topic,
      description,
      acceptUrl: `${process.env.FRONTEND_URL}/sessions/action/${session._id}/accept`,
      rejectUrl: `${process.env.FRONTEND_URL}/sessions/action/${session._id}/reject`,
    };
    await sendSessionEmail(recipientUser.email, 'session-booking', emailData);

    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error while creating session' });
  }
});

// @route   POST /api/sessions
// @desc    Create a new session (alternative route, correcting variable name here too)
// @access  Private
router.post('/', auth, [
  body('mentor', 'Recipient ID is required').notEmpty(), // Updated validation message
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
    // Rename 'mentor' from req.body to 'recipientId' for clarity
    const { mentor: recipientId, date, duration, topic, type, notes, description } = req.body;
    const initiatorId = req.user.id; // The authenticated user is the initiator

    // Validate that the user is not trying to create a session with themselves
    if (recipientId === initiatorId) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Create a unique Jitsi room ID using timestamp and random number
    const jitsiRoomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const session = new Session({
      mentor: recipientId, // Store the recipientId in the 'mentor' field
      mentee: initiatorId, // Store the initiatorId in the 'mentee' field
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
    
    // Note: Email sending logic was only in the '/create' route. 
    // If you need emails sent for this route as well, you would add it here, 
    // similar to the logic in the '/create' route.

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
        { mentor: req.user.id }, // Current user is the recipient
        { mentee: req.user.id }  // Current user is the initiator
      ]
    })
    .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
    .populate('mentee', 'firstName lastName profileImage') // Populate mentee (initiator)
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
        { mentor: req.user.id }, // Current user is the recipient
        { mentee: req.user.id }  // Current user is the initiator
      ],
      status: 'pending',
      date: { $gte: new Date() }
    })
    .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
    .populate('mentee', 'firstName lastName profileImage') // Populate mentee (initiator)
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
        { mentor: req.user.id }, // Current user is the recipient
        { mentee: req.user.id }  // Current user is the initiator
      ],
      status: 'accepted',
      date: { $gte: new Date() }
    })
    .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
    .populate('mentee', 'firstName lastName profileImage') // Populate mentee (initiator)
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
        { mentor: req.user.id }, // Current user is the recipient
        { mentee: req.user.id }  // Current user is the initiator
      ],
      status: 'completed'
    })
    .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
    .populate('mentee', 'firstName lastName profileImage') // Populate mentee (initiator)
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
      .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
      .populate('mentee', 'firstName lastName profileImage'); // Populate mentee (initiator)

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

    // Check if user is authorized to update this session (either initiator or recipient)
    if (session.mentee.toString() !== req.user.id && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    const recipientUser = await User.findById(session.mentor); // Find the recipient user
    const initiatorUser = await User.findById(session.mentee); // Find the initiator user

    session.status = status;
    await session.save();

    // Send appropriate email based on status
    const emailData = {
      creatorName: `${initiatorUser.firstName} ${initiatorUser.lastName}`,
      recipientName: `${recipientUser.firstName} ${recipientUser.lastName}`,
      date: session.date,
      time: new Date(session.date).toLocaleTimeString(),
      topic: session.topic,
      description: session.description,
      roomLink: `${process.env.FRONTEND_URL}/jitsi/${session.jitsiRoomId}`,
    };

    switch (status) {
      case 'accepted':
        // Send acceptance email to the initiator
        await sendSessionEmail(initiatorUser.email, 'session-accepted', emailData);
        break;
      case 'rejected':
        // Send rejection email to the initiator
        await sendSessionEmail(initiatorUser.email, 'session-rejected', emailData);
        break;
      case 'cancelled':
        // Send cancellation email to the recipient (since only creator can cancel)
        await sendSessionEmail(recipientUser.email, 'session-canceled', emailData);
        break;
      case 'completed':
        // Send completion email to the initiator (mentee)
        await sendSessionEmail(initiatorUser.email, 'session-completed', emailData);
        break;
    }

    res.json(session);
  } catch (err) {
    console.error('Error updating session status:', err);
    res.status(500).json({ message: 'Server error while updating session status' });
  }
});

// Get all sessions for a mentee (This route name is now misleading - consider renaming)
router.get('/mentee', auth, async (req, res) => {
  try {
    // This route currently only fetches sessions where the authenticated user is the mentee (initiator)
    const sessions = await Session.find({ mentee: req.user.id })
      .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
      .sort({ date: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming sessions
router.get('/upcoming', auth, async (req, res) => {
  try {
     // Update this query to include sessions where the user is either mentor or mentee
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id }, // Current user is the recipient
        { mentee: req.user.id }  // Current user is the initiator
      ],
      date: { $gte: new Date() },
      status: 'accepted' // Typically upcoming sessions are 'accepted'
    })
      .populate('mentor', 'firstName lastName profileImage') // Populate mentor (recipient)
      .populate('mentee', 'firstName lastName profileImage') // Populate mentee (initiator)
      .sort({ date: 1 })
      .limit(5);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error); // Added logging
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
      status: 'accepted', // Count accepted upcoming sessions
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching upcoming sessions count:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming sessions count' });
  }
});

// Update session status (using PATCH - this might be redundant if PUT /:id/status is used)
// Consider consolidating status updates to a single route (PUT is more common for full resource update)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to update this session (either initiator or recipient)
    if (session.mentee.toString() !== req.user.id && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = req.body.status;
    await session.save();

    // Note: Email notifications are not sent in this PATCH route. 
    // If you intend to use this route for status updates that trigger emails,
    // you should add the email sending logic here, similar to the PUT route.

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

    // Check if user is authorized to add feedback (either initiator or recipient)
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