const router   = require('express').Router();
const auth = require('../../middlewares/authApi');
const chats = require('../../models/chat');
const users = require('../../models/user');
const messages = require('../../models/message');

const upload = require('../../helpers/multer');
const crypto = require('crypto');
// @route   GET 





router.get('/:chatId', auth, async (req, res) => {
  try {
    const messageS = await messages.find({ chat: req.params.chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json(messageS);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// @route   POST

router.post('/', auth, upload.single('files') , async (req, res) => {//bu router postman'den çağrılamıyor çünkü form-data'da files girince.değişkenleri body kısmına ekleyemiyoruz
    const { userId, content, messageType } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId gereklidir.' });
    }
    try {
      if(messageType !== 'text'){
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: 'Dosya yüklenemedi' });
        }
        const fileName = await uploadToS3('users',`${req.user.id}/uploads/`+(messageType === 'image' ? 'images':(messageType === 'video'?'videos':'files')),file);

        if (!fileName) {
          return res.status(400).json({ message: 'Dosya yüklenemedi' });
        }
        attachments = [{url:fileName,mimeType:file.mimetype}];
      }
      let hasChat = await chats.findOne({
        isGroupChat: false,
        $and: [
          { participants: { $elemMatch: { user: req.user.id } } },
          { participants: { $elemMatch: { user: userId } } }
        ]
      });
      if (!hasChat) {
        hasChat = await chats.create({
          participants: [{ user: req.user.id }, { user: userId }]
        });
      };
      const newMessage = await messages.create({
        chat: hasChat._id,
        sender: req.user.id,
        content: content || '',
        messageType: messageType || 'text',
        attachments: attachments || [],
        readBy: [req.user.id]
      });
  
      // latestMessage güncelle
      await hasChat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id, updatedAt: Date.now() });
  
      const fullMessage = await messages.findById(newMessage._id)
        .populate('sender', 'name email avatar')
        .populate('chat');
  
      res.status(201).json(fullMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT 

router.put('/read', auth, async (req, res) => {
    const { messageId } = req.body;
    if (!messageId) {
      return res.status(400).json({ message: 'messageId gerekli' });
    }
    try {
      const message = await messages.findById(messageId);
      if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı' });
  
      if (!message.readBy.includes(req.user.id)) {
        message.readBy.push(req.user.id);
        await message.save();
      }
  
      res.json({ message: 'Mesaj okundu olarak işaretlendi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
});
  
  

module.exports = router;