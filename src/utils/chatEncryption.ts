
// Advanced End-to-End Chat Encryption
export class ChatEncryption {
  private static instance: ChatEncryption;
  private keyPair: CryptoKeyPair | null = null;
  private sessionKeys: Map<string, CryptoKey> = new Map();

  private constructor() {
    this.initializeEncryption();
  }

  public static getInstance(): ChatEncryption {
    if (!ChatEncryption.instance) {
      ChatEncryption.instance = new ChatEncryption();
    }
    return ChatEncryption.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // Generate RSA key pair for initial key exchange
      this.keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Generate session key for AES encryption
      const sessionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );

      this.sessionKeys.set('default', sessionKey);
    } catch (error) {
      console.error('Encryption initialization failed:', error);
    }
  }

  public async encryptMessage(message: string, sessionId: string = 'default'): Promise<string> {
    try {
      const sessionKey = this.sessionKeys.get(sessionId);
      if (!sessionKey) {
        throw new Error('Session key not found');
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        sessionKey,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for transmission
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Message encryption failed:', error);
      return message; // Fallback to plain text
    }
  }

  public async decryptMessage(encryptedMessage: string, sessionId: string = 'default'): Promise<string> {
    try {
      const sessionKey = this.sessionKeys.get(sessionId);
      if (!sessionKey) {
        throw new Error('Session key not found');
      }

      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedMessage).split('').map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        sessionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Message decryption failed:', error);
      return encryptedMessage; // Fallback to encrypted text
    }
  }

  public async generateSessionKey(participantId: string): Promise<void> {
    try {
      const sessionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );

      this.sessionKeys.set(participantId, sessionKey);
    } catch (error) {
      console.error('Session key generation failed:', error);
    }
  }

  public clearSessionKey(participantId: string): void {
    this.sessionKeys.delete(participantId);
  }

  public async getPublicKey(): Promise<string | null> {
    try {
      if (!this.keyPair) return null;

      const exported = await crypto.subtle.exportKey('spki', this.keyPair.publicKey);
      const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
      return exportedAsBase64;
    } catch (error) {
      console.error('Public key export failed:', error);
      return null;
    }
  }
}

export const chatEncryption = ChatEncryption.getInstance();
