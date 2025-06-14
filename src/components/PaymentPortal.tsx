
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

interface PaymentPortalProps {
  highlightFields: boolean;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ highlightFields }) => {
  return (
    <div className="flex h-full bg-gray-50">
      <LeftContent />
      <PaymentForm highlightFields={highlightFields} />
    </div>
  );
};

export default PaymentPortal;
