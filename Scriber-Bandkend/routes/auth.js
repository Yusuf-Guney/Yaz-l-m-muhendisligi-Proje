const router   = require('express').Router();
const message = require('../models/message');
const users = require('../models/user');
const jwt = require('jsonwebtoken');


router.get('/login', async (req, res) => {
    res.render('pages/login', { 
      title: 'Login',
      message: null
    });
  });

// @route   POST

router.post('/register', async (req, res) => {
    const { name, email, password, avatar, about } = req.body;
    try {
      let user = await users.findOne({ email });
      if (user) return res.status(400).json({ message: 'Email already in use' });
  
      user = new users({ name, email, password, avatar, about });
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await users.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token  });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
});



module.exports = router;