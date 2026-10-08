import { ok, fail, json, now, env } from "./lib/util.js";
import { getSettings, saveSettings } from "./lib/settings.js";
import {
  getSession, createSessionToken, buildSessionCookie, buildLogoutCookie,
  checkAdminCredentials, rateLimit,
} from "./lib/auth.js";
import {
  listUsers, getUser, createUser, updateUser, deleteUser,
  regenerateSubToken, userStatus,
} from "./lib/users.js";
import { addLog, listLogs } from "./lib/logs.js";
import { measureLatency, radarCheck } from "./lib/net.js";
import { telegramConfigured, telegramSend } from "./lib/telegram.js";
import { computeDashboard } from "./lib/stats.js";
import {
  generateUris, generateBase64Subscription, generateClashYaml,
  generateSingboxJson, generateSurge, generateQuantumultX,
} from "./lib/config.js";

export default async function handler(request, context) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/healthz") {
    return json({ ok: true, service: "abulix-panel", runtime: "netlify-edge", ts: now() });
  }

  if (!path.startsWith("/api/")) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    return await route(request, path.replace(/^\/api/, ""));
  } catch (e) {
    console.error("panel error:", e);
    return fail(500, "internal_error", { detail: String(e?.message || e) });
  }
}

function clientIp(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function formatConfig(fmt, user, settings) {
  switch (fmt) {
    case "uris": return generateUris(user, settings);
    case "base64": return generateBase64Subscription(user, settings);
    case "clash": return generateClashYaml(user, settings);
    case "singbox": return generateSingboxJson(user, settings);
    case "surge": return generateSurge(user, settings);
    case "quantumult": return generateQuantumultX(user, settings);
    default: return generateUris(user, settings);
  }
}

async function route(request, path) {
  // ---- Public: subscription feed ----
  const sub = path.match(/^\/sub\/([A-Za-z0-9_-]+)$/);
  if (sub && request.method === "GET") return handleSubscription(request, sub[1]);

  // ---- Auth ----
  if (path === "/auth/login" && request.method === "POST") return handleLogin(request);
  if (path === "/auth/logout" && request.method === "POST") return handleLogout(request);
  if (path === "/auth/me" && request.method === "GET") return handleMe(request);

  // ---- Protected ----
  const session = await getSession(request);
  if (!session) return fail(401, "unauthorized");

  if (path === "/dashboard" && request.method === "GET") {
    return ok({ data: await computeDashboard() });
  }
  if (path === "/stats" && request.method === "GET") {
    return ok({ data: await computeDashboard() });
  }

  if (path === "/users" && request.method === "GET") {
    const users = await listUsers();
    return ok({ data: users.map((u) => ({ ...u, status: userStatus(u) })) });
  }
  if (path === "/users" && request.method === "POST") return handleCreateUser(request, session);

  const uMatch = path.match(/^\/users\/([^/]+)$/);
  if (uMatch) {
    const id = uMatch[1];
    if (request.method === "GET") {
      const u = await getUser(id);
      if (!u) return fail(404, "not_found");
      return ok({ data: { ...u, status: userStatus(u) } });
    }
    if (request.method === "PATCH") return handleUpdateUser(request, session, id);
    if (request.method === "DELETE") return handleDeleteUser(request, session, id);
  }
  const toggle = path.match(/^\/users\/([^/]+)\/toggle$/);
  if (toggle && request.method === "POST") {
    const id = toggle[1];
    const u = await getUser(id);
    if (!u) return fail(404, "not_found");
    const next = await updateUser(id, { enabled: !u.enabled });
    await addLog({ type: "user", user: session.u, action: `user ${next.enabled ? "enabled" : "disabled"}: ${next.username}` });
    return ok({ data: { ...next, status: userStatus(next) } });
  }
  const regen = path.match(/^\/users\/([^/]+)\/regenerate-sub$/);
  if (regen && request.method === "POST") {
    const u = await regenerateSubToken(regen[1]);
    await addLog({ type: "subscription", user: session.u, action: `regenerated subscription: ${u.username}` });
    return ok({ data: { ...u, status: userStatus(u) } });
  }

  if (path === "/settings" && request.method === "GET") {
    return ok({ data: await getSettings() });
  }
  if (path === "/settings" && request.method === "PUT") {
    const patch = await request.json().catch(() => ({}));
    const next = await saveSettings(patch);
    await addLog({ type: "settings", user: session.u, action: "settings updated" });
    return ok({ data: next });
  }

  if (path === "/logs" && request.method === "GET") {
    const u = new URL(request.url);
    const limit = Math.min(Number(u.searchParams.get("limit")) || 200, 1000);
    const type = u.searchParams.get("type") || null;
    const search = u.searchParams.get("search") || null;
    return ok({ data: await listLogs({ limit, type, search }) });
  }

  if (path === "/net/ping" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (!body.target) return fail(400, "target_required");
    const result = await measureLatency(body.target, { timeoutMs: Math.min(Number(body.timeoutMs) || 8000, 15000) });
    return ok({ data: result });
  }
  if (path === "/net/radar" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const result = await radarCheck({
      host: body.host,
      port: body.port ? Number(body.port) : null,
      tls: body.tls !== false,
      timeoutMs: Math.min(Number(body.timeoutMs) || 8000, 15000),
    });
    return ok({ data: result });
  }

  if (path === "/config/preview" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const user = body.userId ? await getUser(body.userId) : null;
    if (!user) return fail(404, "user_not_found");
    const settings = await getSettings();
    const fmt = body.format || "uris";
    return ok({ data: { format: fmt, content: formatConfig(fmt, user, settings) } });
  }

  if (path === "/telegram/status" && request.method === "GET") {
    return ok({ data: { configured: telegramConfigured() } });
  }
  if (path === "/telegram/test" && request.method === "POST") {
    if (!telegramConfigured()) return fail(400, "telegram_not_configured");
    const r = await telegramSend(`🔔 <b>Abulix Panel</b>\nTest message @ ${new Date().toISOString()}`);
    return r.ok ? ok({ data: r }) : fail(502, r.error || "telegram_send_failed");
  }

  return fail(404, "not_found");
}

// ---------- Handlers ----------

async function handleLogin(request) {
  const ip = clientIp(request);
  const rl = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    await addLog({ type: "security", user: ip, action: "login rate limited", status: "blocked" });
    return fail(429, "too_many_attempts");
  }
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const remember = !!body.remember;
  if (!username || !password) return fail(400, "missing_credentials");

  const valid = await checkAdminCredentials(username, password);
  if (!valid) {
    await addLog({ type: "security", user: username || ip, action: "failed login", status: "denied" });
    return fail(401, "invalid_credentials");
  }

  const settings = await getSettings();
  const baseTtlDays = Number(settings?.session?.ttlDays) || 7;
  const ttlSeconds = (remember ? baseTtlDays : 1) * 24 * 60 * 60;
  const token = await createSessionToken(username, ttlSeconds);

  await addLog({ type: "auth", user: username, action: "logged in" });

  return json({ ok: true }, {
    headers: { "set-cookie": buildSessionCookie(token, ttlSeconds) },
  });
}

