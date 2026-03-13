import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

async function testBackend() {
  try {
    console.log("1. Testing Registration...");
    const regRes = await api.post('/auth/register', {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      emergencyContacts: [{ name: "Mom", phone: "1234567890" }]
    });
    console.log("Registered:", regRes.data.user.email);
    const token = regRes.data.token;
    
    console.log("\n2. Testing Profile Fetch...");
    const profileRes = await api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    console.log("Profile Data:", profileRes.data.name, profileRes.data.email);
    
    console.log("\n3. Testing SOS...");
    const sosRes = await api.post('/sos', {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log("SOS Response:", sosRes.data.message);
    
  } catch (error) {
    console.error("Test Failed:", error.response?.data || error.message);
  }
}

testBackend();
