"use client";

import { useState, useEffect, useCallback } from 'react';
import { CryptoUtils } from '@/lib/crypto-utils';

interface UserProfile {
  email: string;
  name: string;
  dob?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
}

interface UserData {
  userId: string;
  username: string;
  sindhi_name?: string; // Add optional sindhi_name field
  profile: UserProfile;
  passwordSalt: string;
  passwordVerifier: string;
  profileCipher: string;
  profileNonce: string;
  profileAad: string;
  masterKeyCipher: string;
  masterKeyNonce: string;
  kdfParams: any;
}

// Local helper to validate fields expected to be base64 strings
function validateBase64Field(fieldName: string, value: unknown): string {
  if (value === null || value === undefined) {
    throw new Error(`Field ${fieldName} is missing or empty`);
  }

  if (typeof value !== 'string') {
    const ctor = (value as any)?.constructor?.name || typeof value;
    throw new Error(`Field ${fieldName} must be a string, got ${typeof value} (${ctor})`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`Field ${fieldName} cannot be empty`);
  }

  // Catch common bad payloads early
  if (trimmed === '{}' || trimmed === '[]' || trimmed === 'null') {
    throw new Error(`Field ${fieldName} contains suspicious value: "${trimmed}"`);
  }

  // Warn (do not block) if it doesn't look like base64
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed)) {
    console.warn(`Field ${fieldName} doesn't look like base64:`, trimmed.substring(0, 50));
  }

  return trimmed;
}

