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

    // The authenticated user is the initiator
    const initiatorId = req.user.id;

    // Validate that the user is not trying to create a session with themselves
    if (recipientId === initiatorId) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Create a unique Jitsi room ID using timestamp and random number
    const jitsiRoomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const session = new Session({
      // Store the recipientId in the 'mentor' field (schema requirement/convention)
      mentor: recipientId,
      // Store the initiatorId in the 'mentee' field (schema requirement/convention)
      mentee: initiatorId,
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
    const initiatorUser = await User.findById(initiatorId); // Find the initiator user

    // Send session booking email to the recipient (the person being requested)
    if (recipientUser && recipientUser.email) {
      const emailData = {
        recipientName: `${recipientUser.firstName} ${recipientUser.lastName}`,
        creatorName: `${initiatorUser.firstName} ${initiatorUser.lastName}`,
        date,
        time: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Formatted time
        topic,
        description,
        acceptUrl: `${process.env.FRONTEND_URL}/sessions/action/${session._id}/accept`, // Consider using a more secure token/method for actions
        rejectUrl: `${process.env.FRONTEND_URL}/sessions/action/${session._id}/reject` // Consider using a more secure token/method for actions
      };
      try {
         await sendSessionEmail(recipientUser.email, 'session-booking', emailData);
         console.log(`Session booking email sent to recipient: ${recipientUser.email}`);
      } catch (emailErr) {
         console.error(`Failed to send booking email to recipient ${recipientUser.email}:`, emailErr);
         // Decide how to handle email sending failure (log, alert admin, etc.)
      }
    } else {
       console.warn(`Recipient user or email not found for session ${session._id}. Booking email not sent.`);
    }


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
    
    // Note: Email sending logic is primarily handled in the /create route.
    // If you need emails sent for this route as well, you would add it here,
    // similar to the logic in the /create route, sending the booking email
    // to the 'mentor' (recipient) user.

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
        { mentor: req.user.id }, // Current user is potentially the recipient
        { mentee: req.user.id }  // Current user is potentially the initiator
      ]
    })
    // Populate both fields to get user details regardless of role
    .populate('mentor', 'firstName lastName profileImage')
    .populate('mentee', 'firstName lastName profileImage')
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
        { mentor: req.user.id }, // Current user is potentially the recipient
        { mentee: req.user.id }  // Current user is potentially the initiator
      ],
      status: 'pending',
      date: { $gte: new Date() } // Only show pending sessions that haven't passed their date
    })
    // Populate both fields
    .populate('mentor', 'firstName lastName profileImage')
    .populate('mentee', 'firstName lastName profileImage')
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
        { mentor: req.user.id }, // Current user is potentially the recipient
        { mentee: req.user.id }  // Current user is potentially the initiator
      ],
      status: 'accepted',
      date: { $gte: new Date() } // Only show accepted sessions that haven't passed their date
    })
    // Populate both fields
    .populate('mentor', 'firstName lastName profileImage')
    .populate('mentee', 'firstName lastName profileImage')
    .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching accepted sessions:', err);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
});


