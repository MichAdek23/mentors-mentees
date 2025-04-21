import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import process from 'process';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['mentor', 'mentee'],
    default: 'mentee'
  },
  profilePicture: {
    type: String,
    default: '/uploads/profiles/default-profile.png'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  title: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  yearOfStudy: {
    type: String,
    default: ''
  },
  expertise: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    default: ''
  },
  social: {
    linkedIn: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    }
  },
  interests: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  overview: {
    type: String,
    default: ''
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  mentorshipStatus: {
    type: String,
    enum: ['available', 'unavailable', 'busy'],
    default: 'available'
  },
  paymentCompleted: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  paymentReference: String,
  paymentDate: {
    type: Date
  },
  paymentAmount: {
    type: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  modeOfContact: {
    type: String,
    enum: ['Virtual', 'Chat', 'Physical'],
    default: 'Virtual'
  },
  availability: {
    type: String,
    enum: ['Available ASAP', 'In a few weeks'],
    default: 'Available ASAP'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Static method to validate token
userSchema.statics.validateToken = async function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await this.findById(decoded.id).select('-password');
    return user || null;
  } catch (error) {
    console.error('Error validating token:', error.message); // Log error message
    return null;
  }
};

const User = mongoose.model('User', userSchema);

export { userSchema };
export default User;