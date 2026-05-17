async function run() {
  const url = 'http://localhost:3000/api/rest/auth/login';
  console.log(`Sending POST to ${url} with lowercase 'emp001'...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeCode: 'emp001',
        password: 'password123',
      }),
    });

    console.log('STATUS:', response.status);
    const text = await response.text();
    console.log('RESPONSE:', text);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

run();
