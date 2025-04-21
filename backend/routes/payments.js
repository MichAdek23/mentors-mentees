import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import { auth } from '../middleware/auth.js';
import paystack from '../services/paystack.js';

const router = express.Router();

// Apply coupon code
router.post('/apply-coupon', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;

    console.log('Coupon application request:', { couponCode, user: req.user });

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: couponCode,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      console.log('Invalid or expired coupon code:', couponCode);
      return res.status(400).json({ message: 'Invalid or expired coupon code' });
    }

    // Check if user has already used this coupon
    const existingPayment = await Payment.findOne({
      user: req.user.id,
      couponCode: couponCode,
      status: 'completed'
    });

    if (existingPayment) {
      console.log('Coupon already used by user:', { userId: req.user.id, couponCode });
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    console.log('Coupon applied successfully:', { couponCode, discount: coupon.discount });
    res.json({
      success: true,
      discount: coupon.discount,
      message: `Coupon applied successfully! You get ${coupon.discount}% off`
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Failed to apply coupon' });
  }
});

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;

    console.log('Payment initialization request:', { couponCode, user: req.user });

    // Base price
    const baseAmount = 5000; // Base amount in Naira
    let finalAmount = baseAmount;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (coupon) {
        finalAmount = baseAmount * (1 - coupon.discount / 100);
      }
    }

    // Calculate the final amount
    finalAmount = Math.round(finalAmount);

    console.log('Final amount after discount:', finalAmount);

    // Generate a unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Initializing Paystack transaction:', { email: req.user.email, reference });

    // Initialize transaction with Paystack
    const response = await paystack.initializeTransaction(req.user.email, finalAmount, reference);

    console.log('Paystack response:', response.data);

    // Save payment details to the database
    const payment = new Payment({
      user: req.user.id,
      amount: finalAmount,
      reference: response.data.reference,
      status: 'pending',
      paymentMethod: 'paystack',
      couponCode: couponCode || null,
    });
    await payment.save();

    // Store reference in user document
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    user.paymentReference = reference;
    await user.save();

    console.log('Payment initialized successfully:', { reference });

    res.json({
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      message: 'Failed to initialize payment',
      error: error.message,
    });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { reference } = req.body;

    console.log('Verifying payment:', { reference, user: req.user });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const response = await paystack.verifyTransaction(reference);

    if (response.data.status === 'success') {
      // Update payment record
      payment.status = 'completed';
      payment.paymentDate = new Date();
      await payment.save();

      // Update user payment status
      user.paymentCompleted = true;
      user.paymentReference = null;
      user.paymentDate = new Date();
      user.paymentAmount = payment.amount;
      user.paymentStatus = 'completed';
      await user.save();

      console.log('Payment verified successfully:', { userId: user._id });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        user: {
          id: user._id,
          role: user.role,
          paymentCompleted: user.paymentCompleted,
        },
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      console.log('Payment verification failed:', { reference });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        status: response.data.status,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
});

// @route   GET api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;