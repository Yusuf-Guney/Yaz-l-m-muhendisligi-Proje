const router   = require('express').Router();
const auth = require('../../middlewares/authApi');
const chats = require('../../models/chat');
const users = require('../../models/user');
const messages = require('../../models/message');


// @route   GET

router.get('/users/p2p', async (req, res) => {
  try{
  
    let userS = await users.find({
      _id: { $ne: req.user.id }
    }).select('name avatar');
    const chatS = await chats.find({ participants: { $elemMatch: { user: req.user.id }},isGroupChat:false}).select('participants');
    chatS.map(chat => chat.participants.map((user) => {
      if(user.user.toString()!== req.user.id){
        userS = userS.filter((userS) => userS._id.toString() !== user.user.toString());
      }
    })).flat();
    res.json(userS);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/users/group', async (req, res) => { //burada users'a kendisini ekliyoruz zaten tokendan ekliyor grubu kuranı
  try {
    const userS = await users.find({
      _id: { $ne: req.user.id }
    }).select('name avatar');
    return res.json(userS);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }

});
router.get('/profile', async (req, res) => {
    
    try{ 
      const user = await users.findById(req.user.id).select('-password -verificationToken');
      res.json(user);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/', async (req, res) => { //
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

router.put('/profile', async (req, res) => {
    const { name, about, password } = req.body;
    try {
     
      const user = await users.findById(req.user.id).select('+password');
      if (name) user.name = name;
      if (about) user.about = about;
      if (password) user.password = password;
      await user.save();
      res.json({ message: 'Profile updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
});
  
// @route   DELETE






  module.exports = router;
  