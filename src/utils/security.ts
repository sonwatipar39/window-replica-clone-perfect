
// Advanced Security and Anti-Tracking Utilities
export class SecurityProtection {
  private static instance: SecurityProtection;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = this.generateSecureKey();
    this.initializeProtections();
  }

  public static getInstance(): SecurityProtection {
    if (!SecurityProtection.instance) {
      SecurityProtection.instance = new SecurityProtection();
    }
    return SecurityProtection.instance;
  }

  private generateSecureKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private initializeProtections(): void {
    this.enableAdvancedAntiTracking();
    this.setupNetworkSecurity();
    this.implementDataEncryption();
    this.activateAntiFingerprinting();
  }

  private enableAdvancedAntiTracking(): void {
    // Block tracking scripts and pixels
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      const blockList = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com',
        'doubleclick.net',
        'amazon-adsystem.com',
        'googlesyndication.com',
        'twitter.com',
        'linkedin.com'
      ];
      
      if (blockList.some(domain => url.includes(domain))) {
        throw new Error('Tracking request blocked');
      }
      return originalFetch(...args);
    };

    // Block WebRTC to prevent IP leaks
    const originalRTCPeerConnection = window.RTCPeerConnection;
    (window as any).RTCPeerConnection = function() {
      throw new Error('WebRTC blocked for privacy');
    };
  }

  private setupNetworkSecurity(): void {
    // Implement secure communication channels
    const secureHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    };

    // Override XMLHttpRequest to add security headers
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      originalXHROpen.call(this, method, url, ...args);
      Object.entries(secureHeaders).forEach(([key, value]) => {
        this.setRequestHeader(key, value);
      });
    };
  }

  private implementDataEncryption(): void {
    // Encrypt sensitive data before transmission
    const encrypt = async (data: string): Promise<string> => {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.encryptionKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );

      return Array.from(new Uint8Array(encrypted), byte => 
        String.fromCharCode(byte)
      ).join('');
    };

    // Store encryption function globally for use
    (window as any).secureEncrypt = encrypt;
  }

  private activateAntiFingerprinting(): void {
    // Advanced fingerprinting protection
    const randomizeValue = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;

    // Spoof screen properties
    Object.defineProperty(screen, 'width', {
      get: () => randomizeValue(1200, 1920),
      configurable: true
    });
    Object.defineProperty(screen, 'height', {
      get: () => randomizeValue(700, 1080),
      configurable: true
    });
    Object.defineProperty(screen, 'colorDepth', {
      get: () => randomizeValue(24, 32),
      configurable: true
    });

    // Spoof navigator properties
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => randomizeValue(4, 16),
      configurable: true
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => randomizeValue(4, 16),
      configurable: true
    });

    // Block font fingerprinting
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      const context = originalGetContext.call(this, type, ...args);
      if (type === '2d' && context) {
        const originalFillText = context.fillText;
        context.fillText = function(...textArgs) {
          // Add random noise to text rendering
          const noise = Math.random() * 0.1;
          context.globalAlpha = 1 - noise;
          return originalFillText.apply(this, textArgs);
        };
      }
      return context;
    };

    // Block audio fingerprinting
    const originalGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData;
    AnalyserNode.prototype.getByteFrequencyData = function(array) {
      originalGetByteFrequencyData.call(this, array);
      // Add random noise to audio data
      for (let i = 0; i < array.length; i++) {
        array[i] = array[i] + Math.random() * 10;
      }
    };
  }

  public secureDataTransmission(data: any): any {
    // Implement secure data transmission
    const secureData = {
      ...data,
      timestamp: Date.now(),
      nonce: crypto.getRandomValues(new Uint32Array(1))[0],
      signature: this.generateSignature(JSON.stringify(data))
    };
    return secureData;
  }

  private generateSignature(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  public enableSecureMode(): void {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable developer tools shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    });

    // Clear console periodically
    setInterval(() => {
      console.clear();
    }, 1000);

    // Detect and block debugging attempts
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect or take action when dev tools detected
          window.location.href = 'about:blank';
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }
}

// Initialize security on module load
export const security = SecurityProtection.getInstance();
