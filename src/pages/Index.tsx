
import React, { useState, useEffect } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import WindowsInterface from '../components/WindowsInterface';

const Index = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);

  const handlePopupAction = async () => {
    setShowPopup(false);
    
    // Enter fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredFullscreen(true);
    } catch (error) {
      console.log('Fullscreen not available, continuing anyway');
      setIsFullscreen(true);
      setHasEnteredFullscreen(true);
    }
  };

  const handleClick = async () => {
    if (hasEnteredFullscreen && !document.fullscreenElement) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.log('Fullscreen not available');
        setIsFullscreen(true);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', handleClick);
    };
  }, [hasEnteredFullscreen]);

  if (showPopup) {
    return <ConfirmationPopup onAction={handlePopupAction} />;
  }

  return <WindowsInterface isFullscreen={isFullscreen} />;
};

export default Index;
