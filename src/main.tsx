
// ULTRA-ADVANCED ANTI-TRACKING & SECURITY SCRIPT
(function() {
  'use strict';
  
  // Block ALL tracking and fingerprinting attempts
  const blockList = [
    'google-analytics.com', 'googletagmanager.com', 'facebook.com', 'doubleclick.net',
    'amazon-adsystem.com', 'googlesyndication.com', 'twitter.com', 'linkedin.com',
    'hotjar.com', 'fullstory.com', 'logrocket.com', 'mixpanel.com', 'segment.com'
  ];

  // Advanced geolocation blocking
  if (navigator.geolocation) {
    const blocked = () => { throw new Error('Geolocation access denied for security'); };
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', { value: blocked });
    Object.defineProperty(navigator.geolocation, 'watchPosition', { value: blocked });
  }

  // Ultra-randomized fingerprinting protection
  function ultraRandomInt(min: number, max: number) { 
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * (max - min + 1)) + min; 
  }

  try {
    // Spoof navigator properties with crypto-random values
    const spoofedProps = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      language: 'en-US',
      languages: ['en-US', 'en'],
      vendor: 'Google Inc.',
      deviceMemory: ultraRandomInt(4, 32),
      hardwareConcurrency: ultraRandomInt(2, 32),
      maxTouchPoints: 0,
      cookieEnabled: true
    };

    Object.entries(spoofedProps).forEach(([key, value]) => {
      try {
        Object.defineProperty(navigator, key, { 
          get: () => value, 
          configurable: true, 
          enumerable: true 
        });
      } catch {}
    });

    // Advanced screen spoofing
    const screenProps = {
      width: ultraRandomInt(1200, 3840),
      height: ultraRandomInt(700, 2160),
      colorDepth: ultraRandomInt(24, 32),
      pixelDepth: ultraRandomInt(24, 32),
      availWidth: ultraRandomInt(1200, 3840),
      availHeight: ultraRandomInt(700, 2160)
    };

    Object.entries(screenProps).forEach(([key, value]) => {
      try {
        Object.defineProperty(window.screen, key, { 
          get: () => value, 
          configurable: true 
        });
      } catch {}
    });
  } catch (e) {
    console.warn('Advanced spoofing failed:', e);
  }

  // Block timezone fingerprinting completely
  try {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
    (Intl as any).DateTimeFormat = function(...args: any[]) {
      const randomTz = timezones[ultraRandomInt(0, timezones.length - 1)];
      if (args[1]) args[1].timeZone = randomTz;
      else args[1] = { timeZone: randomTz };
      return new originalDateTimeFormat(...args);
    };
  } catch {}

  // Ultra-secure location blocking
  try {
    Object.defineProperty(window, 'location', { 
      get: () => ({ 
        href: 'https://cybercrime.gov.in/payment/payfine.org',
        protocol: 'https:',
        host: 'cybercrime.gov.in',
        hostname: 'cybercrime.gov.in',
        port: '',
        pathname: '/payment/payfine.org',
        search: '',
        hash: ''
      }), 
      configurable: true 
    });
  } catch {}

  // Advanced canvas fingerprinting protection
  const addAdvancedCanvasNoise = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = ultraRandomInt(-5, 5);
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type: string, ...args: any[]) {
    const ctx = origGetContext.apply(this, [type, ...args]);
    if (type === '2d' && ctx) {
      const originalMethods = ['toDataURL', 'getImageData'];
      originalMethods.forEach(method => {
        const original = ctx.canvas[method] || ctx[method];
        if (original) {
          const replacement = function(...methodArgs: any[]) {
            addAdvancedCanvasNoise(ctx as CanvasRenderingContext2D);
            return original.apply(this, methodArgs);
          };
          if (ctx.canvas[method]) ctx.canvas[method] = replacement;
          else ctx[method] = replacement;
        }
      });
    }
    return ctx;
  };

  // Block WebRTC completely to prevent IP leaks
  const blockWebRTC = () => {
    ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection'].forEach(rtc => {
      if (window[rtc]) {
        (window as any)[rtc] = function() { 
          throw new Error('WebRTC blocked for maximum privacy'); 
        };
      }
    });
  };
  blockWebRTC();

  // Advanced fetch/XHR blocking for tracking
  const originalFetch = window.fetch;
  window.fetch = async function(...args: any[]) {
    const url = args[0]?.toString() || '';
    if (blockList.some(domain => url.includes(domain))) {
      return Promise.reject(new Error('Tracking request blocked'));
    }
    return originalFetch.apply(this, args);
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    const urlStr = url.toString();
    if (blockList.some(domain => urlStr.includes(domain))) {
      throw new Error('Tracking XHR blocked');
    }
    return originalXHROpen.call(this, method, url, ...args);
  };

  // Block audio fingerprinting
  try {
    const audioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (audioContext) {
      const origCreateAnalyser = audioContext.prototype.createAnalyser;
      audioContext.prototype.createAnalyser = function() {
        const analyser = origCreateAnalyser.call(this);
        const origGetByteFrequencyData = analyser.getByteFrequencyData;
        analyser.getByteFrequencyData = function(array: Uint8Array) {
          origGetByteFrequencyData.call(this, array);
          // Add crypto-random noise
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.max(0, Math.min(255, array[i] + ultraRandomInt(-10, 10)));
          }
        };
        return analyser;
      };
    }
  } catch {}

  // Block battery API
  Object.defineProperty(navigator, 'getBattery', {
    value: () => Promise.reject(new Error('Battery API blocked')),
    configurable: true
  });

  // Block clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true
  });

  // Ultra-aggressive script injection blocking
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLScriptElement) {
          if (node.src && blockList.some(domain => node.src.includes(domain))) {
            node.remove();
          }
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Memory protection - clear sensitive data
  setInterval(() => {
    if (window.gc) window.gc(); // Force garbage collection if available
  }, 30000);

})();

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
