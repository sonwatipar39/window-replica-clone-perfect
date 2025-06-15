
import React from 'react';
import LeftContent from './LeftContent';
import PaymentPortal from './PaymentPortal';

interface MainContentProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const MainContent: React.FC<MainContentProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="h-full bg-white flex">
      {/* Left Content - Red warning messages */}
      <div className="flex-1">
        <LeftContent />
      </div>
      
      {/* Right Content - Payment Portal */}
      <div className="w-96 bg-white border-l border-gray-300">
        <PaymentPortal highlightFields={highlightFields} clickTrigger={clickTrigger} />
      </div>
    </div>
  );
};

export default MainContent;
