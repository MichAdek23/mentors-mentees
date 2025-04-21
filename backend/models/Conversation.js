import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Ensure unique conversations between participants (unordered)
conversationSchema.index({ participants: 1 }, { unique: true });

// Add a method to check if a user is a participant in the conversation
conversationSchema.methods.isParticipant = function (userId) {
  return this.participants.some((participant) => participant.toString() === userId.toString());
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;