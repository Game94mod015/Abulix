import { getStore } from "@netlify/blobs";

let _store = null;
function store() {
  if (!_store) _store = getStore({ name: "abulix", consistency: "strong" });
  return _store;
}

export const Storage = {
  async get(key) {
    try { return await store().get(key); } catch (e) { console.error("storage.get", key, e); return null; }
  },
  async getJSON(key, fallback = null) {
    try {
      const v = await store().get(key, { type: "json" });
      return v === null || v === undefined ? fallback : v;
    } catch (e) { console.error("storage.getJSON", key, e); return fallback; }
  },
  async set(key, value) { return store().set(key, value); },
  async setJSON(key, value) { return store().setJSON(key, value); },
  async del(key) { try { return await store().delete(key); } catch (e) { console.error("storage.del", key, e); } },
  async list(prefix = "") {
    const keys = [];
    try {
      for await (const item of store().list({ prefix })) keys.push(item.key);
    } catch (e) { console.error("storage.list", prefix, e); }
    return keys;
  },
};