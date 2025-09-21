// Crypto utilities for E2EE user data (likes/bookmarks)
// Uses Web Crypto API for AES-GCM encryption

export class CryptoUtils {
  // Generate random bytes
  static async randomBytes(length: number): Promise<Uint8Array> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  // Import AES-GCM key from raw bytes
  static async importAesKey(keyBytes: ArrayBuffer): Promise<CryptoKey> {
    try {
      if (!keyBytes || !(keyBytes instanceof ArrayBuffer)) {
        throw new Error('Key bytes must be an ArrayBuffer instance');
      }
      
      if (keyBytes.byteLength !== 32) {
        throw new Error(`Invalid key length: ${keyBytes.byteLength} bytes, expected 32`);
      }
      
      console.log('Importing AES key, length:', keyBytes.byteLength);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      
      console.log('AES key imported successfully');
      return key;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to import AES key:', {
        error: errorMessage,
        keyBytesType: typeof keyBytes,
        keyBytesLength: keyBytes?.byteLength
      });
      throw new Error(`Failed to import AES key: ${errorMessage}`);
    }
  }

  // Encrypt data with AES-GCM
  static async encrypt(
    key: CryptoKey,
    data: string | Uint8Array,
    additionalData?: string
  ): Promise<{ cipher: Uint8Array; nonce: Uint8Array }> {
    const plaintext = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;
    
    const nonce = await this.randomBytes(12);
    const aad = additionalData ? new TextEncoder().encode(additionalData) : undefined;
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        additionalData: aad,
        tagLength: 128
      },
      key,
      plaintext.buffer
    );
    
    return {
      cipher: new Uint8Array(encrypted),
      nonce
    };
  }

  // Decrypt data with AES-GCM
  static async decrypt(
    key: CryptoKey,
    cipher: Uint8Array,
    nonce: Uint8Array,
    additionalData?: string
  ): Promise<string> {
    try {
      if (!key || !cipher || !nonce) {
        throw new Error('Missing required parameters for decryption');
      }
      
      if (!(cipher instanceof Uint8Array) || !(nonce instanceof Uint8Array)) {
        throw new Error('Cipher and nonce must be Uint8Array instances');
      }
      
      if (nonce.length !== 12) {
        throw new Error(`Invalid nonce length: ${nonce.length}, expected 12`);
      }
      
      console.log('Decrypting with params:', {
        keyType: key.type,
        keyAlgorithm: key.algorithm,
        cipherLength: cipher.length,
        nonceLength: nonce.length,
        additionalData
      });
      
      const aad = additionalData ? new TextEncoder().encode(additionalData) : undefined;
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          additionalData: aad,
          tagLength: 128
        },
        key,
        cipher.buffer
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error: any) {
      console.error('Decryption failed:', {
        error: error,
        errorMessage: error?.message,
        errorName: error?.name,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorString: String(error),
        keyType: key?.type,
        cipherLength: cipher?.length,
        nonceLength: nonce?.length,
        additionalData
      });
      
      const errorMessage = error?.message || error?.toString() || 'Unknown decryption error';
      throw new Error(`Decryption failed: ${errorMessage}`);
    }
  }

  // Derive key from password using PBKDF2 (fallback to Argon2 later)
  static async deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
      }
      
      if (!salt || !(salt instanceof Uint8Array)) {
        throw new Error('Salt must be a Uint8Array instance');
      }
      
      if (salt.length < 8) {
        throw new Error(`Salt too short: ${salt.length} bytes, minimum 8 required`);
      }
      
      console.log('Deriving key with params:', {
        passwordLength: password.length,
        saltLength: salt.length,
        iterations
      });
      
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt.buffer,
          iterations: iterations,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      console.log('Key derivation successful');
      return derivedKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Key derivation failed:', {
        error: errorMessage,
        passwordLength: password?.length,
        saltLength: salt?.length,
        iterations
      });
      throw new Error(`Key derivation failed: ${errorMessage}`);
    }
  }

  // Convert Uint8Array to base64
  static toBase64(bytes: Uint8Array): string {
    try {
      return btoa(String.fromCharCode(...bytes));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error encoding to base64:', error);
      throw new Error(`Failed to encode data: ${errorMessage}`);
    }
  }

  // Verify password by attempting to decrypt the password verifier
  static async verifyPassword(
    password: string,
    salt: Uint8Array,
    verifier: Uint8Array,
    verifierNonce: Uint8Array,
    kdfParams: any
  ): Promise<boolean> {
    try {
      console.log('🔐 Verifying password...');
      
      // Derive key from password and salt
      const iterations = kdfParams?.iterations || 100000;
      const derivedKey = await this.deriveKey(password, salt, iterations);
      
      // Try to decrypt the verifier
      const decryptedVerifier = await this.decryptToBytes(
        derivedKey,
        verifier,
        verifierNonce,
        'password_verifier'
      );
      
      // Convert to string and check if it matches expected format
      const verifierText = new TextDecoder().decode(decryptedVerifier);
      console.log('🔐 Password verifier decrypted successfully');
      
      // For now, if decryption succeeds, consider password valid
      // In a more robust implementation, you might check against a known value
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('🔐 Password verification failed:', errorMessage);
      return false;
    }
  }

  // Convert base64 to Uint8Array
  static fromBase64(base64: string): Uint8Array {
    try {
      if (!base64 || typeof base64 !== 'string') {
        throw new Error('Invalid input: base64 must be a non-empty string');
      }
      
      // Check for suspicious empty object patterns
      if (base64 === '{}' || base64 === '[]' || base64 === 'null') {
        throw new Error(`Input appears to be a JSON string: "${base64}"`);
      }
      
      // Handle hex strings with escape sequences (from database)
      if (base64.startsWith('\\x')) {
        const hexString = base64.replace(/\\x/g, '');
        if (hexString.length % 2 !== 0) {
          throw new Error('Invalid hex string length');
        }
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          const byte = parseInt(hexString.substr(i, 2), 16);
          if (isNaN(byte)) {
            throw new Error(`Invalid hex character at position ${i}`);
          }
          bytes[i / 2] = byte;
        }
        return bytes;
      }
      
      // Handle regular base64
      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      } catch (base64Error: any) {
        // If atob fails, try to handle as hex string
        if (/^[0-9a-fA-F]+$/.test(base64)) {
          console.log('Base64 decode failed, trying as hex string');
          if (base64.length % 2 !== 0) {
            throw new Error('Invalid hex string length');
          }
          const bytes = new Uint8Array(base64.length / 2);
          for (let i = 0; i < base64.length; i += 2) {
            const byte = parseInt(base64.substr(i, 2), 16);
            if (isNaN(byte)) {
              throw new Error(`Invalid hex character at position ${i}`);
            }
            bytes[i / 2] = byte;
          }
          return bytes;
        }
        
        // Provide detailed error information
        console.error('Failed to decode as base64 or hex:', {
          input: base64.substring(0, 100), // Show first 100 chars
          inputLength: base64.length,
          base64Error: base64Error.message,
          inputType: typeof base64,
          inputConstructor: (base64 as any)?.constructor?.name
        });
        throw new Error(`Failed to decode data: not valid base64 or hex. Input length: ${base64.length}, error: ${base64Error.message}`);
      }
    } catch (error: any) {
      console.error('Error decoding base64/hex:', { 
        input: base64 ? base64.substring(0, 100) : 'undefined', // Show first 100 chars
        inputType: typeof base64, 
        inputLength: base64?.length,
        inputConstructor: (base64 as any)?.constructor?.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to decode data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Decrypt and return raw bytes (no UTF-8 decoding)
  static async decryptToBytes(
    key: CryptoKey,
    cipher: Uint8Array,
    nonce: Uint8Array,
    additionalData?: string
  ): Promise<Uint8Array> {
    try {
      if (!key || !cipher || !nonce) {
        throw new Error('Missing required parameters for decryption');
      }
      if (!(cipher instanceof Uint8Array) || !(nonce instanceof Uint8Array)) {
        throw new Error('Cipher and nonce must be Uint8Array instances');
      }
      if (nonce.length !== 12) {
        throw new Error(`Invalid nonce length: ${nonce.length}, expected 12`);
      }

      const aad = additionalData ? new TextEncoder().encode(additionalData) : undefined;
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          additionalData: aad,
          tagLength: 128
        },
        key,
        cipher.buffer
      );

      return new Uint8Array(decrypted);
    } catch (error: any) {
      console.error('Decryption (bytes) failed:', {
        error: error,
        errorMessage: error?.message,
        errorName: error?.name,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorString: String(error),
        keyType: (key as any)?.type,
        cipherLength: (cipher as any)?.length,
        nonceLength: (nonce as any)?.length,
        additionalData,
        // Additional debugging info
        keyUsages: (key as any)?.usages,
        keyAlgorithm: (key as any)?.algorithm,
        cipherFirstBytes: cipher ? Array.from(cipher.slice(0, 8)) : 'N/A',
        nonceFirstBytes: nonce ? Array.from(nonce.slice(0, 4)) : 'N/A'
      });
      
      // Handle specific Web Crypto API errors
      if (error?.name === 'OperationError') {
        console.error('❌ Web Crypto OperationError - likely authentication tag mismatch');
        throw new Error('Decryption failed: Authentication tag mismatch - wrong password or corrupted data');
      } else if (error?.name === 'InvalidAccessError') {
        console.error('❌ Web Crypto InvalidAccessError - key not suitable for decryption');
        throw new Error('Decryption failed: Key not suitable for decryption');
      } else if (error?.name === 'NotSupportedError') {
        console.error('❌ Web Crypto NotSupportedError - algorithm not supported');
        throw new Error('Decryption failed: Algorithm not supported');
      }
      
      const errorMessage = error?.message || error?.toString() || 'Unknown decryption error';
      throw new Error(`Decryption failed: ${errorMessage}`);
    }
  }
}
