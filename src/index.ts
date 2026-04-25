export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    // 🌐 CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const jsonResponse = (data: any, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          "content-type": "application/json",
          ...corsHeaders
        }
      });

    // 🟢 ROOT STATUS
    if (url.pathname === "/") {
      return jsonResponse({
        status: "online",
        message: "Backend ready 🔐"
      });
    }

    // 🩺 HEALTH CHECK
    if (url.pathname === "/health") {
      return jsonResponse({
        status: "alive",
        message: "Auth system running 🔥"
      });
    }

    // ❌ Only POST allowed for auth
    if (request.method !== "POST") {
      return jsonResponse(
        { message: "Method Not Allowed" },
        405
      );
    }

    // 📦 Parse JSON safely
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ message: "Invalid JSON body" }, 400);
    }

    const email = body?.email?.trim();
    const password = body?.password?.trim();

    // ❌ Guard clause
    if (!email || !password) {
      return jsonResponse(
        { message: "Email and password required" },
        400
      );
    }

    // 🟡 SIGNUP
    if (url.pathname === "/signup") {
      try {
        const exists = await env.DB.prepare(
          "SELECT email FROM users WHERE email = ?"
        )
          .bind(email)
          .first();

        if (exists) {
          return jsonResponse(
            { message: "User already exists" },
            409
          );
        }

        await env.DB.prepare(
          "INSERT INTO users (email, password) VALUES (?, ?)"
        )
          .bind(email, password)
          .run();

        return jsonResponse({
          message: "Signup successful 🔥"
        });

      } catch (err) {
        return jsonResponse(
          {
            message: "Signup failed",
            error: String(err)
          },
          500
        );
      }
    }

    // 🔵 LOGIN
    if (url.pathname === "/login") {
      try {
        const user = await env.DB.prepare(
          "SELECT * FROM users WHERE email = ?"
        )
          .bind(email)
          .first();

        if (!user) {
          return jsonResponse(
            { message: "User not found" },
            404
          );
        }

        if (user.password !== password) {
          return jsonResponse(
            { message: "Invalid credentials" },
            401
          );
        }

        return jsonResponse({
          message: "Login successful 🔓",
          user: email
        });

      } catch (err) {
        return jsonResponse(
          {
            message: "Login error",
            error: String(err)
          },
          500
        );
      }
    }

    // ❓ NOT FOUND
    return jsonResponse(
      { message: "Route not found" },
      404
    );
  }
};
