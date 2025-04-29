const express = require('express');
const app = express();
const messageRouter = require('./api/message');
const userRouter = require('./api/user');
const chatRouter = require('./api/chat');
const fileRouter = require('./api/file');
const authRouter = require('./api/auth');
const auth = require('../middlewares/authApi');
app.use('/message',auth, messageRouter);
app.use('/user',auth, userRouter);
app.use('/chat',auth,chatRouter);
app.use('/file',fileRouter);
app.use('/auth',authRouter);

module.exports = app;