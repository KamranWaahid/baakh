// Test the login API directly
async function testLoginAPI() {
  try {
    console.log('=== Testing Login API Directly ===');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'user',
        password: 'password'
      })
    });
    
    if (!response.ok) {
      console.log('❌ API call failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ API call successful');
    
    console.log('\n📥 Response structure:');
    console.log('Success:', result.success);
    console.log('Token exists:', !!result.token);
    console.log('User data keys:', Object.keys(result.userData || {}));
    
    if (result.userData) {
      console.log('\n📊 User data details:');
      for (const [key, value] of Object.entries(result.userData)) {
        if (typeof value === 'string') {
          console.log(`  ${key}: "${value}" (${value.length} chars)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
    }
    
    // Test if the data can be parsed as JSON
    console.log('\n🔍 Testing JSON serialization...');
    try {
      const jsonString = JSON.stringify(result);
      console.log('✅ JSON serialization successful, length:', jsonString.length);
      
      // Test deserialization
      const parsed = JSON.parse(jsonString);
      console.log('✅ JSON deserialization successful');
      
      // Check if the data structure is preserved
      if (parsed.userData) {
        console.log('✅ User data structure preserved');
        for (const [key, value] of Object.entries(parsed.userData)) {
          if (typeof value === 'string') {
            console.log(`  ${key}: "${value}" (${value.length} chars)`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      }
    } catch (error) {
      console.log('❌ JSON serialization/deserialization failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginAPI().catch(console.error);
