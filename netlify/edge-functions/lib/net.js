import { now } from "./util.js";

export function normalizeUrl(target) {
  if (!target || typeof target !== "string") return null;
  let t = target.trim();
  if (!/^https?:\/\//i.test(t)) t = "https://" + t;
  try { new URL(t); return t; } catch { return null; }
}

export async function measureLatency(target, { timeoutMs = 8000, method = "HEAD" } = {}) {
  const url = normalizeUrl(target);
  if (!url) return { ok: false, status: "invalid", error: "invalid target", target, ts: now() };
  const start = now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method, signal: ctrl.signal, redirect: "manual" });
    clearTimeout(timer);
    return { ok: true, status: "online", latencyMs: now() - start, httpStatus: res.status, target: url, ts: now() };
  } catch (e) {
    clearTimeout(timer);
    const aborted = String(e?.name || "").toLowerCase() === "abort" || String(e?.message || "").toLowerCase().includes("abort");
    return {
      ok: false,
      status: aborted ? "timeout" : "offline",
      latencyMs: now() - start,
      error: String(e?.message || e),
      target: url,
      ts: now(),
    };
  }
}

export async function radarCheck({ host, port, tls = true, timeoutMs = 8000 }) {
  if (!host) return { ok: false, status: "invalid", error: "host required", ts: now() };
  const scheme = tls ? "https" : "http";
  const url = port ? `${scheme}://${host}:${port}/` : `${scheme}://${host}/`;
  const res = await measureLatency(url, { timeoutMs, method: "GET" });
  return { ...res, tls, host, port: port || (tls ? 443 : 80) };
}