import fetch from 'node-fetch';

// Test LOGIN endpoint
const testLogin = async () => {
  try {
    console.log('🧪 Testing LOGIN API...');
    console.log('Endpoint: http://localhost:5000/api/auth/login');
    console.log('Method: POST');
    console.log('Body:', JSON.stringify({ email: 'test@presana.com', password: 'password123' }, null, 2));
    console.log('');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@presana.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Body:', JSON.stringify(data, null, 2));
   
    if (response.ok) {
      console.log('\n🎉 LOGIN API TEST PASSED!');
      
      if (data.token) {
        console.log('\n🔑 JWT Token received:', data.token.substring(0, 20) + '...');
      }
      
      if (data.user) {
        console.log('\n👤 User Info:');
        console.log(`   ID: ${data.user._id}`);
        console.log(`   Name: ${data.user.name}`);
        console.log(`   Email: ${data.user.email}`);
      }
    } else {
      console.log('\n⚠️  Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running on port 5000');
    console.log('   2. User "test@presana.com" exists (register first)');
    console.log('   3. Password is correct');
  }
};

testLogin();
