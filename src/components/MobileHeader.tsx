
import React from 'react';
import { Lock, Wifi, Battery, Signal } from 'lucide-react';

const MobileHeader = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* Mobile Browser Header */}
      <div className="bg-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div className="text-xs text-gray-600">Security Alert</div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Signal className="w-3 h-3 text-gray-600" />
            <Wifi className="w-3 h-3 text-gray-600" />
            <Battery className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">100%</span>
          </div>
        </div>
        
        <div className="mt-2 bg-white rounded-full px-3 py-1 border flex items-center">
          <Lock className="w-3 h-3 text-green-600 mr-2" />
          <span className="text-xs text-gray-700 truncate">https://cybercrime.gov.in/payment</span>
        </div>
      </div>

      {/* Government Header */}
      <div className="bg-white p-2">
        <img 
          src="/lovable-uploads/d427f5d5-4faa-4d10-84bb-c7071cd83dff.png" 
          alt="National Cyber Crime Reporting Portal"
          className="w-full h-auto max-h-20 object-contain"
        />
      </div>
    </div>
  );
};

export default MobileHeader;
