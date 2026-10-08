import { Storage } from "./storage.js";

const KEY = "settings";

export const DEFAULT_SETTINGS = {
  siteName: "Abulix Panel",
  defaultHost: "",
  tls: true,
  sni: "",
  tlsPorts: [443, 8443],
  nonTlsPorts: [80, 8080],
  hosts: [],
  subscription: { path: "/api/sub", baseUrl: "" },
  session: { ttlDays: 7 },
  telegram: { enabled: false },
};

export async function getSettings() {
  const s = await Storage.getJSON(KEY, null);
  if (!s) return structuredClone(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    subscription: { ...DEFAULT_SETTINGS.subscription, ...(s.subscription || {}) },
    session: { ...DEFAULT_SETTINGS.session, ...(s.session || {}) },
    telegram: { ...DEFAULT_SETTINGS.telegram, ...(s.telegram || {}) },
  };
}

export async function saveSettings(patch) {
  const current = await getSettings();
  const next = {
    ...current,
    ...patch,
    subscription: { ...current.subscription, ...(patch.subscription || {}) },
    session: { ...current.session, ...(patch.session || {}) },
    telegram: { ...current.telegram, ...(patch.telegram || {}) },
  };
  await Storage.setJSON(KEY, next);
  return next;
}