// Authentication test script
async function testAuthentication() {
  console.log('=== Authentication Test ===');
  
  // Test 1: Try to access admin endpoint without token
  console.log('Test 1: Accessing admin endpoint without token...');
  try {
    const response = await fetch('http://localhost:5000/api/admin/referrals/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    
    console.log('Response status (no token):', response.status);
    if (response.status === 401) {
      console.log('✅ Correctly rejected request without token');
    } else {
      console.log('❌ Unexpected response:', response.status);
    }
  } catch (error) {
    console.log('Network error:', error.message);
  }
  
  // Test 2: Check if we have a valid token
  const token = localStorage.getItem('token');
  console.log('Token present:', !!token);
  
  if (token) {
    console.log('Token length:', token.length);
    
    // Test 3: Try to access admin endpoint with token
    console.log('Test 3: Accessing admin endpoint with token...');
    try {
      const response = await fetch('http://localhost:5000/api/admin/referrals/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      
      console.log('Response status (with token):', response.status);
      
      if (response.status === 404) {
        console.log('✅ Token is valid (got 404 for non-existent referral)');
      } else if (response.status === 403) {
        console.log('❌ Token is invalid or expired');
      } else {
        console.log('Response status:', response.status);
      }
      
      // Try to parse response
      try {
        const result = await response.json();
        console.log('Response data:', result);
      } catch (parseError) {
        console.log('Could not parse response');
      }
    } catch (error) {
      console.log('Network error:', error.message);
    }
  } else {
    console.log('❌ No token available for testing');
  }
}

// Run the test
testAuthentication();