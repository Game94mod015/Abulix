import { base64EncodeString } from "./util.js";

function hostsFor(settings) {
  if (Array.isArray(settings.hosts) && settings.hosts.length) return settings.hosts;
  if (settings.defaultHost) {
    return [{ id: "default", label: "Default", host: settings.defaultHost, tls: !!settings.tls, sni: settings.sni || "" }];
  }
  return [];
}
function portFor(host, settings) {
  return host.tls ? (settings.tlsPorts?.[0] || 443) : (settings.nonTlsPorts?.[0] || 80);
}

function vless(user, host, settings) {
  const p = new URLSearchParams();
  p.set("type", "tcp");
  p.set("security", host.tls ? "tls" : "none");
  if (host.tls && (host.sni || settings.sni)) p.set("sni", host.sni || settings.sni);
  p.set("encryption", "none");
  const tag = encodeURIComponent(`${settings.siteName}-${host.label || host.host}`);
  return `vless://${user.uuid}@${host.host}:${portFor(host, settings)}?${p.toString()}#${tag}`;
}
function vmess(user, host, settings) {
  const cfg = {
    v: "2",
    ps: `${settings.siteName}-${host.label || host.host}`,
    add: host.host,
    port: String(portFor(host, settings)),
    id: user.uuid,
    aid: "0",
    scy: "auto",
    net: "tcp",
    type: "none",
    host: host.sni || "",
    path: "/",
    tls: host.tls ? "tls" : "",
    sni: host.sni || settings.sni || "",
  };
  return `vmess://${base64EncodeString(JSON.stringify(cfg))}`;
}
function trojan(user, host, settings) {
  const p = new URLSearchParams();
  if (host.tls) p.set("security", "tls");
  if (host.sni || settings.sni) p.set("sni", host.sni || settings.sni);
  p.set("type", "tcp");
  const tag = encodeURIComponent(`${settings.siteName}-${host.label || host.host}`);
  return `trojan://${user.uuid}@${host.host}:${portFor(host, settings)}?${p.toString()}#${tag}`;
}
function shadowsocks(user, host, settings) {
  const method = "chacha20-ietf-poly1305";
  const pwd = user.uuid.slice(0, 16);
  const userinfo = base64EncodeString(`${method}:${pwd}`);
  const tag = encodeURIComponent(`${settings.siteName}-${host.label || host.host}`);
  return `ss://${userinfo}@${host.host}:${portFor(host, settings)}#${tag}`;
}

export function generateUris(user, settings, protocols = ["vless","vmess","trojan","ss"]) {
  const hosts = hostsFor(settings);
  const uris = [];
  for (const h of hosts) {
    if (protocols.includes("vless")) uris.push(vless(user, h, settings));
    if (protocols.includes("vmess")) uris.push(vmess(user, h, settings));
    if (protocols.includes("trojan")) uris.push(trojan(user, h, settings));
    if (protocols.includes("ss")) uris.push(shadowsocks(user, h, settings));
  }
  return uris;
}

export function generateSubscriptionText(user, settings) {
  return generateUris(user, settings).join("\n");
}
export function generateBase64Subscription(user, settings) {
  return base64EncodeString(generateSubscriptionText(user, settings));
}
export function generateClashYaml(user, settings) {
  const hosts = hostsFor(settings);
  const proxies = [], names = [];
  for (const h of hosts) {
    const name = `${settings.siteName}-${h.label || h.host}`;
    names.push(name);
    proxies.push(
      [
        `  - name: "${name}"`,
        `    type: vless`,
        `    server: ${h.host}`,
        `    port: ${portFor(h, settings)}`,
        `    uuid: ${user.uuid}`,
        `    network: tcp`,
        `    tls: ${h.tls ? "true" : "false"}`,
        h.tls && (h.sni || settings.sni) ? `    servername: ${h.sni || settings.sni}` : null,
        `    udp: true`,
      ].filter(Boolean).join("\n"),
    );
  }
  return [
    "proxies:", ...proxies,
    "proxy-groups:",
    "  - name: \"PROXY\"",
    "    type: select",
    "    proxies:",
    ...names.map((n) => `      - "${n}"`),
    "rules:",
    "  - MATCH,PROXY",
  ].join("\n");
}
export function generateSingboxJson(user, settings) {
  const hosts = hostsFor(settings);
  const outbounds = hosts.map((h) => ({
    type: "vless",
    tag: `${settings.siteName}-${h.label || h.host}`,
    server: h.host,
    server_port: portFor(h, settings),
    uuid: user.uuid,
    tls: h.tls ? { enabled: true, server_name: h.sni || settings.sni || h.host } : { enabled: false },
  }));
  return JSON.stringify({ outbounds }, null, 2);
}
export function generateSurge(user, settings) {
  return hostsFor(settings).map((h) =>
    `${settings.siteName}-${h.label || h.host} = vless, ${h.host}, ${portFor(h, settings)}, username=${user.uuid}, tls=${h.tls ? "true" : "false"}${h.tls && (h.sni || settings.sni) ? `, sni=${h.sni || settings.sni}` : ""}`
  ).join("\n");
}
export function generateQuantumultX(user, settings) {
  return hostsFor(settings).map((h) =>
    `vless=${h.host}:${portFor(h, settings)}, method=none, password=${user.uuid}, obfs=none, tls-verification=${h.tls ? "true" : "false"}, tag=${settings.siteName}-${h.label || h.host}`
  ).join("\n");
}