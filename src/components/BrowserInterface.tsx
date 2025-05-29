
import React from 'react';
import BrowserHeader from './BrowserHeader';
import PaymentPortal from './PaymentPortal';

const BrowserInterface = () => {
  return (
    <div className="h-full flex flex-col">
      <BrowserHeader />
      <div className="flex-1 overflow-auto">
        <PaymentPortal />
      </div>
    </div>
  );
};

export default BrowserInterface;