export function useE2EEAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('e2ee_token');
    const userData = localStorage.getItem('e2ee_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });
        
        // Note: Master key is not persisted across sessions for security
        // User will need to re-enter password to decrypt data
        console.log('Session restored, but master key needs to be re-derived');
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('e2ee_token');
        localStorage.removeItem('e2ee_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signup = useCallback(async (
    username: string,
    password: string,
    profile: UserProfile
  ) => {
    try {
      // Generate salt and derive key
      const salt = await CryptoUtils.randomBytes(16);
      const derivedKey = await CryptoUtils.deriveKey(password, salt);
      
      // Generate master key for encrypting user data
      const masterKeyBytes = await CryptoUtils.randomBytes(32);
      const masterKey = await CryptoUtils.importAesKey(masterKeyBytes.buffer as ArrayBuffer);
      
      // Encrypt profile
      const profileData = new TextEncoder().encode(JSON.stringify(profile));
      const { cipher: profileCipher, nonce: profileNonce } = await CryptoUtils.encrypt(
        masterKey,
        profileData,
        'profile:v1'
      );
      
      // Encrypt master key with derived key
      const { cipher: masterKeyCipher, nonce: masterKeyNonce } = await CryptoUtils.encrypt(
        derivedKey,
        masterKeyBytes,
        'master_key:v1'
      );
      
      // Create password verifier (simplified - in production use proper SRP/OPAQUE)
      const verifierData = new TextEncoder().encode('verifier');
      const verifier = await CryptoUtils.encrypt(derivedKey, verifierData, 'password_verifier');
      
      const encryptedData = {
        passwordSalt: CryptoUtils.toBase64(salt),
        passwordVerifier: CryptoUtils.toBase64(verifier.cipher),
        passwordVerifierNonce: CryptoUtils.toBase64(verifier.nonce),
        profileCipher: CryptoUtils.toBase64(profileCipher),
        profileNonce: CryptoUtils.toBase64(profileNonce),
        profileAad: 'profile:v1',
        masterKeyCipher: CryptoUtils.toBase64(masterKeyCipher),
        masterKeyNonce: CryptoUtils.toBase64(masterKeyNonce),
        kdfParams: { iterations: 100000, hash: 'SHA-256' }
      };
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          username,
          password,
          profile,
          encryptedData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      
      const result = await response.json();
      
      // Store master key in memory for this session
      setMasterKey(masterKey);
      
      // Set auth state to indicate signup is complete but needs Sindhi name
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
      
      // Return result with redirect info
      return {
        ...result,
        needsSindhiName: true,
        userId: result.userId
      };
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      console.log('🔐 Starting login process for username:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const result = await response.json();
      console.log('✅ Login API response received');
      
      // Extract user data from response
      const { userData, token } = result;
      
      // Verify password by deriving key
      console.log('🔑 Deriving key from password...');
      console.log('📝 Step 1: Decoding passwordSalt...');
      
      const validatedPasswordSalt = validateBase64Field('passwordSalt', userData.passwordSalt);
      console.log('  Input:', { 
        value: validatedPasswordSalt.substring(0, 50) + '...', 
        length: validatedPasswordSalt.length,
        type: typeof validatedPasswordSalt 
      });
      
      const salt = CryptoUtils.fromBase64(validatedPasswordSalt);
      console.log('  ✅ Success, decoded length:', salt.length);
      
      console.log('📝 Step 2: Deriving key from password and salt...');
      const iterations = (userData?.kdfParams?.iterations as number) || 100000;
      const derivedKey = await CryptoUtils.deriveKey(password, salt, iterations);
      console.log('  ✅ Success, key derived');
      
      console.log('🔄 Step 3: Attempting master key decryption...');
      
      // First, decrypt the master key using the derived key
      try {
        const validatedMasterKeyCipher = validateBase64Field('masterKeyCipher', userData.masterKeyCipher);
        const validatedMasterKeyNonce = validateBase64Field('masterKeyNonce', userData.masterKeyNonce);
        const masterKeyCipher = CryptoUtils.fromBase64(validatedMasterKeyCipher);
        const masterKeyNonce = CryptoUtils.fromBase64(validatedMasterKeyNonce);
        
        const masterKeyBytesArray = await CryptoUtils.decryptToBytes(
          derivedKey,
          masterKeyCipher,
          masterKeyNonce,
          'master_key:v1'
        );
        
        console.log('✅ Master key decrypted successfully');
        
        // Ensure the master key is exactly 32 bytes
        if (masterKeyBytesArray.length !== 32) {
          console.warn(`Master key length mismatch: ${masterKeyBytesArray.length} bytes, expected 32`);
          throw new Error('Decrypted master key has invalid length');
        }
        
        const masterKey = await CryptoUtils.importAesKey(
          masterKeyBytesArray.buffer as ArrayBuffer
        );
        
        console.log('✅ Master key imported successfully');
        
        // Now decrypt the profile using the master key
        console.log('🔄 Decrypting profile with master key...');
        const validatedProfileCipher = validateBase64Field('profileCipher', userData.profileCipher);
        const validatedProfileNonce = validateBase64Field('profileNonce', userData.profileNonce);
        const profileCipher = CryptoUtils.fromBase64(validatedProfileCipher);
        const profileNonce = CryptoUtils.fromBase64(validatedProfileNonce);
        
        const profileData = await CryptoUtils.decrypt(
          masterKey,
          profileCipher,
          profileNonce,
          userData.profileAad
        );
        
        const profile = JSON.parse(profileData);
        console.log('✅ Profile decrypted successfully');
        
        // Store session data
        localStorage.setItem('e2ee_token', token);
        localStorage.setItem('e2ee_user', JSON.stringify({
          ...userData,
          profile
        }));
        
        setMasterKey(masterKey);
        setAuthState({
          isAuthenticated: true,
          user: { ...userData, profile },
          token: token,
          isLoading: false
        });
        
        return result;
        
      } catch (masterKeyError) {
        console.error('❌ Master key decryption failed:', (masterKeyError as Error).message);
        
        // Fallback: try to decrypt profile directly with derived key (for old accounts)
        console.log('🔄 Falling back to direct profile decryption...');
        try {
          const validatedProfileCipher = validateBase64Field('profileCipher', userData.profileCipher);
          const validatedProfileNonce = validateBase64Field('profileNonce', userData.profileNonce);
          const profileCipher = CryptoUtils.fromBase64(validatedProfileCipher);
          const profileNonce = CryptoUtils.fromBase64(validatedProfileNonce);
          
          const profileData = await CryptoUtils.decrypt(
            derivedKey,
            profileCipher,
            profileNonce,
            userData.profileAad
          );
          
          const profile = JSON.parse(profileData);
          console.log('✅ Fallback profile decryption successful');
          
          // Store session data
          localStorage.setItem('e2ee_token', token);
          localStorage.setItem('e2ee_user', JSON.stringify({
            ...userData,
            profile
          }));
          
          setAuthState({
            isAuthenticated: true,
            user: { ...userData, profile },
            token: token,
            isLoading: false
          });
          
          return result;
          
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', (fallbackError as Error).message);
          throw new Error('Invalid password - unable to decrypt user data');
        }
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('e2ee_token');
    localStorage.removeItem('e2ee_user');
    setMasterKey(null);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
  }, []);

  return {
    ...authState,
    masterKey,
    signup,
    login,
    logout
  };
}
