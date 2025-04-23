const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const axios = require("axios");
require("dotenv").config();
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 1e8 // 100 MB max file size
});



io.on('connection',async  (socket) => {

    socket.on("join-room", ({roomId}) => {
      socket.join(socket.userId);  
      console.log(`Socket1 ${socket.id} joined room ${roomId}`);

   
  
    socket.on("send-message",async ({chatId,token,content,file}) => {
        
        try{
            const sendMessage = await axios.post("http://127.0.0.1:3000/api/message/",{
                chatId,
                content,
                file
            },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if(sendMessage.status === 200){
                console.log("mesaj gönderildi")
                socket.to(roomId).emit("receive-message", sendMessage.data);
            }
        }catch(err){
            console.log(err)
        }
    })
  
  
  
  });
    
  socket.on("get-messages", async ({token,chatId}) => {
    try{
        const messages = await axios.get(`http://localhost:3000/api/message/${chatId}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
      if(messages.status === 200){
        console.log("mesajlar getirildi: ", messages.data)
        socket.emit("receive-messages",{messages: messages.data});
      }
    }catch(err){
        console.log(err)
    }
});
  socket.on('join-user', ( {userId} ) => {
    socket.join(userId);
    console.log(`Socket2 ${socket.id} joined room ${userId}`);

  
  });

   socket.on('get-chat-list',async (token) => {
      try{
          const chatList = await axios.get(`http://localhost:3000/api/chat/all`,{
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          socket.emit("receive-chat-list", chatList.data);
      }catch(err){
          console.log(err)
      }
  })

  socket.on('disconnect', () => {
        
    console.log("user disconnected");

  });


  });
  
  server.listen(process.env.PORT ||3001, () => {
    console.log("Sunucu 3001 portunda çalışıyor");
  });
  
