// Detailed debug script for referral status updates
async function debugReferralUpdate() {
  console.log('=== Referral Update Debug Script ===');
  
  // You'll need to replace these with actual values
  const referralId = 1; // Replace with actual referral ID
  const token = 'YOUR_JWT_TOKEN'; // Replace with actual JWT token from localStorage
  
  console.log('Attempting to update referral ID:', referralId);
  console.log('Token present:', !!token);
  
  if (!token || token === 'YOUR_JWT_TOKEN') {
    console.log('❌ ERROR: Please provide a valid JWT token');
    console.log('   - Log in to the admin panel first');
    console.log('   - Check localStorage for the token');
    return;
  }
  
  try {
    console.log('Sending request to: http://localhost:5000/api/admin/referrals/' + referralId);
    
    const response = await fetch(`http://localhost:5000/api/admin/referrals/${referralId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    // Try to parse response
    let result;
    try {
      result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      const text = await response.text();
      console.log('Response text:', text);
      result = { error: 'Could not parse JSON', text };
    }
    
    if (response.ok) {
      console.log('✅ SUCCESS: Referral update completed');
    } else {
      console.log('❌ ERROR: Referral update failed');
      console.log('Status code:', response.status);
      console.log('Status text:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    console.log('This could be due to:');
    console.log('  - Server not running on port 5000');
    console.log('  - Network connectivity issues');
    console.log('  - CORS policy blocking the request');
  }
}

// Run the debug function
debugReferralUpdate();