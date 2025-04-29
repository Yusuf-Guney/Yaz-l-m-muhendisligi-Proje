const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const axios = require("axios");
require("dotenv").config();
const formData = require("form-data");
const cookieParser = require('cookie-parser');
const message = require("../Scriber-Backend/models/message");
const io = socketIo(server,{
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 1e8 // 100 MB max file size
});

app.use(cookieParser());

io.on('connection',async  (socket) => {

  function getTokensFromCookie(req) {
    const raw = req.headers.cookie || "";
    const token = raw
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("token="))
      ?.slice(6);
    return token;
  }

    socket.on("join-room", ({roomId}) => {
      socket.join(socket.userId);  
      console.log(`Socket1 ${socket.id} joined room ${roomId}`);
      console.log("odaya girdi")
   
  
    socket.on("send-message-p2p",async ({userId,content,file}) => {
      
        try{
          console.log("mesaj gönderildi")
          const token = getTokensFromCookie(socket.request);
            const sendMessage = await axios.post("http://127.0.0.1:3000/message/p2p",{userId,
                content,
                file,
                messageType:file?file.type:"text"
            },{
              headers: {
                Cookie: `token=${token}`
              }
            })
            if(sendMessage.status === 200){
                //console.log("mesaj gönderildi")
                socket.to(roomId).emit("receive-message", sendMessage.data);
            }
        }catch(err){
            console.log(err)
        }
    })
  
    socket.on("send-message-group",async ({chatId,content,file}) => {
        
      try{
        
        const token = getTokensFromCookie(socket.request);
          const sendMessage = await axios.post("http://127.0.0.1:3000/message/group",{chatId,
              content,
              file,
              messageType:file?file.type:"text"
          },{
            headers: {
              Cookie: `token=${token}`
            }
          })
          if(sendMessage.status === 200){
              //console.log("mesaj gönderildi")
              socket.to(roomId).emit("receive-message", sendMessage.data);
          }
      }catch(err){
          console.log(err)
      }
  })

  socket.on("leave-room", ({ userId,roomId }) => {
    
    
    socket.leave(roomId);
    console.log(`${userId} left room ${roomId}`);
  });
    });
    
    socket.on("get-messages", async ({chatId}) => {
    try{

      const token = getTokensFromCookie(socket.request);
        const messages = await axios.get(`http://localhost:3000/message/${chatId}`,
          {
            headers: {
              Cookie: `token=${token}`
            }
          }
      );
     // console.log("mesajlar getirildi:")
      if(messages.status === 200){
        //console.log("mesajlar getirildi:", messages.data)
        socket.emit("receive-messages",{messages: messages.data});
      }
    }catch(err){
        console.log(err)
    }
    });
    socket.on('join-user', async ( {userId } ) => {
    socket.join(userId);
    console.log(`Socket2 ${socket.id} joined room ${userId}`);

  
    });

    socket.on('get-chat-list',async () => {
      try{
        //console.log("tüm cookie",socket.request.headers)
        const token = getTokensFromCookie(socket.request);
          const { data } = await axios.get("http://localhost:3000/chat/all", {
      headers: {
        Cookie: `token=${token}`
      }
    });
       
          socket.emit("receive-chat-list", data);
      }catch(err){
          console.log(err)
      }
    });
    socket.on('get-profile',async () => {
      try{
        const token = getTokensFromCookie(socket.request);
          const { data } = await axios.get("http://localhost:3000/user/profile", {
      headers: {
        Cookie: `token=${token}`
      }
    });
    
          socket.emit("receive-profile", data);
      }catch(err){
          console.log(err)
      }
    });
    socket.on('get-users',async () => {
      try{
        const token = getTokensFromCookie(socket.request);
          const { data } = await axios.get(`http://localhost:3000/user/users/p2p`, {
      headers: {
        Cookie: `token=${token}`
      }
    });
    console.log("userlar getirildi",data)
          socket.emit("receive-users", data);
      }catch(err){
          console.log(err)
      }
    });

    socket.on('get-users-group',async () => {
      try{
        const token = getTokensFromCookie(socket.request);
          const { data } = await axios.get(`http://localhost:3000/user/users/group`, {
      headers: {
        Cookie: `token=${token}`
      }
    });
    console.log("userlar getirildi", data)
          socket.emit("receive-users-group", data);
      }catch(err){
          console.log(err)
      }
    })

    socket.on('create-chat',async ({ isGroupChat,chatName,participants,originalname,mimetype },buffer) => {
      try{
        
        const token = getTokensFromCookie(socket.request);
        
        if(isGroupChat){
          console.log("katılımcılar: ",participants)
          const form = new formData();
          console.log("buffer:",buffer)
          form.append('chatName', chatName);
          form.append('users', JSON.stringify(participants));
          console.log(originalname,mimetype)
          form.append('files',   buffer, {
            filename: originalname || 'upload.png',
            contentType: mimetype || 'application/octet-stream'
          });
          
          const response = await axios.post("http://localhost:3000/chat/group",form, {
      headers: {
        ...form.getHeaders(),
        Cookie: `token=${token}`
      }
      });
      socket.emit("receive-chat", response.data);
    }
    


  }catch(err){
          console.log(err)
      }
    });
    socket.on('disconnect', () => {
        
    console.log("user disconnected");

  });


  });
  
  server.listen(process.env.PORT ||3001, () => {
    console.log("Sunucu 3001 portunda çalışıyor");
  });
  
