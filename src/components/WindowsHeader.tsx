
import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const WindowsHeader = () => {
  const handleClose = () => {
    // Disabled - do nothing
    console.log('Close button disabled');
  };

  const handleMinimize = () => {
    // Disabled - do nothing
    console.log('Minimize button disabled');
  };

  const handleMaximize = () => {
    // Disabled - do nothing
    console.log('Maximize button disabled');
  };

  return (
    <div className="bg-gray-100 h-8 flex items-center justify-between px-2 border-b border-gray-300">
      <div className="flex items-center space-x-2">
        <img 
          src="https://images.seeklogo.com/logo-png/29/1/indian-government-logo-png_seeklogo-290980.png?v=1962824090018642648" 
          alt="Government Logo" 
          className="w-4 h-4 rounded-sm" 
        />
        <span className="text-xs text-gray-700">Cyber Crime Reports Bureau</span>
      </div>
      
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 hover:bg-red-500 hover:text-white flex items-center justify-center text-gray-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default WindowsHeader;
