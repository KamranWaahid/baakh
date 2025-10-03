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
      
      const response = await fetch('/api/auth/signup/', {
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
      
      return result;
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login/', {
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
      
      // Decrypt master key using password
      console.log('Received userData:', {
        passwordSalt: result.userData.passwordSalt,
        passwordSaltLength: result.userData.passwordSalt?.length,
        masterKeyCipher: result.userData.masterKeyCipher,
        masterKeyCipherLength: result.userData.masterKeyCipher?.length,
        masterKeyNonce: result.userData.masterKeyNonce,
        masterKeyNonceLength: result.userData.masterKeyNonce?.length
      });
      
      console.log('Attempting to decode passwordSalt:', result.userData.passwordSalt);
      const salt = CryptoUtils.fromBase64(result.userData.passwordSalt);
      const derivedKey = await CryptoUtils.deriveKey(password, salt);
      
      const masterKeyCipher = CryptoUtils.fromBase64(result.userData.masterKeyCipher);
      const masterKeyNonce = CryptoUtils.fromBase64(result.userData.masterKeyNonce);
      
      const masterKeyBytesString = await CryptoUtils.decrypt(
        derivedKey,
        masterKeyCipher,
        masterKeyNonce,
        'master_key:v1'
      );
      
      console.log('Decrypted master key string:', {
        length: masterKeyBytesString.length,
        value: masterKeyBytesString.substring(0, 50) + '...',
        isBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(masterKeyBytesString)
      });
      
      // The decrypted string should be the original 32-byte master key
      // Convert it back to Uint8Array using fromBase64 if it's base64 encoded
      let masterKeyBytes: Uint8Array;
      try {
        // Try to decode as base64 first
        masterKeyBytes = CryptoUtils.fromBase64(masterKeyBytesString);
        console.log('Successfully decoded as base64, length:', masterKeyBytes.length);
      } catch (error) {
        console.log('Not base64, treating as raw string, error:', error);
        // If not base64, treat as raw string and encode to bytes
        masterKeyBytes = new TextEncoder().encode(masterKeyBytesString);
        console.log('Encoded as text, length:', masterKeyBytes.length);
      }
      
      console.log('Final master key bytes length:', masterKeyBytes.length);
      
      const masterKey = await CryptoUtils.importAesKey(
        masterKeyBytes.buffer as ArrayBuffer
      );
      
      // Decrypt profile
      const profileCipher = CryptoUtils.fromBase64(result.userData.profileCipher);
      const profileNonce = CryptoUtils.fromBase64(result.userData.profileNonce);
      
      const profileData = await CryptoUtils.decrypt(
        masterKey,
        profileCipher,
        profileNonce,
        result.userData.profileAad
      );
      
      const profile = JSON.parse(profileData);
      
      // Store session data
      localStorage.setItem('e2ee_token', result.token);
      localStorage.setItem('e2ee_user', JSON.stringify({
        ...result.userData,
        profile
      }));
      
      setMasterKey(masterKey);
      setAuthState({
        isAuthenticated: true,
        user: { ...result.userData, profile },
        token: result.token,
        isLoading: false
      });
      
      return result;
      
    } catch (error) {
      console.error('Login error:', error);
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

  const reAuthenticate = useCallback(async (password: string) => {
    if (!authState.user) {
      throw new Error('No user data available');
    }
    
    try {
      // Re-derive the key from the stored salt
      const salt = CryptoUtils.fromBase64(authState.user.passwordSalt);
      const derivedKey = await CryptoUtils.deriveKey(password, salt);
      
      // Decrypt the master key
      const masterKeyCipher = CryptoUtils.fromBase64(authState.user.masterKeyCipher);
      const masterKeyNonce = CryptoUtils.fromBase64(authState.user.masterKeyNonce);
      
      const masterKeyBytesString = await CryptoUtils.decrypt(
        derivedKey,
        masterKeyCipher,
        masterKeyNonce,
        'master_key:v1'
      );
      
      console.log('ReAuth - Decrypted master key string:', {
        length: masterKeyBytesString.length,
        value: masterKeyBytesString.substring(0, 50) + '...',
        isBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(masterKeyBytesString)
      });
      
      // The decrypted string should be the original 32-byte master key
      // Convert it back to Uint8Array using fromBase64 if it's base64 encoded
      let masterKeyBytes: Uint8Array;
      try {
        // Try to decode as base64 first
        masterKeyBytes = CryptoUtils.fromBase64(masterKeyBytesString);
        console.log('ReAuth - Successfully decoded as base64, length:', masterKeyBytes.length);
      } catch (error) {
        console.log('ReAuth - Not base64, treating as raw string, error:', error);
        // If not base64, treat as raw string and encode to bytes
        masterKeyBytes = new TextEncoder().encode(masterKeyBytesString);
        console.log('ReAuth - Encoded as text, length:', masterKeyBytes.length);
      }
      
      console.log('ReAuth - Final master key bytes length:', masterKeyBytes.length);
      
      const masterKey = await CryptoUtils.importAesKey(
        masterKeyBytes.buffer as ArrayBuffer
      );
      
      setMasterKey(masterKey);
      return true;
    } catch (error) {
      console.error('Re-authentication failed:', error);
      throw new Error('Invalid password');
    }
  }, [authState.user]);

  const createLike = useCallback(async (
    targetId: string,
    targetType: string,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!masterKey || !authState.token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const metadataStr = JSON.stringify(metadata);
      const { cipher, nonce } = await CryptoUtils.encrypt(
        masterKey,
        metadataStr,
        'like:v1'
      );
      
      const response = await fetch('/api/user/like/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          targetId,
          targetType,
          metadata: {
            cipher: CryptoUtils.toBase64(cipher),
            nonce: CryptoUtils.toBase64(nonce),
            aad: 'like:v1'
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create like');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Create like error:', error);
      throw error;
    }
  }, [masterKey, authState.token]);

  const createBookmark = useCallback(async (
    targetId: string,
    targetType: string,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!masterKey || !authState.token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const metadataStr = JSON.stringify(metadata);
      const { cipher, nonce } = await CryptoUtils.encrypt(
        masterKey,
        metadataStr,
        'bookmark:v1'
      );
      
      const response = await fetch('/api/user/bookmark/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          targetId,
          targetType,
          metadata: {
            cipher: CryptoUtils.toBase64(cipher),
            nonce: CryptoUtils.toBase64(nonce),
            aad: 'bookmark:v1'
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bookmark');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Create bookmark error:', error);
      throw error;
    }
  }, [masterKey, authState.token]);

  return {
    ...authState,
    masterKey,
    signup,
    login,
    logout,
    reAuthenticate,
    createLike,
    createBookmark
  };
}
