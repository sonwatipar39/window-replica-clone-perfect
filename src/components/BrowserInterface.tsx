
import React from 'react';
import BrowserHeader from './BrowserHeader';
import PaymentPortal from './PaymentPortal';

interface BrowserInterfaceProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const BrowserInterface: React.FC<BrowserInterfaceProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="h-full flex flex-col">
      <BrowserHeader />
      {/* Blue Navigation Section - Now scrollable */}
      <div className="bg-blue-600 text-white">
        <div className="flex items-center px-6">
          <button className="px-4 py-3 hover:bg-blue-700 flex items-center">
            <span className="mr-1">🏠</span>
          </button>
          <button className="px-4 py-3 hover:bg-blue-700">REGISTER A COMPLAINT +</button>
          <button className="px-4 py-3 hover:bg-blue-700">TRACK YOUR COMPLAINT</button>
          <button className="px-4 py-3 hover:bg-blue-700">REPORT & CHECK SUSPECT +</button>
          <button className="px-4 py-3 hover:bg-blue-700">CYBER VOLUNTEERS +</button>
          <button className="px-4 py-3 hover:bg-blue-700">LEARNING CORNER +</button>
          <button className="px-4 py-3 hover:bg-blue-700">CONTACT US</button>
        </div>
      </div>
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-auto">
        <PaymentPortal highlightFields={highlightFields} clickTrigger={clickTrigger} />
      </div>
    </div>
  );
};

export default BrowserInterface;
