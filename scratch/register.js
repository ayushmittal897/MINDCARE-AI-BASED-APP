fetch("http://127.0.0.1:8080/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "testuser3@example.com", password: "password123", name: "Test User 3" })
}).then(res => res.json()).then(console.log).catch(console.error);
