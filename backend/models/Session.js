import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // Duration in minutes
  },
  topic: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['one-on-one', 'group'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  jitsiRoomId: {
    type: String,
    unique: true
  },
  description: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

// Add indexes for common queries
sessionSchema.index({ mentor: 1, status: 1, date: 1 });
sessionSchema.index({ mentee: 1, status: 1, date: 1 });
sessionSchema.index({ date: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session; 