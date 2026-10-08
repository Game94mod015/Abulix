const PANEL_PASSWORD = "__PANEL_PASSWORD__";

function page(ok = false) {
  return `<!doctype html><html lang="fa" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Abulix Panel</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,-apple-system,Segoe UI,Tahoma,sans-serif;background:radial-gradient(circle at 20% 20%,#164e63 0,transparent 35%),radial-gradient(circle at 80% 80%,#312e81 0,transparent 35%),#05070b;color:#fff}
.card{width:min(420px,92vw);padding:28px;border:1px solid #ffffff25;border-radius:28px;background:#ffffff12;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:0 24px 80px #0008}
.brand{font-size:28px;font-weight:800;margin-bottom:8px}.muted{color:#b8c0cc;margin-bottom:22px}.input{width:100%;padding:14px 16px;border-radius:15px;border:1px solid #ffffff22;background:#0004;color:#fff;outline:0;font-size:15px}.btn{width:100%;margin-top:12px;padding:14px;border:0;border-radius:15px;background:#22d3ee;color:#031018;font-weight:800;cursor:pointer}.ok{margin-top:16px;padding:12px;border-radius:14px;background:#10b98122;color:#6ee7b7}.tag{display:inline-block;padding:5px 9px;border-radius:99px;background:#ffffff12;color:#b8c0cc;font-size:12px;margin-top:16px}
</style></head><body><main class="card"><div class="brand">Abulix Panel</div><div class="muted">پنل سبک Cloudflare Worker</div>
<form method="POST" action="/login"><input class="input" name="password" type="password" placeholder="رمز ورود" autocomplete="current-password" required><button class="btn">ورود مستقیم</button></form>
${ok ? '<div class="ok">ورود موفق بود.</div>' : ""}<div class="tag">No KV · No D1 · Edge Ready</div></main></body></html>`;
}

export default async function handler(request, context) {
    try {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/healthz")
        return new Response("ok", {headers: {"content-type":"text/plain;charset=UTF-8"}});
      if (request.method === "GET" && url.pathname === "/")
        return new Response(page(), {headers: {"content-type":"text/html;charset=UTF-8"}});
      if (request.method === "POST" && url.pathname === "/login") {
        const form = await request.formData();
        if (String(form.get("password") || "") !== PANEL_PASSWORD)
          return new Response("Wrong password", {status:401});
        return new Response(page(true), {headers: {"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
      }
      return new Response("Not found", {status:404});
    } catch (e) {
      return new Response("Worker error", {status:500,headers:{"cache-control":"no-store"}});
    }
}

export const config = { path: "/*" };
