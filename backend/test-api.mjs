import fetch from 'node-fetch';

// Test REGISTER endpoint
const testRegister = async () => {
  try {
    console.log('🧪 Testing REGISTER API...');
    console.log('Endpoint: http://localhost:5000/api/auth/register');
    console.log('Method: POST');
    console.log('Body:', JSON.stringify({ name: 'Test User', email: 'test@presana.com', password: 'password123' }, null, 2));
    console.log('');

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@presana.com',
        password: 'password123'
      })
    });
    
    const data = await response.text();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Body:', data);
   
    if (response.ok) {
      console.log('\n🎉 REGISTER API TEST PASSED!');
    } else {
      console.log('\n⚠️  Got error response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the backend server is running on port 5000');
    console.log('Run: npx nodemon server.js');
  }
};

testRegister();
