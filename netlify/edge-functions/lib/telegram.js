import { env } from "./util.js";

export function telegramConfigured() {
  return !!(env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_ADMIN_ID"));
}

export async function telegramSend(text) {
  if (!telegramConfigured()) return { ok: false, error: "telegram_not_configured" };
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_ADMIN_ID");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return { ok: false, error: data?.description || `HTTP ${res.status}` };
    return { ok: true, result: data.result };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function telegramGetMe() {
  if (!env("TELEGRAM_BOT_TOKEN")) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${env("TELEGRAM_BOT_TOKEN")}/getMe`);
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}