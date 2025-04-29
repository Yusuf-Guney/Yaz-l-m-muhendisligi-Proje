const router   = require('express').Router();
const auth = require('../../middlewares/authApi');
const chats = require('../../models/chat');
const users = require('../../models/user');
const messages = require('../../models/message');


// @route   GET

router.get('/profile', auth, async (req, res) => {
    
    try{ 
      const user = await users.findById(req.user.id).select('-password -verificationToken');
      res.json(user);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/',auth, async (req, res) => { //
  const { search } = req.query;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};
  const userS = await users.find(query)
    .select('-password -verificationToken')
    .limit(20);
  res.json(userS);
});

// @route   POST 



// @route   PUT 

router.put('/profile',auth, async (req, res) => {
    const { name, avatar, about, password } = req.body;
    try {
      const user = await users.findById(req.user.id).select('+password');
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (about) user.about = about;
      if (password) user.password = password;
      await user.save();
      res.json({ message: 'Profile updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
});
  
  

  module.exports = router;
  