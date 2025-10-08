// Frontend debug script to test exactly what the AdminDashboardClean.tsx is doing
async function debugFrontendReferralUpdate() {
  console.log('=== Frontend Referral Update Debug ===');
  
  // Simulate what the AdminDashboardClean.tsx component does
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.error('❌ No authentication token found');
    console.log('Please log in to admin panel first');
    return;
  }
  
  // We need a referral ID - let's fetch referrals first
  try {
    console.log('Fetching referrals from API...');
    const referralsResponse = await fetch('http://localhost:5000/api/referrals');
    
    if (!referralsResponse.ok) {
      console.error('❌ Failed to fetch referrals:', referralsResponse.status);
      return;
    }
    
    const referrals = await referralsResponse.json();
    console.log('Found referrals:', referrals.length);
    
    if (referrals.length === 0) {
      console.log('No referrals in database to test with');
      return;
    }
    
    // Use the first pending referral
    const pendingReferrals = referrals.filter(r => r.status === 'pending');
    if (pendingReferrals.length === 0) {
      console.log('No pending referrals to test with');
      return;
    }
    
    const referral = pendingReferrals[0];
    const referralId = referral.id;
    console.log('Testing with referral ID:', referralId, 'current status:', referral.status);
    
    // Now try to update it - exactly as AdminDashboardClean.tsx does
    console.log('Calling update API...');
    const response = await fetch(`http://localhost:5000/api/admin/referrals/${referralId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Try to get response data
    let result;
    try {
      result = await response.json();
      console.log('Response data:', result);
    } catch (parseError) {
      const text = await response.text();
      console.log('Response text:', text);
      result = { error: 'Could not parse JSON', text };
    }
    
    if (response.ok) {
      console.log('✅ SUCCESS: Referral update completed');
      console.log('Message:', result.message);
    } else {
      console.log('❌ ERROR: Referral update failed');
      console.log('Status:', response.status);
      if (result.error) {
        console.log('Error message:', result.error);
      }
    }
    
  } catch (err) {
    console.error('❌ Network error:', err);
    console.log('This could be due to:');
    console.log('- Server not running');
    console.log('- Network connectivity issues');
    console.log('- CORS policy');
  }
}

// Run the function
debugFrontendReferralUpdate();