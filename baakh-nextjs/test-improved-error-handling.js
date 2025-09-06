// Test the improved error handling and validation
console.log('=== Testing Improved Error Handling ===\n');

// Simulate the improved fromBase64 method
function fromBase64(base64) {
  try {
    // Enhanced input validation
    if (!base64) {
      throw new Error('Input is null, undefined, or empty');
    }
    
    if (typeof base64 !== 'string') {
      throw new Error(`Expected string input, got ${typeof base64} (${base64?.constructor?.name || 'unknown'})`);
    }
    
    if (base64.trim() === '') {
      throw new Error('Input string is empty or contains only whitespace');
    }
    
    // Check for suspicious empty object patterns
    if (base64 === '{}' || base64 === '[]' || base64 === 'null') {
      throw new Error(`Input appears to be a JSON string: "${base64}"`);
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
      throw new Error(`Base64 decode failed: ${base64Error.message}`);
    }
  } catch (error) {
    console.error('❌ Error in fromBase64:', { 
      input: base64 ? base64.substring(0, 100) : 'undefined',
      inputType: typeof base64, 
      inputLength: base64?.length,
      error: error.message 
    });
    throw new Error(`Failed to decode data: ${error.message}`);
  }
}

// Simulate the validation function
function validateBase64Field(fieldName, value) {
  if (!value) {
    throw new Error(`Field ${fieldName} is missing or empty`);
  }
  
  if (typeof value !== 'string') {
    throw new Error(`Field ${fieldName} must be a string, got ${typeof value}`);
  }
  
  if (value.trim() === '') {
    throw new Error(`Field ${fieldName} cannot be empty`);
  }
  
  // Check for suspicious patterns
  if (value === '{}' || value === '[]' || value === 'null') {
    throw new Error(`Field ${fieldName} contains suspicious value: "${value}"`);
  }
  
  // Check if it looks like base64
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    console.warn(`⚠️ Field ${fieldName} doesn't look like base64:`, value.substring(0, 50));
  }
  
  return value;
}

// Test cases
const testCases = [
  {
    name: 'Valid base64',
    input: 'SCbpbB7qMIqL0OQzJlO+Vw==',
    expected: 'success'
  },
  {
    name: 'Empty string',
    input: '',
    expected: 'error'
  },
  {
    name: 'Empty object string',
    input: '{}',
    expected: 'error'
  },
  {
    name: 'Null value',
    input: null,
    expected: 'error'
  },
  {
    name: 'Undefined value',
    input: undefined,
    expected: 'error'
  },
  {
    name: 'Number input',
    input: 123,
    expected: 'error'
  },
  {
    name: 'Object input',
    input: { data: 'test' },
    expected: 'error'
  },
  {
    name: 'Invalid base64',
    input: 'invalid-base64!@#',
    expected: 'error'
  }
];

console.log('🧪 Testing fromBase64 method:');
for (const testCase of testCases) {
  console.log(`\n📝 Test: ${testCase.name}`);
  console.log(`  Input: ${testCase.input}`);
  
  try {
    const result = fromBase64(testCase.input);
    if (testCase.expected === 'success') {
      console.log(`  ✅ Success, decoded length: ${result.length}`);
    } else {
      console.log(`  ❌ Expected error but got success`);
    }
  } catch (error) {
    if (testCase.expected === 'error') {
      console.log(`  ✅ Correctly caught error: ${error.message}`);
    } else {
      console.log(`  ❌ Unexpected error: ${error.message}`);
    }
  }
}

console.log('\n🧪 Testing validation function:');
const validationTests = [
  { field: 'passwordSalt', value: 'SCbpbB7qMIqL0OQzJlO+Vw==' },
  { field: 'passwordSalt', value: '{}' },
  { field: 'passwordSalt', value: null },
  { field: 'passwordSalt', value: 123 },
  { field: 'passwordSalt', value: '' }
];

for (const test of validationTests) {
  console.log(`\n📝 Validating ${test.field}:`);
  console.log(`  Value: ${test.value}`);
  
  try {
    const validated = validateBase64Field(test.field, test.value);
    console.log(`  ✅ Validation passed: ${validated.substring(0, 20)}...`);
  } catch (error) {
    console.log(`  ❌ Validation failed: ${error.message}`);
  }
}

console.log('\n🎯 Summary:');
console.log('The improved error handling now:');
console.log('✅ Catches invalid input types early');
console.log('✅ Detects suspicious patterns like "{}"');
console.log('✅ Provides detailed error messages');
console.log('✅ Validates data before processing');
console.log('✅ Logs comprehensive debugging information');
