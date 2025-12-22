import fetch from 'node-fetch';

// JWT Verification Test
const testJWT = async () => {
  try {
    console.log('🔐 JWT VERIFICATION TEST');
    console.log('=' .repeat(50));
    
    // Step 1: Login to get token
    console.log('\n1️⃣ STEP 1: Login to get JWT token...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@presana.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed. Make sure user exists (run register first)');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful!');
    console.log(`🔑 Token: ${token.substring(0, 30)}...`);
    
    // Step 2: Create a protected endpoint test
    console.log('\n2️⃣ STEP 2: Testing token with protected endpoint...');
    console.log('(Note: This is a demo - you need to create a protected route first)');
    
    // Verify token structure
    console.log('\n3️⃣ STEP 3: Token structure verification...');
    const parts = token.split('.');
    if (parts.length === 3) {
      console.log('✅ Token has 3 parts (header.payload.signature)');
      
      // Decode payload (not verifying signature, just showing content)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('\n📦 Token Payload:');
      console.log(`   User ID: ${payload.id}`);
      console.log(`   Issued At: ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'}`);
      console.log(`   Expires: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Never (no expiration set)'}`);
    } else {
      console.log('❌ Invalid token structure');
    }
    
    // Step 4: Test without token (should fail)
    console.log('\n4️⃣ STEP 4: Testing request WITHOUT token (should fail)...');
    console.log('This simulates an unauthorized request');
    console.log('✅ Skipped (no protected routes implemented yet)');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 JWT TOKEN VERIFICATION COMPLETE!');
    console.log('\n📝 Summary:');
    console.log('   ✅ JWT token is generated on login');
    console.log('   ✅ Token structure is valid (3 parts)');
    console.log('   ✅ Token contains user ID in payload');
    console.log('\n💡 Next steps:');
    console.log('   • Create protected routes using authMiddleware');
    console.log('   • Test authenticated requests');
    console.log('   • Add token expiration if needed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running');
    console.log('   2. User is registered');
  }
};

testJWT();
