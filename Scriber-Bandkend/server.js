const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
app.use("/static",express.static(path.join(__dirname,"public")));
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const connectDB = require('./config/db');
app.set('view engine', 'ejs');

const authRouter = require('./routes/auth');
const messageRouter = require('./routes/message');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const fileRouter = require('./routes/file');

app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/file', fileRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});