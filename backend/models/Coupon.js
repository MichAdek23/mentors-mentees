import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true, // Ensure index for faster lookups
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Discount percentage
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

// Add predefined coupons if they don't exist
(async () => {
  const predefinedCoupons = [
    { code: 'Leap-on25', discount: 90, isActive: true, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Expires in 30 days
    { code: 'leaps-new', discount: 30, isActive: true, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Expires in 30 days
  ];

  for (const couponData of predefinedCoupons) {
    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (!existingCoupon) {
      await Coupon.create(couponData);
      console.log(`Coupon ${couponData.code} created.`);
    } else {
      console.log(`Coupon ${couponData.code} already exists.`);
    }
  }
})();

export default Coupon;