// @route   GET /api/sessions/history
// @desc    Get completed/cancelled/rejected sessions for the current user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id }, // Current user is potentially the recipient
        { mentee: req.user.id }  // Current user is potentially the initiator
      ],
      status: { $in: ['completed', 'cancelled', 'rejected'] } // Include relevant history statuses
    })
    // Populate both fields
    .populate('mentor', 'firstName lastName profileImage')
    .populate('mentee', 'firstName lastName profileImage')
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
      // Populate both fields
      .populate('mentor', 'firstName lastName profileImage')
      .populate('mentee', 'firstName lastName profileImage');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to view this session (either participant)
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

    // Check if user is authorized to update this session (either participant)
    // Only the participant whose turn it is should be able to update status (e.g., recipient accepts/rejects, either can cancel)
    // For simplicity here, we allow either participant to trigger status change via this route,
    // but real-world might need more granular checks (e.g., only recipient can accept/reject a 'pending' session)
    if (session.mentee.toString() !== req.user.id && session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    // Fetch both users involved for email notifications
    const userInMenteeField = await User.findById(session.mentee);
    const userInMentorField = await User.findById(session.mentor);

    // Before updating status, capture old status if needed for logic
    const oldStatus = session.status;

    session.status = status;
    await session.save();

    // Send appropriate email based on status to BOTH participants

    const commonEmailData = {
        date: session.date,
        time: new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Formatted time
        topic: session.topic,
        description: session.description,
        roomLink: session.jitsiRoomId ? `${process.env.FRONTEND_URL}/jitsi/${session.jitsiRoomId}` : 'Meeting link will be shared closer to the time.', // Include Jitsi link if available
    };


    switch (status) {
        case 'accepted':
            // Email to the user who INITIATED the request (user in mentee field)
            if (userInMenteeField && userInMenteeField.email) {
                const initiatorEmailData = {
                    ...commonEmailData,
                    creatorName: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Initiator's name
                    recipientName: `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Recipient's name
                };
                try {
                    await sendSessionEmail(userInMenteeField.email, 'session-accepted', initiatorEmailData);
                    console.log(`Session accepted email sent to initiator: ${userInMenteeField.email}`);
                } catch (emailErr) {
                    console.error(`Failed to send session accepted email to initiator ${userInMenteeField.email}:`, emailErr);
                }
            }

            // Email to the user who ACCEPTED the request (user in mentor field) - Confirmation
             if (userInMentorField && userInMentorField.email) {
                 const recipientEmailData = {
                    ...commonEmailData,
                    creatorName: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Initiator's name
                    recipientName: `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Recipient's name
                };
                // Could use a different template like 'session-confirmation.html' if available
                try {
                    await sendSessionEmail(userInMentorField.email, 'session-accepted', recipientEmailData); // Using same template for simplicity, adjust template content
                     console.log(`Session accepted confirmation email sent to recipient: ${userInMentorField.email}`);
                } catch (emailErr) {
                     console.error(`Failed to send session accepted confirmation email to recipient ${userInMentorField.email}:`, emailErr);
                }
            }
            break;

        case 'rejected':
             // Email to the user who INITIATED the request (user in mentee field)
            if (userInMenteeField && userInMenteeField.email) {
                const initiatorEmailData = {
                    ...commonEmailData,
                    creatorName: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Initiator's name
                    recipientName: `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Recipient's name
                };
                 try {
                    await sendSessionEmail(userInMenteeField.email, 'session-rejected', initiatorEmailData);
                    console.log(`Session rejected email sent to initiator: ${userInMenteeField.email}`);
                } catch (emailErr) {
                     console.error(`Failed to send session rejected email to initiator ${userInMenteeField.email}:`, emailErr);
                }
            }

            // Email to the user who REJECTED the request (user in mentor field) - Confirmation
            if (userInMentorField && userInMentorField.email) {
                 const recipientEmailData = {
                    ...commonEmailData,
                    creatorName: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Initiator's name
                    recipientName: `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Recipient's name
                };
                 try {
                    // Could use a different template like 'session-rejection-confirmation.html'
                    await sendSessionEmail(userInMentorField.email, 'session-rejected', recipientEmailData); // Using same template
                    console.log(`Session rejected confirmation email sent to recipient: ${userInMentorField.email}`);
                } catch (emailErr) {
                     console.error(`Failed to send session rejected confirmation email to recipient ${userInMentorField.email}:`, emailErr);
                }
            }
            break;

        case 'cancelled':
            // Email to BOTH participants about cancellation
            if (userInMenteeField && userInMenteeField.email) {
                 const emailData = {
                    ...commonEmailData,
                    cancellingUserName: req.user.id === userInMenteeField._id.toString() ? `${userInMenteeField.firstName} ${userInMenteeField.lastName}` : `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Name of the user who cancelled
                    otherUserName: req.user.id === userInMenteeField._id.toString() ? `${userInMentorField.firstName} ${userInMentorField.lastName}` : `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Name of the other user
                    // Add who cancelled field to template?
                 };
                 try {
                    await sendSessionEmail(userInMenteeField.email, 'session-canceled', emailData);
                     console.log(`Session cancelled email sent to user in mentee field: ${userInMenteeField.email}`);
                 } catch (emailErr) {
                    console.error(`Failed to send session cancelled email to user in mentee field ${userInMenteeField.email}:`, emailErr);
                 }
            }
             if (userInMentorField && userInMentorField.email) {
                 const emailData = {
                    ...commonEmailData,
                     cancellingUserName: req.user.id === userInMentorField._id.toString() ? `${userInMentorField.firstName} ${userInMentorField.lastName}` : `${userInMenteeField.firstName} ${userInMenteeField.lastName}`, // Name of the user who cancelled
                    otherUserName: req.user.id === userInMentorField._id.toString() ? `${userInMenteeField.firstName} ${userInMenteeField.lastName}` : `${userInMentorField.firstName} ${userInMentorField.lastName}`, // Name of the other user
                 };
                 try {
                    await sendSessionEmail(userInMentorField.email, 'session-canceled', emailData);
                     console.log(`Session cancelled email sent to user in mentor field: ${userInMentorField.email}`);
                 } catch (emailErr) {
                     console.error(`Failed to send session cancelled email to user in mentor field ${userInMentorField.email}:`, emailErr);
                 }
            }
            break;

        case 'completed':
            // Send completion email to BOTH participants
             if (userInMenteeField && userInMenteeField.email) {
                 const emailData = {
                    ...commonEmailData,
                    participant1Name: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`,
                    participant2Name: `${userInMentorField.firstName} ${userInMentorField.lastName}`,
                    // Add fields for feedback links if applicable
                 };
                 try {
                    await sendSessionEmail(userInMenteeField.email, 'session-completed', emailData);
                     console.log(`Session completed email sent to user in mentee field: ${userInMenteeField.email}`);
                 } catch (emailErr) {
                    console.error(`Failed to send session completed email to user in mentee field ${userInMenteeField.email}:`, emailErr);
                 }
            }
             if (userInMentorField && userInMentorField.email) {
                 const emailData = {
                    ...commonEmailData,
                     participant1Name: `${userInMenteeField.firstName} ${userInMenteeField.lastName}`,
                    participant2Name: `${userInMentorField.firstName} ${userInMentorField.lastName}`,
                 };
                 try {
                    await sendSessionEmail(userInMentorField.email, 'session-completed', emailData);
                     console.log(`Session completed email sent to user in mentor field: ${userInMentorField.email}`);
                 } catch (emailErr) {
                     console.error(`Failed to send session completed email to user in mentor field ${userInMentorField.email}:`, emailErr);
                 }
            }
            break;
    }

    res.json({ data: session });
  } catch (err) {
    console.error('Error updating session status:', err);
    res.status(500).json({ message: 'Server error while updating session status' });
  }
});


// Get all sessions for a user in the mentee field (Consider renaming this route)
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
        { mentor: req.user.id }, // Current user is potentially the recipient
        { mentee: req.user.id }  // Current user is potentially the initiator
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