// Simple test script to verify referral update functionality

const fetch = require('node-fetch');

async function testReferralUpdate() {
  try {
    // Replace with a valid admin token from your application
    const token = 'YOUR_ADMIN_TOKEN_HERE';
    const referralId = 1; // Replace with an actual referral ID
    const newStatus = 'accepted';
    
    console.log('Testing referral update...');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Referral ID:', referralId);
    console.log('New Status:', newStatus);
    
    const response = await fetch(`http://localhost:5000/api/admin/referrals/${referralId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success:', result);
    } else {
      const error = await response.json().catch(() => ({}));
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testReferralUpdate();