import mongoose from 'mongoose';
import Coupon from './models/Coupon.js';

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    const coupon = await Coupon.findOne({ code: 'Leap-on25' });
    console.log('Coupon found:', coupon);
  } catch (error) {
    console.error('Database test error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

testDB();
