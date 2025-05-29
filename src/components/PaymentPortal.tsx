
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

const PaymentPortal = () => {
  return (
    <div className="min-h-full bg-white">
      <div className="relative bg-blue-800 text-white py-3 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">National Cyber Crime Reporting Portal</h1>
          <p className="text-sm opacity-90">Ministry of Home Affairs, Government of India</p>
        </div>
        
        <div 
          className="flex items-center space-x-4 relative z-10"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e40af 80%, transparent 100%)',
            clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)',
            paddingRight: '40px',
            marginRight: '-20px'
          }}
        >
          <img 
            src="https://i.pinimg.com/originals/e2/a0/c9/e2a0c97029dfefe1f7b376f3cba9cc18.jpg" 
            alt="Logo 1" 
            className="h-12 w-auto object-contain"
          />
          <img 
            src="https://images.seeklogo.com/logo-png/46/1/g20-india-2023-logo-png_seeklogo-466895.png" 
            alt="G20 India Logo" 
            className="h-12 w-auto object-contain"
          />
          <img 
            src="https://i0.wp.com/lawbhoomi.com/wp-content/uploads/2025/04/Indian-Cyber-Crime-Coordination-Centre-Delhi.jpg?fit=1200,800&ssl=1" 
            alt="Cyber Crime Centre Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>
      
      <div className="flex">
        <LeftContent />
        <PaymentForm />
      </div>
    </div>
  );
};

export default PaymentPortal;
