import React from 'react';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

const MobileLeftContent = () => {
  return (
    <div className="p-4 bg-gray-50">
      {/* Device Block Red Background Content Banner */}
      <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center shadow-lg">
        <div className="flex items-center justify-center mb-3">
          <AlertTriangle className="w-8 h-8 mr-2" />
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-3">
          YOUR DEVICE HAS BEEN BLOCKED
        </h1>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">
            Your device has been blocked due to repeated visits to pornographic sites containing materials prohibited by the laws of India.
          </p>
          <p className="text-yellow-200 font-bold">
            You must pay a fine of ₹29,000 by credit card as prescribed by IPC section 292 and 293.
          </p>
          <p className="text-yellow-100">
            <strong>Attention!</strong> If you fail to pay the fine or attempt to unblock your device without paying, all information will be permanently deleted.
          </p>
          <p>
            Criminal charges will be filed against you. Your device will be unlocked automatically after payment.
          </p>
        </div>
      </div>

      {/* Legal Framework Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Legal Framework & Compliance
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="font-medium text-red-800">
              <strong>Section 292 (1):</strong> Distribution of obscene content is punishable by imprisonment up to 2 years and fine up to ₹2,50,000.
            </p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="font-medium text-red-800">
              <strong>Section 292 (2):</strong> Possession of such content for viewing is equally punishable under the law.
            </p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="font-medium text-yellow-800">
              <strong>Warning:</strong> Case materials will be transferred to Ministry of Law for criminal proceedings if fine is not paid.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Payment Gateway Security Notice
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>
            <strong>IMPORTANT SECURITY NOTICE:</strong> This is an official payment gateway of the National Cyber Crime Reporting Portal, Ministry of Home Affairs, Government of India.
          </p>
          <p>
            <strong>Data Protection:</strong> Your personal and financial information is protected under the Personal Data Protection Bill and IT Rules 2011.
          </p>
          <p>
            <strong>Transaction Security:</strong> All payments are processed through RBI approved payment gateways with multi-layer security authentication.
          </p>
          <p>
            <strong>Legal Compliance:</strong> By proceeding with this transaction, you acknowledge that this payment is being made in relation to a legitimate cyber crime complaint.
          </p>
          <p className="text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-200">
            <strong>WARNING:</strong> This is a secured government portal. Any attempt to manipulate, hack, or illegally access this system is a criminal offense under the IT Act, 2000.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLeftContent;