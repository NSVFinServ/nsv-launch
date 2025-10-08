// Solution for referral status update issue
console.log("=== Referral Update Fix ===");

// The issue is likely an authentication token problem
// Here's how to fix it:

console.log("1. Log out of the admin panel");
console.log("2. Log back in to get a fresh token");
console.log("3. Try updating the referral status again");

// If that doesn't work, try this browser console test:
console.log("\nTo test in browser console, run this code:");

console.log(`
// Test referral update with fresh token
async function testReferralUpdate() {
  // Get fresh token from localStorage
  const token = localStorage.getItem('token');
  console.log('Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('Please log in first');
    return;
  }
  
  // Get referrals
  const res = await fetch('http://localhost:5000/api/referrals');
  const referrals = await res.json();
  
  // Find a pending referral
  const pending = referrals.filter(r => r.status === 'pending');
  if (pending.length === 0) {
    console.log('No pending referrals found');
    return;
  }
  
  const referralId = pending[0].id;
  console.log('Updating referral ID:', referralId);
  
  // Update referral status
  const updateRes = await fetch(\`http://localhost:5000/api/admin/referrals/\${referralId}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ status: 'accepted' })
  });
  
  console.log('Update response status:', updateRes.status);
  
  if (updateRes.ok) {
    const result = await updateRes.json();
    console.log('Success:', result);
  } else {
    const error = await updateRes.json();
    console.log('Error:', error);
  }
}

// Run the test
testReferralUpdate();
`);

console.log("\nIf the browser test works but the UI doesn't, the issue is in the React component.");
console.log("The most likely fix is to ensure the token is fresh when making the API call.");