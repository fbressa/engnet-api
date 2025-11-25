const API_URL = 'http://localhost:4000';

async function verifyDashboard() {
  try {
    console.log('1. Creating User...');
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    
    const createUserRes = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password
      })
    });

    if (!createUserRes.ok) {
        const text = await createUserRes.text();
        console.log('Create User failed:', createUserRes.status, text);
        // If conflict, try login directly
        if (createUserRes.status !== 409) return;
    } else {
        console.log('User created.');
    }

    console.log('2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('Login successful. Token obtained.');

    console.log('3. Fetching Dashboard Summary...');
    const dashboardRes = await fetch(`${API_URL}/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!dashboardRes.ok) {
      console.error('Dashboard fetch failed:', await dashboardRes.text());
      return;
    }

    const dashboardData = await dashboardRes.json();
    console.log('Dashboard Summary:', JSON.stringify(dashboardData, null, 2));

    console.log('✅ Dashboard Integration Verification Passed!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyDashboard();
