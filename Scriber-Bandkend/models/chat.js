// models/Chat.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Kullanıcının bu sohbette en son hangi mesajı okuduğunu takip etmek için
  lastReadMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, { _id: false });

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    default: 'General',
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  // Artık sadece ObjectId listesi değil, her katılımcı için sub-document
  participants: [participantSchema],

  // Grup resmi veya avatarı için URL
  chatImage: {
    type: String,
    trim: true,
    default:'default/avatar.png'
  },

  // E2EE için sohbet anahtarını saklayabilirsiniz (örn. sunucuda şifreli)
  encryptedKey: {
    type: String,
    select: false, // default olarak çekilmesin
  },

  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // sadece group chat’lerde geçerli
  },
}, {
  timestamps: true,
});

// Sohbetleri güncellenme zamanına göre kolayca sıralamak için index
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
