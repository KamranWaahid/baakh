// Test script for views tracking API
const testViewsAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing views tracking API...');
  
  try {
    // Test tracking a view
    console.log('1. Testing view tracking...');
    const trackResponse = await fetch(`${baseUrl}/api/views/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId: 1,
        contentType: 'couplet',
        sessionId: 'test-session-123'
      })
    });
    
    const trackResult = await trackResponse.json();
    console.log('Track result:', trackResult);
    
    // Test getting view count
    console.log('2. Testing view count retrieval...');
    const countResponse = await fetch(`${baseUrl}/api/views/track?contentId=1&contentType=couplet`);
    const countResult = await countResponse.json();
    console.log('View count result:', countResult);
    
    // Test couplets API
    console.log('3. Testing couplets API...');
    const coupletsResponse = await fetch(`${baseUrl}/api/couplets?limit=3&lang=en&standalone=1`);
    const coupletsResult = await coupletsResponse.json();
    console.log('Couplets result:', coupletsResult.couplets?.length || 0, 'couplets found');
    
    if (coupletsResult.couplets && coupletsResult.couplets.length > 0) {
      console.log('First couplet poet name:', coupletsResult.couplets[0].poet.name);
      console.log('First couplet views:', coupletsResult.couplets[0].views);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testViewsAPI();
