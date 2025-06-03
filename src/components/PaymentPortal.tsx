
import React from 'react';
import NewTopSection from './NewTopSection';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

const PaymentPortal = () => {
  return (
    <div className="min-h-full bg-white">
      <NewTopSection />
      <div className="flex">
        <LeftContent />
        <PaymentForm invoiceId="INV-001" amount="299" />
      </div>
    </div>
  );
};

export default PaymentPortal;
