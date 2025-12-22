// Test REGISTER endpoint
const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@presana.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('✅ REGISTER Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testRegister();
