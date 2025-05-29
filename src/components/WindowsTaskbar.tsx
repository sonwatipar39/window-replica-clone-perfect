
import React from 'react';
import { Search, Folder, Chrome, Mail, Calendar, Settings } from 'lucide-react';

const WindowsTaskbar = () => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="h-10 bg-gray-800 border-t border-gray-600 flex items-center justify-between px-2">
      <div className="flex items-center space-x-1">
        <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Folder className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center bg-gray-600">
          <Chrome className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Mail className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Calendar className="w-4 h-4 text-white" />
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
        </div>
        
        <button className="hover:bg-gray-700 rounded p-1">
          <Settings className="w-4 h-4 text-white" />
        </button>
        
        <div className="text-white text-xs text-right">
          <div>{currentTime}</div>
          <div>{currentDate}</div>
        </div>
      </div>
    </div>
  );
};

export default WindowsTaskbar;
