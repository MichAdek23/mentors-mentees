import express from 'express';
import Conversation from '../models/Conversation.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for a user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ]
    })
      .populate('mentor', 'name email profileImage')
      .populate('mentee', 'name email profileImage')
      .sort({ lastMessage: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('mentor', 'name email profileImage')
      .populate('mentee', 'name email profileImage')
      .populate('messages.sender', 'name email profileImage');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.mentor.toString() !== req.user.id && conversation.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new conversation
router.post('/', auth, async (req, res) => {
  try {
    const existingConversation = await Conversation.findOne({
      $or: [
        { mentor: req.user.id, mentee: req.body.otherUserId },
        { mentor: req.body.otherUserId, mentee: req.user.id }
      ]
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    const conversation = new Conversation({
      mentor: req.user.role === 'mentor' ? req.user.id : req.body.otherUserId,
      mentee: req.user.role === 'mentee' ? req.user.id : req.body.otherUserId,
      messages: []
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.mentor.toString() !== req.user.id && conversation.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    conversation.messages.push({
      sender: req.user.id,
      content: req.body.content,
      attachments: req.body.attachments || []
    });

    conversation.lastMessage = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.mentor.toString() !== req.user.id && conversation.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark all messages as read for the current user
    conversation.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.read) {
        message.read = true;
      }
    });

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive conversation
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.mentor.toString() !== req.user.id && conversation.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    conversation.status = 'archived';
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 