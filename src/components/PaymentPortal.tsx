
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

const PaymentPortal = () => {
  return (
    <div className="min-h-full bg-white">
      <div className="bg-blue-800 text-white py-3 px-4">
        <h1 className="text-lg font-bold">National Cyber Crime Reporting Portal</h1>
        <p className="text-sm opacity-90">Ministry of Home Affairs, Government of India</p>
      </div>
      
      <div className="flex">
        <LeftContent />
        <PaymentForm />
      </div>
    </div>
  );
};

export default PaymentPortal;
