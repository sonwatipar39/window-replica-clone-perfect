
import React from 'react';
import { Plus, X } from 'lucide-react';

const WindowsHeader = () => {
  const handleClose = () => {
    // Disabled - do nothing
    console.log('Close button disabled');
  };

  const handleNewTab = () => {
    // Disabled - do nothing
    console.log('New tab button disabled');
  };

  return (
    <div className="bg-white h-10 flex items-stretch border-b border-gray-300 relative">
      {/* Chrome-style tab */}
      <div className="flex items-center bg-white relative">
        {/* Tab shape with curved edges */}
        <div className="relative bg-white h-10 px-4 flex items-center min-w-[200px] max-w-[240px] border-r border-gray-200"
             style={{
               clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 100%, 0% 100%)',
               background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)'
             }}>
          
          {/* Favicon and Title */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <img 
              src="https://images.seeklogo.com/logo-png/29/1/indian-government-logo-png_seeklogo-290980.png?v=1962824090018642648" 
              alt="Government Logo" 
              className="w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-gray-700 font-sans truncate">Cyber Crime Reports Bureau</span>
          </div>
          
          {/* Tab close button */}
          <button
            onClick={handleClose}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full ml-2 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Tab separator line */}
        <div className="w-px h-6 bg-gray-300 self-center"></div>
      </div>
      
      {/* New tab button */}
      <div className="flex items-center">
        <button
          onClick={handleNewTab}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded ml-1"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Browser controls area (right side) */}
      <div className="flex-1 flex items-center justify-end pr-2">
        <div className="flex space-x-1">
          {/* Window controls */}
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default WindowsHeader;
