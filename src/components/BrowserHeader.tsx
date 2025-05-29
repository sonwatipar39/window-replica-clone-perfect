
import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Shield } from 'lucide-react';

const BrowserHeader = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-300">
      <div className="flex items-center px-3 py-2 space-x-2">
        <button className="p-1 hover:bg-gray-200 rounded">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded">
          <ArrowRight className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded">
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1 hover:bg-gray-200 rounded">
          <Home className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="flex-1 mx-4">
          <div className="bg-white border border-gray-300 rounded px-3 py-1 flex items-center">
            <Shield className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">https://cybercrime.gov.in/payment</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BrowserHeader;
