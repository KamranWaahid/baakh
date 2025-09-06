// Test client-side decoding logic
const testData = {
  passwordSalt: "SCbpbB7qMIqL0OQzJlO+Vw==",
  masterKeyCipher: "JQOeM2IxMi4xMDQ2Cg==",
  masterKeyNonce: "czEwNjk0NDI3NjE3"
};

console.log('=== Testing Client-Side Decoding ===');

// Simulate the client-side fromBase64 method
function fromBase64(base64) {
  try {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Invalid input: base64 must be a non-empty string');
    }
    
    if (base64.trim() === '') {
      throw new Error('Input string is empty or whitespace only');
    }
    
    // Handle regular base64
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (base64Error) {
      throw new Error(`Failed to decode base64: ${base64Error.message}`);
    }
  } catch (error) {
    console.error('Error decoding base64:', { 
      input: base64 ? base64.substring(0, 100) : 'undefined',
      inputType: typeof base64, 
      inputLength: base64?.length,
      error: error.message 
    });
    throw new Error(`Failed to decode data: ${error.message}`);
  }
}

// Test each field
for (const [field, value] of Object.entries(testData)) {
  console.log(`\nTesting ${field}:`);
  console.log('  Input:', value);
  console.log('  Input length:', value.length);
  
  try {
    const decoded = fromBase64(value);
    console.log('  ✅ Success, decoded length:', decoded.length);
    console.log('  Decoded bytes:', Array.from(decoded.slice(0, 10)));
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
  }
}
