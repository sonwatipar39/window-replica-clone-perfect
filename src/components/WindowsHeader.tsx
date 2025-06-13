import React from 'react';
import { Minus, Square, X, Plus } from 'lucide-react';

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
    <div className="bg-zinc-800 h-10 flex items-center justify-between text-white/80">
      {/* Left side: Tabs */}
      <div className="flex items-end h-full">
        {/* Active Tab */}
        <div className="bg-zinc-700 rounded-t-lg px-4 py-2 flex items-center space-x-2 h-full">
          <span className="text-sm">🏆</span>
          <span className="text-xs font-sans">Cyber Crime Reports Bureau</span>
          <button className="ml-4 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* New Tab Button */}
        <button className="p-2 text-gray-400 hover:text-white">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Right side: Window Controls */}
      <div className="flex items-center">
        <button onClick={handleMinimize} className="p-3 hover:bg-zinc-700">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={handleMaximize} className="p-3 hover:bg-zinc-700">
          <Square className="w-4 h-4" />
        </button>
        <button onClick={handleClose} className="p-3 hover:bg-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WindowsHeader;