async function handleLogout(request) {
  const session = await getSession(request);
  if (session) await addLog({ type: "auth", user: session.u, action: "logged out" });
  return json({ ok: true }, { headers: { "set-cookie": buildLogoutCookie() } });
}

async function handleMe(request) {
  const session = await getSession(request);
  if (!session) return fail(401, "unauthorized");
  return ok({ data: { username: session.u, expiresAt: session.exp } });
}

async function handleCreateUser(request, session) {
  const body = await request.json().catch(() => ({}));
  try {
    const user = await createUser({
      username: body.username,
      uuid: body.uuid,
      expiresAt: body.expiresAt || 0,
      trafficLimitBytes: body.trafficLimitBytes || 0,
      note: body.note || "",
    });
    await addLog({ type: "user", user: session.u, action: `created user: ${user.username}` });
    return ok({ data: { ...user, status: userStatus(user) } });
  } catch (e) {
    return fail(400, String(e?.message || e));
  }
}

async function handleUpdateUser(request, session, id) {
  const body = await request.json().catch(() => ({}));
  try {
    const user = await updateUser(id, body);
    await addLog({ type: "user", user: session.u, action: `updated user: ${user.username}` });
    return ok({ data: { ...user, status: userStatus(user) } });
  } catch (e) {
    return fail(400, String(e?.message || e));
  }
}

async function handleDeleteUser(request, session, id) {
  const u = await getUser(id);
  await deleteUser(id);
  await addLog({ type: "user", user: session.u, action: `deleted user: ${u?.username || id}` });
  return ok();
}

async function handleSubscription(request, token) {
  const users = await listUsers();
  const user = users.find((u) => u.subToken === token);
  if (!user) return new Response("Not Found", { status: 404 });
  if (!user.enabled) return new Response("Disabled", { status: 403 });

  const settings = await getSettings();
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  let content, contentType = "text/plain; charset=utf-8";

  if (ua.includes("clash") || ua.includes("mihomo")) {
    content = generateClashYaml(user, settings);
    contentType = "text/yaml; charset=utf-8";
  } else if (ua.includes("sing-box") || ua.includes("singbox")) {
    content = generateSingboxJson(user, settings);
    contentType = "application/json; charset=utf-8";
  } else {
    content = generateBase64Subscription(user, settings);
  }

  return new Response(content, {
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "profile-title": settings.siteName || "Abulix",
      "profile-update-interval": "24",
    },
  });
}