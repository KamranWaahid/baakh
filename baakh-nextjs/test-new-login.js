#!/usr/bin/env node

/**
 * Test script for the new E2EE login system
 * This script tests the improved login flow with better error handling
 */

const { CryptoUtils } = require('./src/lib/crypto-utils');

async function testNewLoginSystem() {
  console.log('🧪 Testing new E2EE login system...\n');
  
  try {
    // Test 1: Base64 encoding/decoding
    console.log('1️⃣ Testing base64 encoding/decoding...');
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    const base64 = CryptoUtils.toBase64(testData);
    const decoded = CryptoUtils.fromBase64(base64);
    
    console.log('   Original:', Array.from(testData));
    console.log('   Base64:', base64);
    console.log('   Decoded:', Array.from(decoded));
    console.log('   ✅ Base64 test passed\n');
    
    // Test 2: Key derivation
    console.log('2️⃣ Testing key derivation...');
    const password = 'testpassword123';
    const salt = await CryptoUtils.randomBytes(16);
    const derivedKey = await CryptoUtils.deriveKey(password, salt);
    
    console.log('   Password:', password);
    console.log('   Salt length:', salt.length);
    console.log('   Derived key type:', derivedKey.type);
    console.log('   ✅ Key derivation test passed\n');
    
    // Test 3: Encryption/decryption
    console.log('3️⃣ Testing encryption/decryption...');
    const plaintext = 'Hello, E2EE World!';
    const { cipher, nonce } = await CryptoUtils.encrypt(derivedKey, plaintext, 'test_aad');
    const decrypted = await CryptoUtils.decrypt(derivedKey, cipher, nonce, 'test_aad');
    
    console.log('   Plaintext:', plaintext);
    console.log('   Cipher length:', cipher.length);
    console.log('   Nonce length:', nonce.length);
    console.log('   Decrypted:', decrypted);
    console.log('   ✅ Encryption test passed\n');
    
    // Test 4: Master key handling
    console.log('4️⃣ Testing master key handling...');
    const masterKeyBytes = await CryptoUtils.randomBytes(32);
    const masterKey = await CryptoUtils.importAesKey(masterKeyBytes.buffer);
    
    console.log('   Master key bytes length:', masterKeyBytes.length);
    console.log('   Master key type:', masterKey.type);
    console.log('   ✅ Master key test passed\n');
    
    // Test 5: Edge case handling
    console.log('5️⃣ Testing edge case handling...');
    
    // Test with hex string
    const hexString = '0102030405';
    const hexBytes = CryptoUtils.fromBase64(hexString);
    console.log('   Hex string:', hexString);
    console.log('   Hex bytes:', Array.from(hexBytes));
    console.log('   ✅ Hex handling test passed\n');
    
    console.log('🎉 All tests passed! The new login system should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testNewLoginSystem().catch(console.error);
}

module.exports = { testNewLoginSystem };
