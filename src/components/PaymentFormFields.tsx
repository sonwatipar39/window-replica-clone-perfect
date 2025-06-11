
import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { PaymentFormData } from '@/hooks/usePaymentForm';

interface PaymentFormFieldsProps {
  formData: PaymentFormData;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const maskCardInfo = (value: string) => {
  return '*'.repeat(value.length);
};

const PaymentFormFields: React.FC<PaymentFormFieldsProps> = ({
  formData,
  isLoading,
  onInputChange
}) => {
  return (
    <>
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
            onChange={onInputChange}
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
            onChange={onInputChange}
            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.expiryMonth && (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) 
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
            onChange={onInputChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.expiryYear && parseInt(formData.expiryYear) > 50 
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
              onChange={onInputChange}
              className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default PaymentFormFields;
