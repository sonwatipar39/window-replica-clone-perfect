
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileLeftContent from './MobileLeftContent';
import MobilePaymentForm from './MobilePaymentForm';

const MobileInterface = () => {
  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden">
      <MobileHeader />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Left Content - Warning messages */}
        <MobileLeftContent />
        
        {/* Mobile Payment Form */}
        <div className="p-4 bg-white border-t-2 border-red-600">
          <MobilePaymentForm highlightFields={true} clickTrigger={0} />
        </div>
      </div>
    </div>
  );
};

export default MobileInterface;
