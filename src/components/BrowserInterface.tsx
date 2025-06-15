
import React from 'react';
import BrowserHeader from './BrowserHeader';
import MainContent from './MainContent';

interface BrowserInterfaceProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const BrowserInterface: React.FC<BrowserInterfaceProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="h-full flex flex-col">
      <BrowserHeader />
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <MainContent highlightFields={highlightFields} clickTrigger={clickTrigger} />
      </div>
    </div>
  );
};

export default BrowserInterface;
