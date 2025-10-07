// Test script for admin functionality
// Run this to test the new admin features

const testAdminFunctionality = async () => {
  const baseUrl = 'http://localhost:5000';
  
  // Test admin login
  console.log('Testing admin login...');
  const loginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@nsvfinserv.com',
      password: 'password'
    })
  });
  
  if (!loginResponse.ok) {
    console.error('Admin login failed');
    return;
  }
  
  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✓ Admin login successful');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test fetching eligibility submissions
  console.log('Testing eligibility submissions fetch...');
  const eligibilityResponse = await fetch(`${baseUrl}/api/admin/eligibility`, { headers });
  
  if (eligibilityResponse.ok) {
    const eligibilityData = await eligibilityResponse.json();
    console.log(`✓ Fetched ${eligibilityData.length} eligibility submissions`);
  } else {
    console.error('Failed to fetch eligibility submissions');
  }
  
  // Test fetching referrals
  console.log('Testing referrals fetch...');
  const referralsResponse = await fetch(`${baseUrl}/api/referrals`);
  
  if (referralsResponse.ok) {
    const referralsData = await referralsResponse.json();
    console.log(`✓ Fetched ${referralsData.length} referrals`);
  } else {
    console.error('Failed to fetch referrals');
  }
  
  // Test fetching loan applications
  console.log('Testing loan applications fetch...');
  const applicationsResponse = await fetch(`${baseUrl}/api/loan-applications`);
  
  if (applicationsResponse.ok) {
    const applicationsData = await applicationsResponse.json();
    console.log(`✓ Fetched ${applicationsData.length} loan applications`);
  } else {
    console.error('Failed to fetch loan applications');
  }
  
  console.log('All tests completed!');
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAdminFunctionality().catch(console.error);
} else {
  // Browser environment
  testAdminFunctionality().catch(console.error);
}

module.exports = { testAdminFunctionality };
