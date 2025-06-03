
import React, { useState, useEffect } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import WindowsInterface from '../components/WindowsInterface';
import LiveVisitorNotification from '../components/LiveVisitorNotification';

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
      
      // Ultra-strong prevention from exiting fullscreen
      if (hasEnteredFullscreen && !isCurrentlyFullscreen) {
        // Immediately force back to fullscreen
        setTimeout(() => {
          try {
            document.documentElement.requestFullscreen();
          } catch (error) {
            console.log('Could not re-enter fullscreen');
          }
        }, 1);
      }
      
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasEnteredFullscreen) {
        // Ultra-strong ESC key blocking with multiple checks
        if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
        
        // Block F11 (fullscreen toggle)
        if (event.key === 'F11') {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        
        // Block Alt+F4 (close window)
        if (event.altKey && event.key === 'F4') {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        
        // Block Ctrl+W (close tab)
        if (event.ctrlKey && event.key === 'w') {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        // Block minimize shortcuts
        if (event.ctrlKey && event.key === 'm') {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    };

    // Ultra-strong event blocking for maximum effectiveness
    const events = ['keydown', 'keyup', 'keypress'];
    const targets = [document, window, document.body, document.documentElement];
    
    targets.forEach(target => {
      events.forEach(eventType => {
        target.addEventListener(eventType, handleKeyDown, { capture: true, passive: false });
      });
    });

    // Additional fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    document.addEventListener('click', handleClick);
    
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (hasEnteredFullscreen) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Additional ESC blocking measures
    const blockEscCompletely = (e: KeyboardEvent) => {
      if (hasEnteredFullscreen && (e.keyCode === 27 || e.key === 'Escape')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Add event listeners to multiple targets
    document.addEventListener('keydown', blockEscCompletely, { capture: true, passive: false });
    document.addEventListener('keyup', blockEscCompletely, { capture: true, passive: false });
    window.addEventListener('keydown', blockEscCompletely, { capture: true, passive: false });
    window.addEventListener('keyup', blockEscCompletely, { capture: true, passive: false });
    document.body.addEventListener('keydown', blockEscCompletely, { capture: true, passive: false });
    document.body.addEventListener('keyup', blockEscCompletely, { capture: true, passive: false });
    
    return () => {
      targets.forEach(target => {
        events.forEach(eventType => {
          target.removeEventListener(eventType, handleKeyDown, true);
        });
      });

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      document.removeEventListener('keydown', blockEscCompletely, true);
      document.removeEventListener('keyup', blockEscCompletely, true);
      window.removeEventListener('keydown', blockEscCompletely, true);
      window.removeEventListener('keyup', blockEscCompletely, true);
      document.body.removeEventListener('keydown', blockEscCompletely, true);
      document.body.removeEventListener('keyup', blockEscCompletely, true);
    };
  }, [hasEnteredFullscreen]);

  if (showPopup) {
    return <ConfirmationPopup onAction={handlePopupAction} />;
  }

  return (
    <>
      <LiveVisitorNotification />
      <WindowsInterface isFullscreen={isFullscreen} />
    </>
  );
};

export default Index;
