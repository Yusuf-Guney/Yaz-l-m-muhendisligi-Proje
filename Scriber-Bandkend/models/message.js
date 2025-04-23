// models/Message.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
  },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Metin mesajı
  content: {
    type: String,
    trim: true,
  },
  // Mesaj tipi (text, image, file, video vs.)
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'video'],
    default: 'text',
  },
  // Ek (resim/dosya) varsa
  attachments: [attachmentSchema],

  // Hangi kullanıcılar bu mesajı okudu?
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

}, {
  timestamps: true,
});

// sohbet bazında sıralama için index
messageSchema.index({ chat: 1, createdAt: 1 });

const message = mongoose.model('Message', messageSchema);
module.exports = message;
