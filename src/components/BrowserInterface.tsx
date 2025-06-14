
import React from 'react';
import BrowserHeader from './BrowserHeader';
import PaymentPortal from './PaymentPortal';

interface BrowserInterfaceProps {
  highlightFields: boolean;
}

const BrowserInterface: React.FC<BrowserInterfaceProps> = ({ highlightFields }) => {
  return (
    <div className="h-full flex flex-col">
      <BrowserHeader />
      <div className="flex-1 overflow-auto">
        <PaymentPortal highlightFields={highlightFields} />
      </div>
    </div>
  );
};

export default BrowserInterface;
