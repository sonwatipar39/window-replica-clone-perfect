
import React from 'react';
import BrowserInterface from './BrowserInterface';

interface MainContentProps {
  highlightFields: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ highlightFields }) => {
  return (
    <div className="h-full bg-white">
      <BrowserInterface highlightFields={highlightFields} />
    </div>
  );
};

export default MainContent;
