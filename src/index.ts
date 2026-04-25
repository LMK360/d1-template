export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 🌐 CORS headers (important for GitHub Pages)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 🧩 Handle preflight requests (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 🟢 STATUS ROUTE
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "online",
          message: "Backend ready to handle login/signup 🔐"
        }),
        {
          headers: {
            "content-type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // ❌ Only allow POST for auth routes
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Method Not Allowed" }),
        {
          status: 405,
          headers: { "content-type": "application/json", ...corsHeaders }
        }
      );
    }

    // 📦 Parse JSON body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ message: "Invalid JSON" }),
        {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders }
        }
      );
    }

    const { email, password } = body;

    // 🟡 SIGNUP
    if (url.pathname === "/signup") {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ message: "Email and password required" }),
          {
            status: 400,
            headers: { "content-type": "application/json", ...corsHeaders }
          }
        );
      }

      try {
        await env.DB.prepare(
          "INSERT INTO users (email, password) VALUES (?, ?)"
        )
          .bind(email, password)
          .run();

        return new Response(
          JSON.stringify({ message: "Signup successful 🔥" }),
          {
            headers: { "content-type": "application/json", ...corsHeaders }
          }
        );

      } catch (err) {
        return new Response(
          JSON.stringify({ message: "User already exists" }),
          {
            status: 409,
            headers: { "content-type": "application/json", ...corsHeaders }
          }
        );
      }
    }

    // 🔵 LOGIN
    if (url.pathname === "/login") {
      const result = await env.DB.prepare(
        "SELECT * FROM users WHERE email = ?"
      )
        .bind(email)
        .first();

      if (!result || result.password !== password) {
        return new Response(
          JSON.stringify({ message: "Invalid credentials" }),
          {
            status: 401,
            headers: { "content-type": "application/json", ...corsHeaders }
          }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Login successful 🔓",
          user: email
        }),
        {
          headers: { "content-type": "application/json", ...corsHeaders }
        }
      );
    }

    // ❓ NOT FOUND
    return new Response(
      JSON.stringify({ message: "Route not found" }),
      {
        status: 404,
        headers: { "content-type": "application/json", ...corsHeaders }
      }
    );
  }
};
