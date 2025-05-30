
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
      <div className="flex items-center space-x-1">
        <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
          </svg>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Folder className="w-4 h-4 text-white" />
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center bg-gray-600">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V14L15 18L19 14V11C20.1 11 21 10.1 21 9Z"/>
          </svg>
        </button>
        
        <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center">
          <Mail className="w-4 h-4 text-white" />
        </button>
      </div>
      
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
