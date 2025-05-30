
import React from 'react';

const NewTopSection = () => {
  return (
    <div className="relative">
      {/* Browser Tab Bar */}
      <div className="bg-gray-200 h-8 flex items-center px-2 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <div className="bg-white border border-gray-300 rounded-t px-3 py-1 flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-gray-700">National Crime Records Bureau</span>
            <button className="text-gray-500 hover:text-gray-700">×</button>
          </div>
          <button className="text-gray-500 hover:text-gray-700 px-2">+</button>
        </div>
        <div className="flex-1"></div>
        <div className="flex space-x-1">
          <button className="w-6 h-6 bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-xs">−</button>
          <button className="w-6 h-6 bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-xs">□</button>
          <button className="w-6 h-6 bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs">×</button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-gray-100 h-10 flex items-center px-4 border-b border-gray-300">
        <div className="flex items-center space-x-2 flex-1">
          <button className="text-gray-500">←</button>
          <button className="text-gray-500">→</button>
          <button className="text-gray-500">↻</button>
          <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1 flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">https://cybercrime.gov.in/Webform/payment/fine.xls</span>
          </div>
          <button className="text-gray-500">⋮</button>
        </div>
      </div>

      {/* Government Header */}
      <div className="bg-blue-700 text-white py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-xs">
            <div>भारत सरकार | GOVERNMENT OF INDIA</div>
            <div>गृह मंत्रालय | MINISTRY OF HOME AFFAIRS</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-600 px-2 py-1 rounded text-xs">Language</span>
          <div className="w-6 h-6 bg-orange-500 rounded"></div>
        </div>
      </div>

      {/* Main Header with Logos */}
      <div className="bg-white py-4 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <img src="https://i.pinimg.com/originals/e2/a0/c9/e2a0c97029dfefe1f7b376f3cba9cc18.jpg" alt="Government Logo" className="h-16 w-auto" />
          <div>
            <div className="text-lg font-bold text-blue-900">राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल</div>
            <div className="text-xl font-bold text-blue-900">National Cyber Crime Reporting Portal</div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Emblem" className="h-16 w-auto" />
          <img src="https://images.seeklogo.com/logo-png/46/1/g20-india-2023-logo-png_seeklogo-466895.png" alt="G20 Logo" className="h-16 w-auto" />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-blue-600 text-white">
        <div className="flex items-center px-6">
          <button className="px-4 py-3 hover:bg-blue-700 flex items-center">
            <span className="mr-1">🏠</span>
          </button>
          <button className="px-4 py-3 hover:bg-blue-700">REPORT WOMEN/CHILDREN RELATED CRIME +</button>
          <button className="px-4 py-3 hover:bg-blue-700">REPORT CYBER CRIME +</button>
          <button className="px-4 py-3 hover:bg-blue-700">TRACK YOUR COMPLAINT</button>
          <button className="px-4 py-3 hover:bg-blue-700">CYBER VOLUNTEERS +</button>
          <button className="px-4 py-3 hover:bg-blue-700">RESOURCES +</button>
          <button className="px-4 py-3 hover:bg-blue-700">CONTACT US</button>
          <button className="px-4 py-3 hover:bg-blue-700">HELPLINE</button>
        </div>
      </div>
    </div>
  );
};

export default NewTopSection;
