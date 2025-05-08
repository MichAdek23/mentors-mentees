import express from 'express';
import { auth } from '../middleware/auth.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { sendConnectionEmail } from '../services/emailService.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST api/connections/request
// @desc    Send a connection request
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = new Connection({
      requester: req.user.id,
      recipient: recipientId
    });

    await connection.save();

    // Emit socket event for new connection request
    req.app.get('io').to(recipientId).emit('newConnectionRequest', {
      requester: req.user.id,
      requesterName: req.user.name
    });

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/connections/send-request
// @desc    Send connection request email
// @access  Private
router.post('/send-request', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Validate recipientId
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid or missing recipient ID' });
    }

    const sender = req.user; // Use the authenticated user as the sender
    const recipient = await User.findById(recipientId).select('firstName lastName role email interests');
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: sender._id, recipient: recipientId },
        { requester: recipientId, recipient: sender._id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    // Create a new connection
    const connection = new Connection({
      requester: sender._id,
      recipient: recipientId,
    });

    await connection.save();

    // Send connection email
    const emailTemplate = `${sender.role}-to-${recipient.role}`;
    const emailData = {
      senderName: `${sender.firstName} ${sender.lastName}`.trim(),
      senderRole: sender.role,
      senderInterests: sender.interests?.join(', ') || 'N/A',
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      acceptUrl: `${process.env.FRONTEND_URL}/connections/${connection._id}/accept`,
      rejectUrl: `${process.env.FRONTEND_URL}/connections/${connection._id}/reject`,
    };

    try {
      await sendConnectionEmail(recipient.email, emailTemplate, emailData);
    } catch (templateError) {
      console.error('Error loading email template:', templateError);
      return res.status(500).json({ message: 'Failed to load email template' });
    }

    res.status(200).json({ message: 'Connection request sent successfully', connection });
  } catch (error) {
    console.error('Error sending connection request:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to send connection request', error: error.message });
  }
});

// @route   PUT api/connections/:connectionId/accept
// @desc    Accept a connection request
// @access  Private
router.put('/:connectionId/accept', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    connection.status = 'accepted';
    await connection.save();

    res.json({ message: 'Connection accepted successfully', connection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/:connectionId/reject
// @desc    Reject a connection request
// @access  Private
router.put('/:connectionId/reject', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({ message: 'Connection rejected successfully', connection });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections
// @desc    Get all accepted connections for the current user and return connected users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find connections where the current user is either the requester or the recipient AND the status is accepted
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: 'accepted' 
    })
      // Populate both requester and recipient with necessary user fields
      .populate('requester', 'firstName lastName email role profileImage') 
      .populate('recipient', 'firstName lastName email role profileImage'); 

    const connectedUsers = [];
    const connectedUserIds = new Set(); // Use a Set to track unique user IDs to avoid duplicates

    connections.forEach(connection => {
      // Determine which user in the connection is the 'other' user (not the current user)
      const otherUser = connection.requester._id.toString() === req.user.id.toString()
        ? connection.recipient
        : connection.requester;

      // Check if otherUser is valid and hasn't been added yet
      if (otherUser && otherUser._id && !connectedUserIds.has(otherUser._id.toString())) {
        connectedUsers.push(otherUser);
        connectedUserIds.add(otherUser._id.toString());
      }
    });

    // Respond with the array of unique connected user objects
    res.json(connectedUsers);
  } catch (err) {
    console.error('Error fetching connected users:', err.message); 
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/pending
// @desc    Get pending connection requests for the current user (where current user is the recipient)
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    // Find pending connections where the current user is the recipient
    const pendingConnections = await Connection.find({
      recipient: req.user.id,
      status: 'pending',
    })
      // Populate the requester (the user who sent the request)
      .populate('requester', 'firstName lastName email role interests profileImage'); 

    res.json(pendingConnections);
  } catch (err) {
    console.error('Error fetching pending connection requests:', err.message); 
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/status/:userId
// @desc    Get connection status between the authenticated user and another user
// @access  Private
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if a connection exists where the current user and the other user are involved
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
    });

    if (!connection) {
      return res.status(200).json({ status: 'none' }); // No connection exists
    } else if (connection.status === 'accepted') {
      return res.status(200).json({ status: 'connected' }); // Use 'connected' for accepted
    } else {
      return res.status(200).json({ status: connection.status }); // pending, rejected, etc.
    }

  } catch (error) {
    console.error('Error fetching connection status:', error); 
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;