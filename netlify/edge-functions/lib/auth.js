import {
  env, hmacSign, timingSafeEqualStr, base64UrlEncode, base64UrlDecode,
  parseCookies, serializeCookie, now,
} from "./util.js";
import { Storage } from "./storage.js";

export const SESSION_COOKIE = "abulix_session";

export async function createSessionToken(username, ttlSeconds) {
  const secret = env("SESSION_SECRET");
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const exp = now() + ttlSeconds * 1000;
  const payload = JSON.stringify({ u: username, exp, iat: now() });
  const body = base64UrlEncode(new TextEncoder().encode(payload));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const secret = env("SESSION_SECRET");
  if (!secret) return null;
  const [body, sig] = token.split(".");
  const expected = await hmacSign(secret, body);
  if (!timingSafeEqualStr(sig, expected)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
    if (!payload || typeof payload.exp !== "number" || payload.exp < now()) return null;
    return payload;
  } catch { return null; }
}

export async function getSession(request) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

export function buildSessionCookie(token, maxAgeSeconds) {
  return serializeCookie(SESSION_COOKIE, token, {
    path: "/", httpOnly: true, secure: true, sameSite: "Lax", maxAge: maxAgeSeconds,
  });
}
export function buildLogoutCookie() {
  return serializeCookie(SESSION_COOKIE, "", {
    path: "/", httpOnly: true, secure: true, sameSite: "Lax", maxAge: 0,
  });
}

export async function checkAdminCredentials(username, password) {
  const u = env("ADMIN_USERNAME");
  const p = env("ADMIN_PASSWORD");
  if (!u || !p) return false;
  return timingSafeEqualStr(username, u) && timingSafeEqualStr(password, p);
}

export async function rateLimit(key, limit, windowMs) {
  const storeKey = `ratelimit/${key}`;
  const rec = await Storage.getJSON(storeKey, { count: 0, resetAt: 0 });
  const t = now();
  if (!rec.resetAt || rec.resetAt < t) { rec.count = 0; rec.resetAt = t + windowMs; }
  rec.count++;
  await Storage.setJSON(storeKey, rec);
  return { allowed: rec.count <= limit, remaining: Math.max(0, limit - rec.count), resetAt: rec.resetAt };
}