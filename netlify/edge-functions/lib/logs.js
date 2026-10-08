import { Storage } from "./storage.js";
import { uid, now } from "./util.js";

const MAX_LOGS = 1000;

export async function addLog({ type, user = "system", action, status = "ok", meta = {} }) {
  const entry = { id: uid(), ts: now(), type, user, action, status, meta };
  const key = `logs/${String(entry.ts).padStart(20, "0")}_${entry.id}`;
  await Storage.setJSON(key, entry);
  try {
    const keys = await Storage.list("logs/");
    if (keys.length > MAX_LOGS) {
      keys.sort();
      const toDelete = keys.slice(0, keys.length - MAX_LOGS);
      await Promise.all(toDelete.map((k) => Storage.del(k)));
    }
  } catch {}
  return entry;
}

export async function listLogs({ limit = 200, type = null, search = null } = {}) {
  const keys = await Storage.list("logs/");
  keys.sort().reverse();
  const out = [];
  for (const k of keys) {
    if (out.length >= limit) break;
    const e = await Storage.getJSON(k);
    if (!e) continue;
    if (type && e.type !== type) continue;
    if (search) {
      const s = search.toLowerCase();
      const hay = `${e.user} ${e.action} ${e.type} ${e.status}`.toLowerCase();
      if (!hay.includes(s)) continue;
    }
    out.push(e);
  }
  return out;
}