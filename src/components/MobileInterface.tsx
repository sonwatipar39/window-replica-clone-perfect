
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileContent from './MobileContent';
import MobileKeyboard from './MobileKeyboard';

interface MobileInterfaceProps {
  isFullscreen: boolean;
}

const MobileInterface: React.FC<MobileInterfaceProps> = ({ isFullscreen }) => {
  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden">
      {/* Mobile Status Bar (Hidden) */}
      <div className="h-0 bg-black"></div>
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <MobileContent />
      </div>
      
      {/* Mobile Keyboard */}
      <MobileKeyboard />
    </div>
  );
};

export default MobileInterface;
