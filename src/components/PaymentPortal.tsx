
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

const PaymentPortal = () => {
  return (
    <div className="flex h-full bg-gray-50">
      <LeftContent />
      <PaymentForm />
    </div>
  );
};

export default PaymentPortal;
