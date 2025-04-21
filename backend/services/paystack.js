import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
    throw new Error('Paystack API keys are not configured. Please check your environment variables.');
}

if (!FRONTEND_URL) {
    throw new Error('Frontend URL is not configured. Please check your environment variables.');
}

const paystack = {
  initializeTransaction: async (email, amount, reference) => {
    try {
      console.log('Initializing transaction with Paystack:', { email, amount, reference });

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Paystack transaction initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing transaction with Paystack:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize transaction with Paystack');
    }
  },

  verifyTransaction: async (reference) => {
    try {
      console.log('Verifying transaction with Paystack:', { reference });

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      console.log('Paystack transaction verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction with Paystack:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify transaction with Paystack');
    }
  },
};

export default paystack;