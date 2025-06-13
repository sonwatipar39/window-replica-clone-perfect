
import React from 'react';
import { Plus, X } from 'lucide-react';

const WindowsHeader = () => {
  const handleClose = () => {
    // Disabled - do nothing
    console.log('Close button disabled');
  };



  return (
    <div className="flex items-center bg-zinc-800 pl-2">
      {/* Active Tab */}
      <div className="bg-zinc-700 rounded-t-md px-3 py-2 flex items-center space-x-2 text-white/80 relative">
        <span className="text-sm">🏆</span>
        <span className="text-xs font-sans">Cyber Crime Reports Bureau</span>
        <X onClick={handleClose} className="w-4 h-4 ml-4 text-gray-400 hover:text-white cursor-pointer" />
      </div>
      {/* New Tab Button */}
      <div className="flex items-center justify-center text-gray-400 hover:text-white cursor-pointer p-2">
        <Plus className="w-4 h-4" />
      </div>
    </div>
  );
};

export default WindowsHeader;
