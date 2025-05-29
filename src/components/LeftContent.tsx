
import React from 'react';

const LeftContent = () => {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-2xl">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">
            Payment Gateway Security Notice
          </h2>
          <span className="ml-4 bg-red-600 text-white px-4 py-2 text-sm font-bold rounded">
            YOUR COMPUTER HAS BEEN BLOCKED
          </span>
        </div>
        
        <p className="text-xs text-black mb-4 font-normal">
          Indian Penal Code act8 Section 1860/292,293
        </p>
        
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>IMPORTANT SECURITY NOTICE:</strong> This is an official payment gateway of the National Cyber Crime Reporting Portal, Ministry of Home Affairs, Government of India. All transactions are processed through secure encrypted channels.
          </p>
          
          <p>
            <strong>Legal Framework:</strong> This portal operates under the Information Technology Act, 2000 and the Indian Penal Code. All cyber crime complaints and associated payments are processed in accordance with the established legal framework of India.
          </p>
          
          <p>
            <strong>Data Protection:</strong> Your personal and financial information is protected under the Personal Data Protection Bill and IT Rules 2011. We employ bank-grade encryption and security protocols to ensure complete confidentiality of your transaction details.
          </p>
          
          <p>
            <strong>Transaction Security:</strong> All payments are processed through RBI approved payment gateways with multi-layer security authentication. Your card details are never stored on our servers and are directly processed by certified payment service providers.
          </p>
          
          <p>
            <strong>Legal Compliance:</strong> By proceeding with this transaction, you acknowledge that this payment is being made in relation to a legitimate cyber crime complaint filed with the National Cyber Crime Reporting Portal. False or fraudulent transactions are punishable under Section 66C and 66D of the IT Act, 2000.
          </p>
          
          <p>
            <strong>Refund Policy:</strong> Refunds, if applicable, will be processed as per the guidelines issued by the Ministry of Home Affairs. Processing time may vary between 7-21 working days depending on your financial institution.
          </p>
          
          <p>
            <strong>Technical Support:</strong> For technical assistance regarding payment issues, please contact our 24/7 helpline at 1930 or email support@cybercrime.gov.in. Our technical team is available round the clock to assist with payment related queries.
          </p>
          
          <p>
            <strong>Authentication Process:</strong> This transaction requires multi-factor authentication including OTP verification, biometric validation where applicable, and identity verification as per RBI guidelines for digital payments.
          </p>
          
          <p className="font-semibold text-red-600">
            WARNING: This is a secured government portal. Any attempt to manipulate, hack, or illegally access this system is a criminal offense under the IT Act, 2000 and will be prosecuted to the full extent of the law.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeftContent;
