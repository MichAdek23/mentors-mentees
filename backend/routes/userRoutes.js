import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// ...existing routes...

// Validate token endpoint
router.post('/validate-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const user = await User.validateToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error validating token:', error.message); // Log error message
    res.status(500).json({ message: 'Server error during token validation.' });
  }
});

// ...existing routes...

export default router;
