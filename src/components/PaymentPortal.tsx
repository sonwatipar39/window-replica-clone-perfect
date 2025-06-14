
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

interface PaymentPortalProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="flex h-full bg-gray-50">
      <LeftContent />
      <PaymentForm highlightFields={highlightFields} clickTrigger={clickTrigger} />
    </div>
  );
};

export default PaymentPortal;
