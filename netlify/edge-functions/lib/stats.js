import { listUsers } from "./users.js";
import { Storage } from "./storage.js";
import { now } from "./util.js";

export async function computeDashboard() {
  const users = await listUsers();
  const t = now();
  let active = 0, expired = 0, disabled = 0, limited = 0;
  let upload = 0, download = 0, limit = 0, subs = 0;

  for (const u of users) {
    const total = (u.uploadBytes || 0) + (u.downloadBytes || 0);
    upload += u.uploadBytes || 0;
    download += u.downloadBytes || 0;
    limit += u.trafficLimitBytes || 0;
    if (u.subToken) subs++;
    if (!u.enabled) disabled++;
    else if (u.expiresAt && u.expiresAt < t) expired++;
    else if (u.trafficLimitBytes && total >= u.trafficLimitBytes) limited++;
    else active++;
  }

  const logKeys = await Storage.list("logs/");

  return {
    users: { total: users.length, active, expired, disabled, limited },
    subscriptions: { total: subs },
    traffic: { upload, download, total: upload + download, limit },
    logs: { total: logKeys.length },
    ts: t,
  };
}