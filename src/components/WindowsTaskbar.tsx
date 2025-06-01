import React, { useState, useEffect } from 'react';
import { Search, Folder, Mail, Calendar } from 'lucide-react';

const WindowsTaskbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-10 bg-gray-800 border-t border-gray-600 flex items-center justify-between px-2">
      {/* Left side - Windows logo only */}
      <div className="flex items-center space-x-1">
        <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
          </svg>
        </button>
      </div>
      
      {/* Middle section with search and app icons */}
      <div className="flex items-center space-x-1">
        <div className="bg-gray-700 rounded-full px-3 py-1 flex items-center space-x-2">
          <Search className="w-4 h-4 text-white" />
          <span className="text-white text-sm">Search</span>
        </div>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-green-500 rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-orange-500 rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-purple-500 rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-yellow-500 rounded"></div>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
        </button>
      </div>
      
      {/* Right side - unchanged */}
      <div className="flex items-center space-x-4">
        <div className="text-white text-xs text-right">
          <div>{formatTime(currentTime)}</div>
          <div>{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default WindowsTaskbar;
