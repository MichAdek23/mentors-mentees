import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  sendVerificationEmailController,
  verifyEmailController,
  checkVerificationStatusController
} from '../controllers/emailVerificationController.js';

const router = express.Router();

// Send verification email
router.post('/send-verification-email', sendVerificationEmailController);

// Verify email with token
router.post('/verify-email', verifyEmailController);

// Check verification status (requires authentication)
router.get('/check-verification', auth, checkVerificationStatusController);

export default router; 