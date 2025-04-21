import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  goals: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active'
    }
  }],
  recentActivity: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['session', 'resource', 'achievement', 'goal'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress; 