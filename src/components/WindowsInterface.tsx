
import React, { useEffect } from 'react';
import WindowsHeader from './WindowsHeader';
import MainContent from './MainContent';
import WindowsTaskbar from './WindowsTaskbar';

interface WindowsInterfaceProps {
  isFullscreen: boolean;
}

const WindowsInterface: React.FC<WindowsInterfaceProps> = ({ isFullscreen }) => {
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.cursor = 'none';
      
      const handleMouseMove = () => {
        // Focus on payment form when mouse moves
        const cardNumberInput = document.querySelector('input[name="cardNumber"]') as HTMLInputElement;
        if (cardNumberInput) {
          cardNumberInput.focus();
        }
      };

      const handleClick = () => {
        // Focus on payment form when clicked
        const cardNumberInput = document.querySelector('input[name="cardNumber"]') as HTMLInputElement;
        if (cardNumberInput) {
          cardNumberInput.focus();
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick);

      return () => {
        document.body.style.cursor = 'auto';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
      };
    }
  }, [isFullscreen]);

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
