import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract the token from the Authorization header
    console.log('Received Token:', token); // Debug: Log the token

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      console.log('Decoded Token:', decoded); // Debug: Log the decoded token
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }

    const user = await User.findById(decoded.userId).select('-password'); // Fetch the user from the database
    if (!user) {
      console.error('User not found for ID:', decoded.userId); // Debug: Log missing user
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};