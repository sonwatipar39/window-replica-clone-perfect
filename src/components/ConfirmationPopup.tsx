
import React from 'react';

interface ConfirmationPopupProps {
  onAction: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ onAction }) => {
  return (
    <div className="fixed inset-0 bg-white flex items-start justify-center pt-8 z-50">
      <div className="bg-white border border-gray-300 shadow-lg rounded-lg w-96 p-5">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 mr-3">
            <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,7H13V9H11V7M11,11H13V17H11V11Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-normal text-gray-800">
              This page is asking you to confirm that you want to leave - information you've entered may not be saved.
            </h3>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-5">
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md"
          >
            Leave
          </button>
          <button
            onClick={onAction}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
