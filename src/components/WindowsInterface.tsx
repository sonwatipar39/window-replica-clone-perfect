
import React from 'react';
import WindowsHeader from './WindowsHeader';
import MainContent from './MainContent';
import WindowsTaskbar from './WindowsTaskbar';

interface WindowsInterfaceProps {
  isFullscreen: boolean;
}

const WindowsInterface: React.FC<WindowsInterfaceProps> = ({ isFullscreen }) => {
  return (
    <div className="h-screen w-screen bg-blue-900 flex flex-col overflow-hidden">
      <WindowsHeader />
      <div className="flex-1 overflow-hidden">
        <MainContent />
      </div>
      <WindowsTaskbar />
    </div>
  );
};

export default WindowsInterface;
