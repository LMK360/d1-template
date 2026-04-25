export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ message: "Invalid JSON" }), { status: 400 });
    }

    // ✅ SIGNUP
    if (url.pathname === "/signup") {
      const { email, password } = body;

      if (!email || !password) {
        return new Response(JSON.stringify({ message: "Email and password required" }), { status: 400 });
      }

      try {
        await env.DB.prepare(
          "INSERT INTO users (email, password) VALUES (?, ?)"
        ).bind(email, password).run();

        return new Response(JSON.stringify({ message: "Signup successful" }), { status: 200 });

      } catch (err) {
        return new Response(JSON.stringify({ message: "User already exists" }), { status: 409 });
      }
    }

    // ✅ LOGIN
    if (url.pathname === "/login") {
      const { email, password } = body;

      const result = await env.DB.prepare(
        "SELECT * FROM users WHERE email = ?"
      ).bind(email).first();

      if (!result || result.password !== password) {
        return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
      }

      return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};
