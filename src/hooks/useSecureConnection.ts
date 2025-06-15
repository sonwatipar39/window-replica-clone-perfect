
import { useEffect, useRef } from 'react';
import { security } from '../utils/security';

export const useSecureConnection = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      // Enable all security features
      security.enableSecureMode();
      
      // Block middleware and man-in-the-middle attacks
      const originalWebSocket = window.WebSocket;
      window.WebSocket = class extends WebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          // Only allow secure WebSocket connections
          const secureUrl = url.toString().replace('ws://', 'wss://');
          super(secureUrl, protocols);
          
          // Add message encryption
          const originalSend = this.send;
          this.send = function(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
            if (typeof data === 'string') {
              const secureData = security.secureDataTransmission({ message: data });
              originalSend.call(this, JSON.stringify(secureData));
            } else {
              originalSend.call(this, data);
            }
          };
        }
      };

      // Block clipboard access for security
      Object.defineProperty(navigator, 'clipboard', {
        get: () => undefined,
        configurable: true
      });

      // Block geolocation completely
      Object.defineProperty(navigator, 'geolocation', {
        get: () => undefined,
        configurable: true
      });

      // Randomize timezone to prevent tracking
      const originalDateTimeFormat = Intl.DateTimeFormat;
      (Intl as any).DateTimeFormat = function(...args: any[]) {
        const randomTimezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
        const randomTz = randomTimezones[Math.floor(Math.random() * randomTimezones.length)];
        if (args[1]) {
          args[1].timeZone = randomTz;
        } else {
          args[1] = { timeZone: randomTz };
        }
        return new originalDateTimeFormat(...args);
      };

      isInitialized.current = true;
    }
  }, []);

  const secureTransmit = (data: any) => {
    return security.secureDataTransmission(data);
  };

  return { secureTransmit };
};
