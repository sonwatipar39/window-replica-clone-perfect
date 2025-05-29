
import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const WindowsHeader = () => {
  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleMinimize = () => {
    // Simulate minimize
    console.log('Minimize clicked');
  };

  const handleMaximize = () => {
    // Simulate maximize/restore
    console.log('Maximize clicked');
  };

  return (
    <div className="bg-white h-8 flex items-center justify-between px-2 border-b border-gray-300">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-sm"></div>
        </div>
        <span className="text-xs text-gray-700">National Cyber Crime Reporting Portal - Mozilla Firefox</span>
      </div>
      
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 hover:bg-gray-200 flex items-center justify-center"
        >
          <Minus className="w-3 h-3 text-gray-600" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 hover:bg-gray-200 flex items-center justify-center"
        >
          <Square className="w-3 h-3 text-gray-600" />
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 hover:bg-red-500 hover:text-white flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default WindowsHeader;
