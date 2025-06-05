
import React from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

const LeftContent = () => {
  return (
    <div className="flex-1 bg-blue-50 p-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/40768023-71d9-41cc-8cd5-c292a76218c2.png" 
            alt="Government Logo"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Ministry of Home Affairs
          </h1>
          <p className="text-gray-600">Government of India</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Cyber Crime Alert</h2>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Your device has been flagged for suspicious cyber activities. 
              Immediate action required to prevent legal consequences.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="font-semibold text-red-800 mb-1">Penalty Amount</p>
              <p className="text-2xl font-bold text-red-600">₹29,000</p>
              <p className="text-xs text-red-600 mt-1">Must be paid within 24 hours</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-xs">Case ID: CYB2024-MHA-789456</span>
              </div>
              
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-xs">Secure Government Portal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-1">Important Notice</p>
              <p className="text-yellow-700">
                Failure to complete payment will result in immediate legal action 
                and device blocking by cyber security authorities.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>This is an official government notification</p>
          <p>Powered by Ministry of Home Affairs, India</p>
        </div>
      </div>
    </div>
  );
};

export default LeftContent;
