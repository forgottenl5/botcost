// BotCost waitlist Worker
// Stores email sign-ups in a Cloudflare D1 database.
// Served on the site's own domain at /api/subscribe (see wrangler.toml.example).

const ALLOWED_ORIGINS = ["https://botcost.dev", "https://www.botcost.dev"];
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,63}$/;
const MAX_BODY_BYTES = 1024;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = allowed
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Vary": "Origin",
        }
      : {};

    const json = (obj, status) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, { status: allowed ? 204 : 403, headers: cors });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!allowed) return json({ error: "Forbidden" }, 403);

    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);

    let email = "";
    try {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);
      const body = JSON.parse(text);
      email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    } catch {
      return json({ error: "Invalid request" }, 400);
    }

    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }

    try {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, datetime('now'))"
      ).bind(email).run();
    } catch (err) {
      // Log details server-side only; never return internal errors to the browser.
      console.error("waitlist insert failed", err);
      return json({ error: "Could not save right now. Please try again later." }, 500);
    }

    return json({ success: true }, 200);
  },
};
