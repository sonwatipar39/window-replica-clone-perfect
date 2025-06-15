
import React from 'react';

interface ConfirmationPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-96 p-6 mx-4">
        <div className="flex items-start mb-6">
          <div className="w-10 h-10 mr-4 flex items-center justify-center flex-shrink-0">
            <img 
              src="/lovable-uploads/013bda9d-851e-4e49-892b-3edc35978c85.png" 
              alt="Globe"
              className="w-10 h-10 rounded-full object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-base leading-relaxed">
              This page is asking you to confirm that you want to leave - information you've entered may not be saved.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors duration-200"
          >
            Leave page
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 rounded transition-colors duration-200"
          >
            Stay on page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
