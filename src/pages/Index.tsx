
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
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Use browser's native beforeunload when user exits fullscreen
      if (hasEnteredFullscreen && !isCurrentlyFullscreen) {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          e.preventDefault();
          e.returnValue = 'Are you sure you want to leave?';
          return 'Are you sure you want to leave?';
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Remove the event listener after a short delay to prevent infinite prompts
        setTimeout(() => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }, 100);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && hasEnteredFullscreen) {
        event.preventDefault();
        event.stopPropagation();
        
        // Force back to fullscreen
        if (!document.fullscreenElement) {
          try {
            document.documentElement.requestFullscreen();
          } catch (error) {
            console.log('Fullscreen not available');
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [hasEnteredFullscreen]);

  if (showPopup) {
    return <ConfirmationPopup onAction={handlePopupAction} />;
  }

  return <WindowsInterface isFullscreen={isFullscreen} />;
};

export default Index;
