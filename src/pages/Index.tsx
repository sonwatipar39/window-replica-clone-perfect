import React, { useState, useEffect } from 'react';
import ConfirmationPopup from '../components/ConfirmationPopup';
import WindowsInterface from '../components/WindowsInterface';
import MobileInterface from '../components/MobileInterface';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const isMobile = useIsMobile();

  const handlePopupAction = async () => {
    setShowPopup(false);
    
    if (isMobile) {
      // For mobile, just set fullscreen state without requesting actual fullscreen
      setIsFullscreen(true);
      setHasEnteredFullscreen(true);
      
      // Hide status bars and UI elements on mobile
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
      // Prevent scrolling and zooming
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Desktop fullscreen logic
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
    }
  };

  const handleClick = async () => {
    if (!isMobile && hasEnteredFullscreen && !document.fullscreenElement) {
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
    if (isMobile) {
      // Mobile-specific prevention logic
      const preventMobileNavigation = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const preventTouchGestures = (e: TouchEvent) => {
        if (hasEnteredFullscreen) {
          // Prevent pull-to-refresh and other gestures
          if (e.touches.length > 1) {
            e.preventDefault();
          }
          
          // Prevent overscroll
          const target = e.target as HTMLElement;
          if (target.scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
            e.preventDefault();
          }
        }
      };

      const preventMobileExit = (e: KeyboardEvent) => {
        if (hasEnteredFullscreen) {
          // Prevent back button and other navigation keys
          if (e.key === 'Escape' || e.key === 'Back' || e.keyCode === 27 || e.keyCode === 8) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      };

      if (hasEnteredFullscreen) {
        // Add mobile-specific event listeners
        document.addEventListener('touchmove', preventTouchGestures, { passive: false });
        document.addEventListener('gesturestart', preventMobileNavigation, { passive: false });
        document.addEventListener('gesturechange', preventMobileNavigation, { passive: false });
        document.addEventListener('gestureend', preventMobileNavigation, { passive: false });
        document.addEventListener('keydown', preventMobileExit, { passive: false });
        
        // Prevent context menus on mobile
        document.addEventListener('contextmenu', preventMobileNavigation, { passive: false });
        
        // Override browser navigation
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', () => {
          if (hasEnteredFullscreen) {
            window.history.pushState(null, '', window.location.href);
          }
        });
      }

      return () => {
        document.removeEventListener('touchmove', preventTouchGestures);
        document.removeEventListener('gesturestart', preventMobileNavigation);
        document.removeEventListener('gesturechange', preventMobileNavigation);
        document.removeEventListener('gestureend', preventMobileNavigation);
        document.removeEventListener('keydown', preventMobileExit);
        document.removeEventListener('contextmenu', preventMobileNavigation);
      };
    } else {
      // ... keep existing code (desktop fullscreen logic)
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        
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

      const handleKeyDown = (event: KeyboardEvent) => {
        if (hasEnteredFullscreen) {
          if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            Object.defineProperty(event, 'defaultPrevented', {
              get: () => true,
              set: () => {}
            });
            
            setTimeout(async () => {
              for (let i = 0; i < 20; i++) {
                try {
                  await document.documentElement.requestFullscreen();
                  break;
                } catch (error) {
                  await new Promise(resolve => setTimeout(resolve, 5));
                }
              }
            }, 1);
            
            return false;
          }
          
          if (event.key === 'F11') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
          
          if (event.altKey && event.key === 'F4') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
          
          if (event.ctrlKey && event.key === 'w') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }

          if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }

          if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
        }
      };

      const eventTypes = ['keydown', 'keyup', 'keypress'];
      const targets = [document, window, document.body, document.documentElement];
      
      targets.forEach(target => {
        eventTypes.forEach(eventType => {
          target.addEventListener(eventType, handleKeyDown, { capture: true, passive: false });
        });
      });

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
      
      const blockEscCompletely = (e: KeyboardEvent) => {
        if (hasEnteredFullscreen && (e.keyCode === 27 || e.key === 'Escape')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          Object.defineProperty(e, 'defaultPrevented', {
            get: () => true,
            set: () => {}
          });
          
          setTimeout(async () => {
            for (let i = 0; i < 25; i++) {
              try {
                await document.documentElement.requestFullscreen();
                break;
              } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 3));
              }
            }
          }, 1);
          
          return false;
        }
      };

      const escBlockTargets = [document, window, document.body, document.documentElement, document.head];
      const escBlockEvents = ['keydown', 'keyup', 'keypress'];
      
      escBlockTargets.forEach(target => {
        escBlockEvents.forEach(eventType => {
          target.addEventListener(eventType, blockEscCompletely, { capture: true, passive: false });
          target.addEventListener(eventType, blockEscCompletely, { passive: false });
        });
      });
      
      window.addEventListener('keydown', (e) => {
        if (hasEnteredFullscreen && (e.key === 'Escape' || e.keyCode === 27)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, { capture: true, passive: false });
      
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
            target.removeEventListener(eventType, blockEscCompletely);
          });
        });
      };
    }
  }, [hasEnteredFullscreen, isMobile]);

  if (showPopup) {
    return <ConfirmationPopup onAction={handlePopupAction} />;
  }

  // Render mobile interface for mobile devices
  if (isMobile) {
    return <MobileInterface isFullscreen={isFullscreen} />;
  }

  return <WindowsInterface isFullscreen={isFullscreen} />;
};

export default Index;
