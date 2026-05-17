async function run() {
  const loginUrl = 'http://localhost:3000/api/rest/auth/login';
  const customersUrl = 'http://localhost:3000/api/rest/crm/customers';

  try {
    console.log(`1. Logging in to ${loginUrl}...`);
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeCode: 'EMP001',
        password: 'password123',
      }),
    });

    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Token received:', token.substring(0, 30) + '...');

    console.log(`2. Hitting protected endpoint ${customersUrl}...`);
    const customersResponse = await fetch(customersUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Customers Status:', customersResponse.status);
    const customersData = await customersResponse.json();
    console.log('Customers Response:', JSON.stringify(customersData, null, 2).substring(0, 1000) + '...');
  } catch (error) {
    console.error('ERROR:', error);
  }
}

run();
