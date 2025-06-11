
import React from 'react';
import { Home, ArrowLeft, Square } from 'lucide-react';

const MobileKeyboard = () => {
  const handleButtonPress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Buttons are non-functional as requested
    return false;
  };

  return (
    <div className="bg-black p-2 flex justify-center items-center space-x-8">
      {/* Navigation buttons - small and non-pressable */}
      <button 
        onClick={handleButtonPress}
        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 cursor-default"
        disabled
      >
        <ArrowLeft className="w-4 h-4 text-gray-500" />
      </button>
      
      <button 
        onClick={handleButtonPress}
        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 cursor-default"
        disabled
      >
        <Home className="w-4 h-4 text-gray-500" />
      </button>
      
      <button 
        onClick={handleButtonPress}
        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 cursor-default"
        disabled
      >
        <Square className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
};

export default MobileKeyboard;
