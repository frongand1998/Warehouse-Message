const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  recipientId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  messageId: {
    type: String
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
