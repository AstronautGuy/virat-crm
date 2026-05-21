async function run() {
  const url = "http://localhost:3000/api/rest/auth/login";
  console.log(`Sending invalid POST to ${url}...`);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeCode: "EMP001",
        password: "wrongpassword",
      }),
    });

    console.log("STATUS:", response.status);
    const body = await response.json();
    console.log("RESPONSE:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  }
}

run();
