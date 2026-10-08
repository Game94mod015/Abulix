import { Storage } from "./storage.js";
import { uid, now, randomToken } from "./util.js";

const INDEX_KEY = "users/index";

export async function listUsers() {
  const index = await Storage.getJSON(INDEX_KEY, []);
  const out = [];
  for (const id of index) {
    const u = await Storage.getJSON(`users/${id}`);
    if (u) out.push(u);
  }
  return out;
}

export async function getUser(id) { return Storage.getJSON(`users/${id}`); }

export async function getUserByUsername(username) {
  const users = await listUsers();
  return users.find((u) => u.username === username) || null;
}

export async function createUser({ username, uuid, expiresAt = 0, trafficLimitBytes = 0, note = "" }) {
  if (!username || !/^[a-zA-Z0-9_.-]{2,32}$/.test(username)) throw new Error("invalid username");
  if (await getUserByUsername(username)) throw new Error("username already exists");

  const id = uid();
  const user = {
    id,
    username,
    uuid: uuid || uid(),
    subToken: randomToken(20),
    enabled: true,
    createdAt: now(),
    expiresAt: Number(expiresAt) || 0,
    trafficLimitBytes: Number(trafficLimitBytes) || 0,
    uploadBytes: 0,
    downloadBytes: 0,
    note: String(note || "").slice(0, 256),
  };
  await Storage.setJSON(`users/${id}`, user);
  const index = await Storage.getJSON(INDEX_KEY, []);
  index.push(id);
  await Storage.setJSON(INDEX_KEY, index);
  return user;
}

export async function updateUser(id, patch) {
  const user = await getUser(id);
  if (!user) throw new Error("user not found");
  const allowed = ["username","uuid","enabled","expiresAt","trafficLimitBytes","note","uploadBytes","downloadBytes"];
  for (const k of allowed) if (k in patch) user[k] = patch[k];
  user.expiresAt = Number(user.expiresAt) || 0;
  user.trafficLimitBytes = Number(user.trafficLimitBytes) || 0;
  user.uploadBytes = Number(user.uploadBytes) || 0;
  user.downloadBytes = Number(user.downloadBytes) || 0;
  user.enabled = !!user.enabled;
  await Storage.setJSON(`users/${id}`, user);
  return user;
}

export async function deleteUser(id) {
  await Storage.del(`users/${id}`);
  const index = await Storage.getJSON(INDEX_KEY, []);
  await Storage.setJSON(INDEX_KEY, index.filter((x) => x !== id));
}

export async function regenerateSubToken(id) {
  const user = await getUser(id);
  if (!user) throw new Error("user not found");
  user.subToken = randomToken(20);
  await Storage.setJSON(`users/${id}`, user);
  return user;
}

export function userStatus(u) {
  if (!u.enabled) return "disabled";
  if (u.expiresAt && u.expiresAt < now()) return "expired";
  if (u.trafficLimitBytes && (u.uploadBytes + u.downloadBytes) >= u.trafficLimitBytes) return "limited";
  return "active";
}