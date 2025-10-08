// Debug script for referral status updates
const referralId = 1; // Replace with an actual referral ID from your database
const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with a valid JWT token

async function testReferralUpdate() {
  console.log('Testing referral status update...');
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/referrals/${referralId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const result = await response.json();
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Referral update successful!');
    } else {
      console.log('❌ Referral update failed!');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
  }
}

testReferralUpdate();