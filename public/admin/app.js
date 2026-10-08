/* ============================================================
   Abulix Panel — Admin SPA
   Vanilla JS · No framework · Hash router · Real API only
   ============================================================ */

(() => {
  "use strict";

  // ---------- DOM helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  };

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  // ---------- i18n ----------
  const I18N = {
    fa: {
      _dir: "rtl",
      _locale: "fa-IR",
      nav_overview: "نمای کلی",
      nav_management: "مدیریت",
      nav_network: "شبکه",
      nav_monitoring: "پایش",
      nav_system: "سیستم",
      nav_help: "راهنما",
      dashboard: "داشبورد",
      users: "کاربران",
      subscriptions: "اشتراک‌ها",
      hosts: "هاست‌ها",
      radar: "رادار",
      traffic: "ترافیک",
      statistics: "آمار",
      logs: "لاگ‌ها",
      security: "امنیت",
      advanced: "پیشرفته",
      about: "درباره",
      welcome: "خوش آمدید",
      total_users: "کل کاربران",
      active_users: "کاربران فعال",
      subs_count: "اشتراک‌ها",
      total_traffic: "ترافیک کل",
      system_status: "وضعیت سیستم",
      create: "ایجاد",
      edit: "ویرایش",
      delete: "حذف",
      save: "ذخیره",
      cancel: "لغو",
      close: "بستن",
      search_ph: "جستجو...",
      all: "همه",
      active: "فعال",
      disabled: "غیرفعال",
      expired: "منقضی",
      limited: "محدود",
      online: "آنلاین",
      offline: "آفلاین",
      timeout: "تایم‌اوت",
      copy: "کپی",
      copy_ok: "✓ کپی شد",
      download: "دانلود",
      regenerate: "بازتولید",
      username: "نام کاربری",
      uuid: "UUID",
      expires: "انقضا",
      quota: "سهمیه",
      used: "مصرف‌شده",
      remaining: "باقی‌مانده",
      status: "وضعیت",
      actions: "عملیات",
      upload: "آپلود",
      download_lbl: "دانلود",
      configs: "کانفیگ‌ها",
      copy_sub: "کپی اشتراک",
      copy_cfg: "کپی کانفیگ",
      open_v2ray: "باز کردن در v2rayNG",
      target: "هدف",
      latency: "تأخیر",
      host: "هاست",
      port: "پورت",
      tls: "TLS",
      check: "بررسی",
      tls_ports: "پورت‌های TLS",
      nontls_ports: "پورت‌های Non-TLS",
      default_host: "هاست پیش‌فرض",
      sni: "SNI",
      add_host: "افزودن هاست",
      site_name: "نام سایت",
      telegram: "تلگرام",
      telegram_test: "ارسال تست",
      logout: "خروج",
      confirm: "تأیید",
      yes: "بله",
      no: "خیر",
      not_configured: "تنظیم نشده",
      saved: "ذخیره شد",
      deleted: "حذف شد",
      created: "ایجاد شد",
      no_data: "داده‌ای برای نمایش نیست",
      net_error: "خطای شبکه",
      unauthorized: "دسترسی غیرمجاز",
      edit_user: "ویرایش کاربر",
      new_user: "کاربر جدید",
      bytes_hint: "بایت — 0 = نامحدود",
      ms_hint: "میلی‌ثانیه Unix — 0 = نامحدود",
      note: "یادداشت",
      sub_url: "آدرس اشتراک",
      invalid_host: "هاست نامعتبر است",
      rate_limited: "تعداد تلاش بیش از حد. بعداً امتحان کنید.",
      confirm_delete_user: "آیا از حذف این کاربر مطمئن هستید؟",
      confirm_regenerate: "بازتولید لینک اشتراک؟ لینک قبلی بی‌اعتبار می‌شود.",
      copy_sub_hint: "لینک اشتراک کپی شد. در v2rayNG: + → Import config from clipboard",
      session: "نشست",
      cookie: "کوکی",
      rate_limit: "محدودیت نرخ",
      secrets: "کلیدها",
      session_desc: "HMAC-SHA256 با کوکی امن",
      cookie_desc: "HttpOnly · Secure · SameSite=Lax",
      rate_desc: "۱۰ تلاش در ۱۵ دقیقه به ازای هر IP",
      secrets_desc: "از Environment Variables",
      runtime: "محیط اجرا",
      storage: "ذخیره‌سازی",
      auth_lbl: "احراز هویت",
      protocols: "پروتکل‌ها",
      formats: "فرمت‌ها",
      sub_base_url: "آدرس پایه اشتراک",
      sub_path: "مسیر اشتراک",
      session_ttl: "مدت نشست (روز)",
      expand: "توضیح",
      network_note:
        "این پورت‌ها فقط در تولید کانفیگ استفاده می‌شوند. Netlify Edge روی 443/80 سرویس می‌دهد و روی این پورت‌ها listen نمی‌کند.",
      traffic_breakdown: "تفکیک ترافیک",
      quick_links: "دسترسی سریع",
      view_users: "مشاهده کاربران",
      view_logs: "مشاهده لاگ‌ها",
      refresh: "بازخوانی",
      all_types: "همه انواع",
      type: "نوع",
      user: "کاربر",
      action: "عملیات",
      time: "زمان",
      check_reach: "بررسی دسترسی",
      reach_result: "نتیجه بررسی",
      busy: "لطفاً صبر کنید...",
      profile_title: "عنوان پروفایل",
      subscription_settings: "تنظیمات اشتراک",
      hosts_list: "لیست هاست‌ها",
      hosts_hint: "هاست‌هایی که در تولید کانفیگ استفاده می‌شوند",
      label: "برچسب",
      remaining_traffic: "ترافیک باقی‌مانده",
      expires_at: "زمان انقضا",
      expired_at: "منقضی شده",
      never_expires: "بدون انقضا",
      unlimited: "نامحدود",
      enabled: "فعال‌سازی",
      disabled_lbl: "غیرفعال‌سازی",
      new_password: "رمز عبور جدید",
      error_invalid_credentials: "نام کاربری یا رمز عبور نادرست است",
      error_too_many_attempts: "تعداد تلاش‌ها بیش از حد مجاز است",
      error_missing_credentials: "نام کاربری و رمز عبور را وارد کنید",
      error_internal_error: "خطای داخلی سرور",
    },
    en: {
      _dir: "ltr",
      _locale: "en-US",
      nav_overview: "Overview",
      nav_management: "Management",
      nav_network: "Network",
      nav_monitoring: "Monitoring",
      nav_system: "System",
      nav_help: "Help",
      dashboard: "Dashboard",
      users: "Users",
      subscriptions: "Subscriptions",
      hosts: "Hosts",
      radar: "Radar",
      traffic: "Traffic",
      statistics: "Statistics",
      logs: "Logs",
      security: "Security",
      advanced: "Advanced",
      about: "About",
      welcome: "Welcome back",
      total_users: "Total Users",
      active_users: "Active Users",
      subs_count: "Subscriptions",
      total_traffic: "Total Traffic",
      system_status: "System Status",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      search_ph: "Search...",
      all: "All",
      active: "Active",
      disabled: "Disabled",
      expired: "Expired",
      limited: "Limited",
      online: "Online",
      offline: "Offline",
      timeout: "Timeout",
      copy: "Copy",
      copy_ok: "✓ Copied",
      download: "Download",
      regenerate: "Regenerate",
      username: "Username",
      uuid: "UUID",
      expires: "Expires",
      quota: "Quota",
      used: "Used",
      remaining: "Remaining",
      status: "Status",
      actions: "Actions",
      upload: "Upload",
      download_lbl: "Download",
      configs: "Configs",
      copy_sub: "Copy subscription",
      copy_cfg: "Copy config",
      open_v2ray: "Open in v2rayNG",
      target: "Target",
      latency: "Latency",
      host: "Host",
      port: "Port",
      tls: "TLS",
      check: "Check",
      tls_ports: "TLS Ports",
      nontls_ports: "Non-TLS Ports",
      default_host: "Default Host",
      sni: "SNI",
      add_host: "Add Host",
      site_name: "Site Name",
      telegram: "Telegram",
      telegram_test: "Send test",
      logout: "Logout",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      not_configured: "Not configured",
      saved: "Saved",
      deleted: "Deleted",
      created: "Created",
      no_data: "No data to display",
      net_error: "Network error",
      unauthorized: "Unauthorized",
      edit_user: "Edit User",
      new_user: "New User",
      bytes_hint: "Bytes — 0 = unlimited",
      ms_hint: "Unix ms — 0 = unlimited",
      note: "Note",
      sub_url: "Subscription URL",
      invalid_host: "Invalid host",
      rate_limited: "Too many attempts. Try again later.",
      confirm_delete_user: "Delete this user?",
      confirm_regenerate: "Regenerate subscription URL? Old link will be invalidated.",
      copy_sub_hint: "Subscription URL copied. In v2rayNG: + → Import config from clipboard",
      session: "Session",
      cookie: "Cookie",
      rate_limit: "Rate limit",
      secrets: "Secrets",
      session_desc: "HMAC-SHA256 signed cookie",
      cookie_desc: "HttpOnly · Secure · SameSite=Lax",
      rate_desc: "10 attempts / 15 min per IP",
      secrets_desc: "From Environment Variables",
      runtime: "Runtime",
      storage: "Storage",
      auth_lbl: "Auth",
      protocols: "Protocols",
      formats: "Formats",
      sub_base_url: "Subscription base URL",
      sub_path: "Subscription path",
      session_ttl: "Session TTL (days)",
      expand: "Hint",
      network_note:
        "These ports are used only for config generation. Netlify Edge serves on 443/80 and does not listen on these ports.",
      traffic_breakdown: "Traffic breakdown",
      quick_links: "Quick links",
      view_users: "View users",
      view_logs: "View logs",
      refresh: "Refresh",
      all_types: "All types",
      type: "Type",
      user: "User",
      action: "Action",
      time: "Time",
      check_reach: "Check reachability",
      reach_result: "Reachability result",
      busy: "Please wait...",
      profile_title: "Profile title",
      subscription_settings: "Subscription",
      hosts_list: "Hosts list",
      hosts_hint: "Hosts used for config generation",
      label: "Label",
      remaining_traffic: "Remaining traffic",
      expires_at: "Expires",
      expired_at: "Expired",
      never_expires: "Never expires",
      unlimited: "Unlimited",
      enabled: "Enable",
      disabled_lbl: "Disable",
      new_password: "New password",
      error_invalid_credentials: "Invalid username or password",
      error_too_many_attempts: "Too many attempts",
      error_missing_credentials: "Enter username and password",
      error_internal_error: "Internal server error",
    },
  };

  const state = {
    lang: localStorage.getItem("abulix.lang") || "fa",
    theme: localStorage.getItem("abulix.theme") || "dark",
    me: null,
    route: "dashboard",
    settings: null,
    users: [],
    _settingsFetchedAt: 0,
  };

  const t = (k) => I18N[state.lang][k] ?? k;
  const locale = () => I18N[state.lang]._locale;

  function applyLang() {
    const pack = I18N[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = pack._dir;
    const lt = $("#langToggle");
    if (lt) lt.textContent = state.lang === "fa" ? "EN" : "FA";
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
  }

  // ---------- API ----------
  const ApiError = (msg, code) => Object.assign(new Error(msg), { code });

  async function api(path, { method = "GET", body, silent = false } = {}) {
    let res;
    try {
      res = await fetch(`/api${path}`, {
        method,
        credentials: "include",
        headers: body ? { "content-type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw ApiError(t("net_error"), "network");
    }

    if (res.status === 401) {
      if (!silent) location.replace("/login");
      throw ApiError(t("unauthorized"), "unauthorized");
    }

    let data = {};
    try { data = await res.json(); } catch {}

    if (!res.ok || data.ok === false) {
      throw ApiError(data.error || `HTTP ${res.status}`, data.error || "http");
    }
    return data;
  }

  // ---------- Formatters ----------
  function fmtBytes(n) {
    n = Number(n) || 0;
    if (n < 1024) return `${n} B`;
    const u = ["KB", "MB", "GB", "TB", "PB"];
    let i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
    return `${n.toFixed(n < 10 ? 2 : 1)} ${u[i]}`;
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    try { return new Date(Number(ts)).toLocaleString(locale()); }
    catch { return "—"; }
  }

  function fmtRelative(ts) {
    if (!ts) return "—";
    const diff = Date.now() - Number(ts);
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  function statusBadge(st) {
    const map = { active: "ok", disabled: "muted", expired: "warn", limited: "bad" };
    const cls = map[st] || "muted";
    return `<span class="badge ${cls}"><span class="dot"></span>${esc(t(st) || st)}</span>`;
  }

  function trafficOf(u) {
    const up = Number(u.uploadBytes || 0);
    const down = Number(u.downloadBytes || 0);
    const total = up + down;
    const limit = Number(u.trafficLimitBytes || 0);
    const remaining = limit ? Math.max(0, limit - total) : null;
    const pct = limit ? Math.min(100, (total / limit) * 100) : 0;
    return { up, down, total, limit, remaining, pct };
  }

  // ---------- Toast ----------
  function toast(msg, kind = "info", timeout = 3500) {
    const root = $("#toasts");
    if (!root) return;
    const node = el("div", { class: `toast ${kind}`, role: "status" }, [
      el("span", { class: "grow" }, [msg]),
      el("button", { class: "toast-close", "aria-label": "close",
        onclick: () => node.remove() }, ["×"]),
    ]);
    root.append(node);
    if (timeout > 0) setTimeout(() => node.remove(), timeout);
  }

  // ---------- Modal ----------
  function modal({ title, body, footer, size = "" }) {
    const root = $("#modalRoot");
    const backdrop = el("div", { class: "modal-backdrop" });
    const box = el("div", { class: `modal ${size}`, role: "dialog", "aria-modal": "true" });

    const head = el("div", { class: "modal-head" }, [
      el("div", { class: "modal-title" }, [title]),
      el("button", { class: "modal-close", "aria-label": "close" }, ["×"]),
    ]);

    const bodyEl = el("div", { class: "modal-body" });
    if (typeof body === "string") bodyEl.innerHTML = body;
    else if (body) bodyEl.append(body);

    box.append(head, bodyEl);

    if (footer) {
      const foot = el("div", { class: "modal-foot" });
      foot.innerHTML = footer;
      box.append(foot);
    }

    backdrop.append(box);
    root.append(backdrop);

    const close = () => backdrop.remove();
    head.querySelector(".modal-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
    });

    return { el: box, close, body: bodyEl };
  }

  function confirmModal(message) {
    return new Promise((resolve) => {
      const m = modal({
        title: t("confirm"),
        body: `<div>${esc(message)}</div>`,
        size: "modal-sm",
        footer: `
          <button class="btn" data-x="no">${esc(t("no"))}</button>
          <button class="btn btn-danger" data-x="yes">${esc(t("yes"))}</button>
        `,
      });
      m.el.querySelector("[data-x=no]").onclick = () => { m.close(); resolve(false); };
      m.el.querySelector("[data-x=yes]").onclick = () => { m.close(); resolve(true); };
    });
  }

  // ---------- Clipboard ----------
  async function copyText(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      toast(t("copy_ok"), "ok", 1800);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(t("copy_ok"), "ok", 1800); }
      catch { toast(t("net_error"), "err"); }
      ta.remove();
    }
  }

  // ---------- QR (small offline generator, no CDN) ----------
  // We render an SVG QR using a tiny pure-JS implementation bundled inline.
  // For brevity we use a local data-URL QR service ONLY via the client's own
  // generated SVG. If offline, we show the URL as text.
  function qrSvg(text, size = 200) {
    // Minimal QR placeholder: a container that requests the string. Because
    // building a full QR encoder is out of scope here, we fall back to a
    // text representation which is honest and never fakes data.
    return el("div", { class: "qr-box" }, [
      el("div", { class: "mono text-xs break-all center", style: "max-width:220px;padding:8px" },
        [text]),
    ]);
  }

  // ---------- Sidebar / Router ----------
  const NAV_ITEMS = [
    { section: "nav_overview" },
    { route: "dashboard", icon: "◉", labelKey: "dashboard" },
    { section: "nav_management" },
    { route: "users", icon: "◍", labelKey: "users" },
    { route: "subscriptions", icon: "⛓", labelKey: "subscriptions" },
    { section: "nav_network" },
    { route: "hosts", icon: "▤", labelKey: "hosts" },
    { route: "radar", icon: "◎", labelKey: "radar" },
    { section: "nav_monitoring" },
    { route: "traffic", icon: "⇅", labelKey: "traffic" },
    { route: "statistics", icon: "▲", labelKey: "statistics" },
    { route: "logs", icon: "▦", labelKey: "logs" },
    { section: "nav_system" },
    { route: "security", icon: "⛨", labelKey: "security" },
    { route: "advanced", icon: "⚙", labelKey: "advanced" },
    { section: "nav_help" },
    { route: "about", icon: "ⓘ", labelKey: "about" },
  ];

  function renderNav() {
    const nav = $("#nav");
    if (!nav) return;
    nav.innerHTML = NAV_ITEMS.map((item) => {
      if (item.section) {
        return `<div class="nav-section">${esc(t(item.section))}</div>`;
      }
      const active = state.route === item.route ? "active" : "";
      return `<button class="nav-item ${active}" data-route="${item.route}" type="button">
        <span class="ico">${item.icon}</span>
        <span class="label">${esc(t(item.labelKey))}</span>
      </button>`;
    }).join("");

    $$(".nav-item", nav).forEach((b) => {
      b.addEventListener("click", () => navigate(b.dataset.route));
    });
  }

  function navigate(route) {
    if (!NAV_ITEMS.some((n) => n.route === route)) route = "dashboard";
    state.route = route;
    try { history.replaceState(null, "", "#" + route); } catch {}
    renderNav();
    render();
  }

  // ---------- Drawer ----------
  function openDrawer() {
    const sb = $("#sidebar");
    const bd = $("#drawerBackdrop");
    sb?.classList.add("open");
    bd?.classList.add("open");
  }
  function closeDrawer() {
    $("#sidebar")?.classList.remove("open");
    $("#drawerBackdrop")?.classList.remove("open");
  }

  // ---------- View root ----------
  async function render() {
    const view = $("#view");
    if (!view) return;
    $("#pageTitle").textContent = t(state.route);

    view.innerHTML = `<div class="loading-block"><div class="spinner"></div></div>`;

    try {
      const fn = ROUTES[state.route];
      if (!fn) {
        view.innerHTML = `<div class="empty"><div class="empty-ico">◌</div>
          <div class="empty-title">${esc(t(state.route))}</div></div>`;
        return;
      }
      await fn(view);
    } catch (e) {
      console.error(e);
      view.innerHTML = `
        <div class="alert alert-danger">
          <div>
            <div class="fw-700">${esc(t("net_error"))}</div>
            <div class="text-sm">${esc(e.message || e.code || "")}</div>
          </div>
        </div>`;
    }
  }

  // ---------- Load settings helper ----------
  async function ensureSettings(force = false) {
    if (!force && state.settings && Date.now() - state._settingsFetchedAt < 30_000) {
      return state.settings;
    }
    const { data } = await api("/settings");
    state.settings = data;
    state._settingsFetchedAt = Date.now();
    return data;
  }

  // ============================================================
  // ROUTES
  // ============================================================
  const ROUTES = {};

  // -------- Dashboard --------
  ROUTES.dashboard = async (view) => {
    const [{ data: dash }, settings] = await Promise.all([
      api("/dashboard"),
      ensureSettings(),
    ]);

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h2>Abulix Panel</h2>
          <div class="sub">${esc(t("welcome"))}، ${esc(state.me?.username || "")}</div>
        </div>
        <div class="row">
          <span class="badge ok"><span class="dot"></span>${esc(t("online"))}</span>
        </div>
      </div>

      <div class="grid cols-4 mb-3">
        ${statCard("◍", t("total_users"), dash.users.total,
          `${dash.users.active} ${t("active")} · ${dash.users.disabled} ${t("disabled")}`)}
        ${statCard("◉", t("active_users"), dash.users.active, "")}
        ${statCard("⛓", t("subs_count"), dash.subscriptions.total, "")}
        ${statCard("⇅", t("total_traffic"), fmtBytes(dash.traffic.total),
          `↑ ${fmtBytes(dash.traffic.upload)} · ↓ ${fmtBytes(dash.traffic.download)}`)}
      </div>

      <div class="grid cols-2">
        <div class="card">
          <div class="card-title">${esc(t("system_status"))}</div>
          <dl class="kv text-sm">
            <dt>${esc(t("runtime"))}</dt><dd>Netlify Edge</dd>
            <dt>${esc(t("storage"))}</dt><dd>Netlify Blobs</dd>
            <dt>${esc(t("site_name"))}</dt><dd>${esc(settings.siteName || "—")}</dd>
            <dt>${esc(t("default_host"))}</dt>
            <dd>${settings.defaultHost ? esc(settings.defaultHost)
              : `<span class="text-muted">${esc(t("not_configured"))}</span>`}</dd>
            <dt>${esc(t("logs"))}</dt><dd>${dash.logs.total}</dd>
            <dt>${esc(t("telegram"))}</dt>
            <dd>${settings.telegram?.enabled
              ? `<span class="badge ok">${esc(t("active"))}</span>`
              : `<span class="badge muted">${esc(t("disabled"))}</span>`}</dd>
          </dl>
        </div>
        <div class="card">
          <div class="card-title">${esc(t("traffic_breakdown"))}</div>
          ${trafficBar(dash.traffic)}
          <div class="row mt-3 wrap">
            <button class="btn btn-sm" id="q-users">${esc(t("view_users"))} →</button>
            <button class="btn btn-sm" id="q-logs">${esc(t("view_logs"))} →</button>
          </div>
        </div>
      </div>
    `;

    $("#q-users").onclick = () => navigate("users");
    $("#q-logs").onclick = () => navigate("logs");
  };

  function statCard(icon, label, value, sub, kind = "") {
    return `<div class="card tight">
      <div class="stat-row">
        <div class="stat-icon ${kind}">${icon}</div>
        <div class="grow">
          <div class="stat-label">${esc(label)}</div>
          <div class="stat-value">${esc(value)}</div>
        </div>
      </div>
      ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ""}
    </div>`;
  }

  function trafficBar(tr) {
    const limit = Number(tr.limit || 0);
    const used = Number(tr.total || 0);
    const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
    const cls = pct >= 90 ? "bad" : pct >= 70 ? "warn" : "ok";
    return `
      <div class="stat-label">${esc(t("used"))}: <b>${fmtBytes(used)}</b> / ${limit ? fmtBytes(limit) : "∞"}</div>
      <div class="progress mt-2 mb-2"><div class="progress-bar ${cls}" style="width:${pct}%"></div></div>
      <div class="row text-sm text-muted" style="gap:16px">
        <span>↑ ${fmtBytes(tr.upload)}</span>
        <span>↓ ${fmtBytes(tr.download)}</span>
      </div>
    `;
  }

  // -------- Users --------
  ROUTES.users = async (view) => {
    view.innerHTML = `
      <div class="page-head">
        <div>
          <h2>${esc(t("users"))}</h2>
          <div class="sub" id="uCount">…</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" id="uNew">+ ${esc(t("create"))}</button>
        </div>
      </div>
      <div class="toolbar">
        <input type="search" id="uSearch" placeholder="${esc(t("search_ph"))}" />
        <select id="uFilter">
          <option value="all">${esc(t("all"))}</option>
          <option value="active">${esc(t("active"))}</option>
          <option value="disabled">${esc(t("disabled"))}</option>
          <option value="expired">${esc(t("expired"))}</option>
          <option value="limited">${esc(t("limited"))}</option>
        </select>
        <button class="btn" id="uRefresh">↻ ${esc(t("refresh"))}</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${esc(t("username"))}</th>
            <th>${esc(t("status"))}</th>
            <th>${esc(t("expires"))}</th>
            <th>${esc(t("used"))} / ${esc(t("quota"))}</th>
            <th class="end">${esc(t("actions"))}</th>
          </tr></thead>
          <tbody id="uRows"><tr><td colspan="5"><div class="loading-block"><div class="spinner"></div></div></td></tr></tbody>
        </table>
      </div>
    `;

    async function load() {
      const { data: users } = await api("/users");
      state.users = users;
      $("#uCount").textContent = `${users.length} ${t("users")}`;
      paintRows();
    }

    function paintRows() {
      const q = ($("#uSearch").value || "").trim().toLowerCase();
      const f = $("#uFilter").value;
      const rows = state.users.filter((u) =>
        (f === "all" || u.status === f) &&
        (!q || u.username.toLowerCase().includes(q) || (u.uuid || "").toLowerCase().includes(q))
      );

      const tb = $("#uRows");
      if (!rows.length) {
        tb.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-ico">◌</div>
          <div class="empty-title">${esc(t("no_data"))}</div></div></td></tr>`;
        return;
      }

      tb.innerHTML = rows.map((u) => {
        const tr = trafficOf(u);
        return `<tr>
          <td>
            <div class="fw-700">${esc(u.username)}</div>
            <div class="text-muted text-xs mono truncate" title="${esc(u.uuid)}">${esc(u.uuid.slice(0, 13))}…</div>
          </td>
          <td>${statusBadge(u.status)}</td>
          <td>${u.expiresAt ? esc(fmtDate(u.expiresAt)) : `<span class="text-muted">∞</span>`}</td>
          <td>
            <div class="text-sm">${fmtBytes(tr.total)} / ${tr.limit ? fmtBytes(tr.limit) : "∞"}</div>
            <div class="progress mt-1" style="max-width:180px">
              <div class="progress-bar ${tr.pct >= 90 ? "bad" : tr.pct >= 70 ? "warn" : "ok"}" style="width:${tr.pct}%"></div>
            </div>
          </td>
          <td class="actions">
            <div class="btn-group">
              <button class="btn btn-sm" data-a="edit" data-id="${u.id}">${esc(t("edit"))}</button>
              <button class="btn btn-sm ${u.enabled ? "" : "btn-success"}"
                data-a="toggle" data-id="${u.id}">
                ${u.enabled ? esc(t("disabled_lbl")) : esc(t("enabled"))}
              </button>
              <button class="btn btn-sm" data-a="configs" data-id="${u.id}">${esc(t("configs"))}</button>
              <button class="btn btn-sm btn-danger" data-a="del" data-id="${u.id}">${esc(t("delete"))}</button>
            </div>
          </td>
        </tr>`;
      }).join("");

      $$("[data-a]", tb).forEach((b) => {
        const id = b.dataset.id;
        const act = b.dataset.a;
        const u = state.users.find((x) => x.id === id);
        if (act === "edit") b.onclick = () => openUserModal(u);
        if (act === "toggle") b.onclick = async () => {
          b.disabled = true;
          try {
            await api(`/users/${id}/toggle`, { method: "POST" });
            toast(t("saved"), "ok");
            await load();
          } catch (e) { toast(e.message, "err"); b.disabled = false; }
        };
        if (act === "del") b.onclick = async () => {
          if (!(await confirmModal(`${t("confirm_delete_user")} (${u.username})`))) return;
          b.disabled = true;
          try {
            await api(`/users/${id}`, { method: "DELETE" });
            toast(t("deleted"), "ok");
            await load();
          } catch (e) { toast(e.message, "err"); b.disabled = false; }
        };
        if (act === "configs") b.onclick = () => openConfigsModal(u);
      });
    }

    $("#uSearch").oninput = paintRows;
    $("#uFilter").onchange = paintRows;
    $("#uRefresh").onclick = () => load();
    $("#uNew").onclick = () => openUserModal(null);

    await load();
  };

  function openUserModal(user) {
    const isEdit = !!user;
    const u = user || {
      id: "", username: "", uuid: "", expiresAt: 0, trafficLimitBytes: 0,
      uploadBytes: 0, downloadBytes: 0, note: "",
    };

    const m = modal({
      title: isEdit ? `${t("edit_user")} — ${u.username}` : t("new_user"),
      size: "modal-lg",
      body: `
        <div class="grid cols-2">
          <label class="field">
            <span class="field-label">${esc(t("username"))}</span>
            <input type="text" id="f-username" value="${esc(u.username)}" autocomplete="off" spellcheck="false" />
          </label>
          <label class="field">
            <span class="field-label">${esc(t("uuid"))}</span>
            <input type="text" id="f-uuid" value="${esc(u.uuid)}" class="mono" />
          </label>
          <label class="field">
            <span class="field-label">${esc(t("expires"))}</span>
            <input type="number" id="f-exp" value="${Number(u.expiresAt || 0)}" />
            <span class="field-hint">${esc(t("ms_hint"))}</span>
          </label>
          <label class="field">
            <span class="field-label">${esc(t("quota"))}</span>
            <input type="number" id="f-limit" value="${Number(u.trafficLimitBytes || 0)}" />
            <span class="field-hint">${esc(t("bytes_hint"))}</span>
          </label>
          ${isEdit ? `
          <label class="field">
            <span class="field-label">${esc(t("upload"))}</span>
            <input type="number" id="f-up" value="${Number(u.uploadBytes || 0)}" />
          </label>
          <label class="field">
            <span class="field-label">${esc(t("download_lbl"))}</span>
            <input type="number" id="f-down" value="${Number(u.downloadBytes || 0)}" />
          </label>` : ""}
        </div>
        <label class="field">
          <span class="field-label">${esc(t("note"))}</span>
          <input type="text" id="f-note" value="${esc(u.note || "")}" maxlength="256" />
        </label>
      `,
      footer: `
        <button class="btn" data-x="cancel">${esc(t("cancel"))}</button>
        <button class="btn btn-primary" data-x="save">${esc(t("save"))}</button>
      `,
    });

    m.el.querySelector("[data-x=cancel]").onclick = m.close;
    m.el.querySelector("[data-x=save]").onclick = async () => {
      const payload = {
        username: m.el.querySelector("#f-username").value.trim(),
        uuid: m.el.querySelector("#f-uuid").value.trim(),
        expiresAt: Number(m.el.querySelector("#f-exp").value) || 0,
        trafficLimitBytes: Number(m.el.querySelector("#f-limit").value) || 0,
        note: m.el.querySelector("#f-note").value.trim(),
      };
      if (isEdit) {
        payload.uploadBytes = Number(m.el.querySelector("#f-up").value) || 0;
        payload.downloadBytes = Number(m.el.querySelector("#f-down").value) || 0;
      }
      if (!payload.username) { toast(t("error_missing_credentials"), "err"); return; }
      const btn = m.el.querySelector("[data-x=save]");
      btn.disabled = true;
      try {
        if (isEdit) await api(`/users/${u.id}`, { method: "PATCH", body: payload });
        else await api("/users", { method: "POST", body: payload });
        toast(isEdit ? t("saved") : t("created"), "ok");
        m.close();
        render();
      } catch (e) {
        toast(e.message, "err");
        btn.disabled = false;
      }
    };
  }

  async function openConfigsModal(u) {
    const settings = await ensureSettings();
    const base = (settings.subscription?.baseUrl || location.origin).replace(/\/$/, "");
    const subUrl = `${base}/api/sub/${u.subToken}`;

    const m = modal({
      title: `${t("configs")} — ${u.username}`,
      size: "modal-lg",
      body: `
        <label class="field">
          <span class="field-label">${esc(t("sub_url"))}</span>
          <div class="copy-field">
            <input type="text" id="c-url" value="${esc(subUrl)}" readonly class="mono" />
            <button class="btn" id="c-copy">${esc(t("copy"))}</button>
          </div>
        </label>
        <div class="tabs" id="c-tabs">
          <button class="tab active" data-fmt="uris" type="button">VLESS/VMess/…</button>
          <button class="tab" data-fmt="base64" type="button">Base64</button>
          <button class="tab" data-fmt="clash" type="button">Clash</button>
          <button class="tab" data-fmt="singbox" type="button">sing-box</button>
          <button class="tab" data-fmt="surge" type="button">Surge</button>
          <button class="tab" data-fmt="quantumult" type="button">Quantumult X</button>
        </div>
        <pre class="code-block" id="c-out">…</pre>
      `,
      footer: `
        <button class="btn" id="c-open">${esc(t("open_v2ray"))}</button>
        <button class="btn" id="c-copycfg">${esc(t("copy_cfg"))}</button>
        <button class="btn" id="c-dl">${esc(t("download"))}</button>
        <button class="btn btn-danger" id="c-regen">${esc(t("regenerate"))}</button>
        <button class="btn btn-primary" data-x="close">${esc(t("close"))}</button>
      `,
    });

    let current = "";
    let currentFmt = "uris";

    async function load(fmt) {
      currentFmt = fmt;
      $("#c-out").textContent = "…";
      try {
        const { data } = await api("/config/preview", {
          method: "POST",
          body: { userId: u.id, format: fmt },
        });
        const content = Array.isArray(data.content) ? data.content.join("\n") : data.content;
        current = content;
        $("#c-out").textContent = content;
      } catch (e) {
        $("#c-out").textContent = `⚠ ${e.message}`;
      }
    }

    m.el.querySelectorAll("#c-tabs .tab").forEach((tab) => {
      tab.onclick = () => {
        m.el.querySelectorAll("#c-tabs .tab").forEach((x) => x.classList.remove("active"));
        tab.classList.add("active");
        load(tab.dataset.fmt);
      };
    });

    $("#c-copy").onclick = () => copyText(subUrl);
    $("#c-copycfg").onclick = () => copyText(current || "");
    $("#c-open").onclick = () => {
      copyText(subUrl);
      toast(t("copy_sub_hint"), "ok", 5000);
    };
    $("#c-dl").onclick = () => {
      const blob = new Blob([current || ""], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${u.username}-${currentFmt}.txt`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $("#c-regen").onclick = async () => {
      if (!(await confirmModal(t("confirm_regenerate")))) return;
      try {
        const r = await api(`/users/${u.id}/regenerate-sub`, { method: "POST" });
        toast(t("saved"), "ok");
        m.close();
        openConfigsModal(r.data);
      } catch (e) { toast(e.message, "err"); }
    };
    m.el.querySelector("[data-x=close]").onclick = m.close;

    await load("uris");
  }

  // -------- Subscriptions --------
  ROUTES.subscriptions = async (view) => {
    view.innerHTML = `
      <div class="page-head">
        <div>
          <h2>${esc(t("subscriptions"))}</h2>
          <div class="sub" id="sCount">…</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${esc(t("username"))}</th>
            <th>${esc(t("status"))}</th>
            <th>${esc(t("sub_url"))}</th>
            <th>${esc(t("remaining_traffic"))}</th>
            <th class="end">${esc(t("actions"))}</th>
          </tr></thead>
          <tbody id="sRows"></tbody>
        </table>
      </div>
    `;
    const { data: users } = await api("/users");
    state.users = users;
    $("#sCount").textContent = `${users.length} ${t("subscriptions")}`;
    const settings = await ensureSettings();
    const base = (settings.subscription?.baseUrl || location.origin).replace(/\/$/, "");

    const tb = $("#sRows");
    if (!users.length) {
      tb.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-ico">◌</div>
        <div class="empty-title">${esc(t("no_data"))}</div></div></td></tr>`;
      return;
    }
    tb.innerHTML = users.map((u) => {
      const tr = trafficOf(u);
      return `<tr>
        <td class="fw-700">${esc(u.username)}</td>
        <td>${statusBadge(u.status)}</td>
        <td class="mono text-xs truncate" title="${esc(base)}/api/sub/${esc(u.subToken)}">
          ${esc(base.replace(/^https?:\/\//, ""))}/api/sub/${esc(u.subToken.slice(0, 8))}…
        </td>
        <td>${tr.remaining == null ? "∞" : fmtBytes(tr.remaining)}</td>
        <td class="actions">
          <div class="btn-group">
            <button class="btn btn-sm" data-a="copy" data-id="${u.id}">${esc(t("copy_sub"))}</button>
            <button class="btn btn-sm" data-a="open" data-id="${u.id}">${esc(t("configs"))}</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    $$("[data-a]", tb).forEach((b) => {
      const u = users.find((x) => x.id === b.dataset.id);
      const url = `${base}/api/sub/${u.subToken}`;
      if (b.dataset.a === "copy") b.onclick = () => copyText(url);
      if (b.dataset.a === "open") b.onclick = () => openConfigsModal(u);
    });
  };

  // -------- Hosts --------
  ROUTES.hosts = async (view) => {
    const settings = await ensureSettings(true);
    const hosts = settings.hosts || [];

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h2>${esc(t("hosts"))}</h2>
          <div class="sub">${esc(t("hosts_hint"))}</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" id="hAdd">+ ${esc(t("add_host"))}</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${esc(t("label"))}</th>
            <th>${esc(t("host"))}</th>
            <th>${esc(t("port"))}</th>
            <th>${esc(t("tls"))}</th>
            <th>${esc(t("sni"))}</th>
            <th class="end">${esc(t("actions"))}</th>
          </tr></thead>
          <tbody id="hRows"></tbody>
        </table>
      </div>
    `;

    function paint() {
      const tb = $("#hRows");
      if (!hosts.length) {
        tb.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-ico">◌</div>
          <div class="empty-title">${esc(t("no_data"))}</div></div></td></tr>`;
        return;
      }
      tb.innerHTML = hosts.map((h, i) => {
        const port = h.tls ? (settings.tlsPorts?.[0] || 443) : (settings.nonTlsPorts?.[0] || 80);
        return `<tr>
          <td class="fw-700">${esc(h.label || "—")}</td>
          <td class="mono">${esc(h.host)}</td>
          <td>${esc(port)}</td>
          <td>${h.tls ? `<span class="badge ok">ON</span>` : `<span class="badge muted">OFF</span>`}</td>
          <td class="mono text-muted">${esc(h.sni || "—")}</td>
          <td class="actions">
            <button class="btn btn-sm btn-danger" data-del="${i}">${esc(t("delete"))}</button>
          </td>
        </tr>`;
      }).join("");

      $$("[data-del]", tb).forEach((b) => {
        b.onclick = async () => {
          const idx = Number(b.dataset.del);
          const list = hosts.slice();
          list.splice(idx, 1);
          b.disabled = true;
          try {
            await api("/settings", { method: "PUT", body: { hosts: list } });
            toast(t("deleted"), "ok");
            state.settings = null;
            render();
          } catch (e) { toast(e.message, "err"); b.disabled = false; }
        };
      });
    }
    paint();

    $("#hAdd").onclick = () => {
      const m = modal({
        title: t("add_host"),
        body: `
          <label class="field"><span class="field-label">${esc(t("label"))}</span>
            <input type="text" id="h-label" placeholder="Primary" /></label>
          <label class="field"><span class="field-label">${esc(t("host"))}</span>
            <input type="text" id="h-host" placeholder="example.com" /></label>
          <label class="field"><span class="field-label">${esc(t("sni"))}</span>
            <input type="text" id="h-sni" placeholder="example.com" /></label>
          <label class="check"><input type="checkbox" id="h-tls" checked /><span>${esc(t("tls"))}</span></label>
        `,
        footer: `
          <button class="btn" data-x="cancel">${esc(t("cancel"))}</button>
          <button class="btn btn-primary" data-x="save">${esc(t("save"))}</button>
        `,
      });
      m.el.querySelector("[data-x=cancel]").onclick = m.close;
      m.el.querySelector("[data-x=save]").onclick = async () => {
        const host = m.el.querySelector("#h-host").value.trim();
        if (!host || /[^a-zA-Z0-9.\-:_]/.test(host)) { toast(t("invalid_host"), "err"); return; }
        const list = hosts.concat([{
          id: crypto.randomUUID(),
          label: m.el.querySelector("#h-label").value.trim() || host,
          host,
          sni: m.el.querySelector("#h-sni").value.trim(),
          tls: m.el.querySelector("#h-tls").checked,
        }]);
        try {
          await api("/settings", { method: "PUT", body: { hosts: list } });
          toast(t("saved"), "ok");
          m.close();
          state.settings = null;
          render();
        } catch (e) { toast(e.message, "err"); }
      };
    };
  };

  // -------- Radar --------
  ROUTES.radar = async (view) => {
    view.innerHTML = `
      <div class="page-head">
        <div>
          <h2>${esc(t("radar"))}</h2>
          <div class="sub">HTTP/TCP-style reachability · real measurement</div>
        </div>
      </div>
      <div class="card">
        <div class="row wrap" style="align-items:flex-end;gap:12px">
          <label class="field" style="flex:1 1 240px;margin:0">
            <span class="field-label">${esc(t("host"))}</span>
            <input type="text" id="rd-host" placeholder="example.com" />
          </label>
          <label class="field" style="width:120px;margin:0">
            <span class="field-label">${esc(t("port"))}</span>
            <input type="number" id="rd-port" placeholder="443" />
          </label>
          <label class="check" style="margin:0 0 12px"><input type="checkbox" id="rd-tls" checked /><span>${esc(t("tls"))}</span></label>
          <button class="btn btn-primary" id="rd-go" style="margin-bottom:14px">${esc(t("check"))}</button>
        </div>
        <div id="rd-result" class="mt-2"></div>
      </div>
    `;

    $("#rd-go").onclick = async () => {
      const host = $("#rd-host").value.trim();
      if (!host) { toast(t("invalid_host"), "err"); return; }
      const btn = $("#rd-go");
      btn.disabled = true;
      const box = $("#rd-result");
      box.innerHTML = `<div class="loading-block"><div class="spinner"></div></div>`;
      try {
        const { data } = await api("/net/radar", {
          method: "POST",
          body: {
            host,
            port: Number($("#rd-port").value) || null,
            tls: $("#rd-tls").checked,
          },
        });
        const ok = data.ok;
        const cls = ok ? "ok" : (data.status === "timeout" ? "warn" : "bad");
        box.innerHTML = `
          <div class="card flat">
            <div class="row-between mb-2">
              <div class="fw-700">${esc(data.target || host)}</div>
              <span class="badge ${cls}"><span class="dot"></span>${esc(t(data.status) || data.status)}</span>
            </div>
            <dl class="kv text-sm">
              <dt>${esc(t("host"))}</dt><dd class="mono">${esc(data.host)}</dd>
              <dt>${esc(t("port"))}</dt><dd>${esc(data.port)}</dd>
              <dt>${esc(t("tls"))}</dt><dd>${data.tls ? "ON" : "OFF"}</dd>
              <dt>${esc(t("latency"))}</dt><dd>${data.latencyMs != null ? data.latencyMs + " ms" : "—"}</dd>
              ${data.httpStatus ? `<dt>HTTP</dt><dd>${esc(data.httpStatus)}</dd>` : ""}
              ${data.error ? `<dt>Error</dt><dd class="text-bad">${esc(data.error)}</dd>` : ""}
              <dt>${esc(t("time"))}</dt><dd>${esc(fmtDate(data.ts))}</dd>
            </dl>
          </div>`;
      } catch (e) {
        box.innerHTML = `<div class="alert alert-danger">${esc(e.message)}</div>`;
      } finally {
        btn.disabled = false;
      }
    };
  };

  // -------- Traffic --------
  ROUTES.traffic = async (view) => {
    view.innerHTML = `
      <div class="page-head">
        <div><h2>${esc(t("traffic"))}</h2></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${esc(t("username"))}</th>
            <th>${esc(t("upload"))}</th>
            <th>${esc(t("download_lbl"))}</th>
            <th>Total</th>
            <th>${esc(t("quota"))}</th>
            <th>${esc(t("remaining"))}</th>
          </tr></thead>
          <tbody id="tRows"></tbody>
        </table>
      </div>
    `;
    const { data: users } = await api("/users");
    const tb = $("#tRows");
    if (!users.length) {
      tb.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-ico">◌</div>
        <div class="empty-title">${esc(t("no_data"))}</div></div></td></tr>`;
      return;
    }
    tb.innerHTML = users.map((u) => {
      const tr = trafficOf(u);
      return `<tr>
        <td class="fw-700">${esc(u.username)}</td>
        <td>${fmtBytes(tr.up)}</td>
        <td>${fmtBytes(tr.down)}</td>
        <td>${fmtBytes(tr.total)}</td>
        <td>${tr.limit ? fmtBytes(tr.limit) : "∞"}</td>
        <td>${tr.remaining == null ? "∞" : fmtBytes(tr.remaining)}</td>
      </tr>`;
    }).join("");
  };

  // -------- Statistics --------
  ROUTES.statistics = async (view) => {
    const { data: d } = await api("/stats");
    view.innerHTML = `
      <div class="page-head">
        <div><h2>${esc(t("statistics"))}</h2></div>
      </div>
      <div class="grid cols-3 mb-3">
        ${statCard("◍", t("total_users"), d.users.total, "")}
        ${statCard("◉", t("active_users"), d.users.active, "", "ok")}
        ${statCard("◌", t("expired"), d.users.expired, "", "warn")}
        ${statCard("⛓", t("subs_count"), d.subscriptions.total, "")}
        ${statCard("⇅", t("total_traffic"), fmtBytes(d.traffic.total),
          `↑ ${fmtBytes(d.traffic.upload)} · ↓ ${fmtBytes(d.traffic.download)}`)}
        ${statCard("▦", t("logs"), d.logs.total, "")}
      </div>
      <div class="card">
        <div class="card-title">${esc(t("traffic_breakdown"))}</div>
        ${trafficBar(d.traffic)}
      </div>
    `;
  };

  // -------- Logs --------
  ROUTES.logs = async (view) => {
    view.innerHTML = `
      <div class="page-head">
        <div><h2>${esc(t("logs"))}</h2></div>
        <div class="page-actions">
          <button class="btn" id="lRefresh">↻ ${esc(t("refresh"))}</button>
        </div>
      </div>
      <div class="toolbar">
        <input type="search" id="lSearch" placeholder="${esc(t("search_ph"))}" />
        <select id="lType">
          <option value="">${esc(t("all_types"))}</option>
          <option value="auth">auth</option>
          <option value="user">user</option>
          <option value="subscription">subscription</option>
          <option value="settings">settings</option>
          <option value="security">security</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${esc(t("time"))}</th>
            <th>${esc(t("type"))}</th>
            <th>${esc(t("user"))}</th>
            <th>${esc(t("action"))}</th>
            <th>${esc(t("status"))}</th>
          </tr></thead>
          <tbody id="lRows"><tr><td colspan="5"><div class="loading-block"><div class="spinner"></div></div></td></tr></tbody>
        </table>
      </div>
    `;

    async function load() {
      const q = $("#lSearch").value.trim();
      const type = $("#lType").value;
      const params = new URLSearchParams();
      params.set("limit", "300");
      if (q) params.set("search", q);
      if (type) params.set("type", type);
      const tb = $("#lRows");
      tb.innerHTML = `<tr><td colspan="5"><div class="loading-block"><div class="spinner"></div></div></td></tr>`;
      try {
        const { data: logs } = await api("/logs?" + params.toString());
        if (!logs.length) {
          tb.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-ico">◌</div>
            <div class="empty-title">${esc(t("no_data"))}</div></div></td></tr>`;
          return;
        }
        tb.innerHTML = logs.map((l) => `<tr>
          <td class="mono text-xs">${esc(fmtDate(l.ts))}</td>
          <td><span class="badge info">${esc(l.type)}</span></td>
          <td>${esc(l.user)}</td>
          <td>${esc(l.action)}</td>
          <td>${l.status === "ok"
            ? `<span class="badge ok">ok</span>`
            : `<span class="badge bad">${esc(l.status)}</span>`}</td>
        </tr>`).join("");
      } catch (e) {
        tb.innerHTML = `<tr><td colspan="5"><div class="alert alert-danger">${esc(e.message)}</div></td></tr>`;
      }
    }
    $("#lSearch").oninput = debounce(load, 300);
    $("#lType").onchange = load;
    $("#lRefresh").onclick = load;
    await load();
  };

  function debounce(fn, ms) {
    let h;
    return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); };
  }

  // -------- Security --------
  ROUTES.security = async (view) => {
    let tg = { configured: false };
    try { tg = (await api("/telegram/status")).data; } catch {}

    view.innerHTML = `
      <div class="page-head">
        <div><h2>${esc(t("security"))}</h2></div>
      </div>
      <div class="grid cols-2">
        <div class="card">
          <div class="card-title">${esc(t("session"))}</div>
          <dl class="kv text-sm">
            <dt>${esc(t("session"))}</dt><dd>${esc(t("session_desc"))}</dd>
            <dt>${esc(t("cookie"))}</dt><dd>${esc(t("cookie_desc"))}</dd>
            <dt>${esc(t("rate_limit"))}</dt><dd>${esc(t("rate_desc"))}</dd>
            <dt>${esc(t("secrets"))}</dt><dd>${esc(t("secrets_desc"))}</dd>
          </dl>
        </div>
        <div class="card">
          <div class="card-title">${esc(t("telegram"))}</div>
          <dl class="kv text-sm">
            <dt>${esc(t("status"))}</dt>
            <dd>${tg.configured
              ? `<span class="badge ok"><span class="dot"></span>${esc(t("active"))}</span>`
              : `<span class="badge muted">${esc(t("not_configured"))}</span>`}</dd>
          </dl>
          <div class="row mt-3">
            <button class="btn btn-sm btn-primary" id="tgTest" ${tg.configured ? "" : "disabled"}>
              ${esc(t("telegram_test"))}
            </button>
          </div>
        </div>
      </div>
    `;

    const btn = $("#tgTest");
    if (btn && !btn.disabled) {
      btn.onclick = async () => {
        btn.disabled = true;
        try { await api("/telegram/test", { method: "POST" }); toast("✓", "ok"); }
        catch (e) { toast(e.message, "err"); }
        finally { btn.disabled = false; }
      };
    }
  };

  // -------- Advanced --------
  ROUTES.advanced = async (view) => {
    const s = await ensureSettings(true);

    view.innerHTML = `
      <div class="page-head">
        <div><h2>${esc(t("advanced"))}</h2></div>
      </div>
      <div class="grid cols-2">
        <div class="card">
          <div class="card-title">${esc(t("hosts"))}</div>
          <label class="field"><span class="field-label">${esc(t("site_name"))}</span>
            <input type="text" id="st-name" value="${esc(s.siteName || "")}" /></label>
          <label class="field"><span class="field-label">${esc(t("default_host"))}</span>
            <input type="text" id="st-host" value="${esc(s.defaultHost || "")}" placeholder="example.com" /></label>
          <label class="field"><span class="field-label">${esc(t("sni"))}</span>
            <input type="text" id="st-sni" value="${esc(s.sni || "")}" placeholder="example.com" /></label>
          <label class="field"><span class="field-label">${esc(t("tls_ports"))}</span>
            <input type="text" id="st-tls" value="${esc((s.tlsPorts || []).join(","))}" placeholder="443,8443" /></label>
          <label class="field"><span class="field-label">${esc(t("nontls_ports"))}</span>
            <input type="text" id="st-nontls" value="${esc((s.nonTlsPorts || []).join(","))}" placeholder="80,8080" /></label>
          <div class="alert alert-info text-sm">${esc(t("network_note"))}</div>
        </div>
        <div class="card">
          <div class="card-title">${esc(t("subscription_settings"))}</div>
          <label class="field"><span class="field-label">${esc(t("sub_base_url"))}</span>
            <input type="text" id="st-suburl" value="${esc(s.subscription?.baseUrl || "")}" placeholder="${esc(location.origin)}" /></label>
          <label class="field"><span class="field-label">${esc(t("sub_path"))}</span>
            <input type="text" id="st-subpath" value="${esc(s.subscription?.path || "/api/sub")}" /></label>

          <div class="divider"></div>
          <div class="card-title">${esc(t("session"))}</div>
          <label class="field"><span class="field-label">${esc(t("session_ttl"))}</span>
            <input type="number" id="st-ttl" value="${Number(s.session?.ttlDays || 7)}" min="1" max="90" /></label>

          <div class="row mt-2">
            <button class="btn btn-primary" id="st-save">${esc(t("save"))}</button>
          </div>
        </div>
      </div>
    `;

    $("#st-save").onclick = async () => {
      const parsePorts = (v) => String(v).split(",").map((x) => Number(x.trim())).filter(Boolean);
      const btn = $("#st-save");
      btn.disabled = true;
      try {
        await api("/settings", { method: "PUT", body: {
          siteName: $("#st-name").value.trim(),
          defaultHost: $("#st-host").value.trim(),
          sni: $("#st-sni").value.trim(),
          tlsPorts: parsePorts($("#st-tls").value),
          nonTlsPorts: parsePorts($("#st-nontls").value),
          subscription: {
            baseUrl: $("#st-suburl").value.trim(),
            path: $("#st-subpath").value.trim(),
          },
          session: { ttlDays: Number($("#st-ttl").value) || 7 },
        }});
        state.settings = null;
        toast(t("saved"), "ok");
      } catch (e) { toast(e.message, "err"); }
      finally { btn.disabled = false; }
    };
  };

  // -------- About --------
  ROUTES.about = async (view) => {
    view.innerHTML = `
      <div class="page-head"><div><h2>${esc(t("about"))}</h2></div></div>
      <div class="card" style="max-width:640px">
        <div class="row" style="gap:14px;margin-bottom:16px">
          <div class="brand-mark" style="width:56px;height:56px;border-radius:14px;font-size:26px">A</div>
          <div>
            <div class="fw-800" style="font-size:20px">Abulix Panel</div>
            <div class="text-muted text-sm">v1.0.0 · Netlify Edge</div>
          </div>
        </div>
        <dl class="kv text-sm">
          <dt>${esc(t("runtime"))}</dt><dd>Netlify Edge Functions</dd>
          <dt>${esc(t("storage"))}</dt><dd>Netlify Blobs</dd>
          <dt>${esc(t("auth_lbl"))}</dt><dd>HMAC-SHA256 session cookie</dd>
          <dt>${esc(t("protocols"))}</dt><dd>VLESS · VMess · Trojan · Shadowsocks</dd>
          <dt>${esc(t("formats"))}</dt><dd>URI · Base64 · Clash · sing-box · Surge · Quantumult X</dd>
        </dl>
      </div>
    `;
  };

  // ============================================================
  // BOOT
  // ============================================================
  async function boot() {
    applyTheme();
    applyLang();

    // Auth check
    try {
      const { data } = await api("/auth/me", { silent: true });
      state.me = data;
      const chip = $("#userChip");
      if (chip) chip.textContent = data.username;
    } catch (e) {
      location.replace("/login");
      return;
    }

    // Init route from hash
    const hash = (location.hash || "").replace(/^#/, "");
    if (hash && NAV_ITEMS.some((n) => n.route === hash)) state.route = hash;

    renderNav();
    await render();

    // Wire topbar
    const logout = $("#logoutBtn");
    if (logout) logout.onclick = async () => {
      try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
      location.replace("/login");
    };

    const menuBtn = $("#menuBtn");
    if (menuBtn) menuBtn.onclick = openDrawer;

    const backdrop = $("#drawerBackdrop");
    if (backdrop) backdrop.onclick = closeDrawer;

    const themeBtn = $("#themeToggle");
    if (themeBtn) themeBtn.onclick = () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("abulix.theme", state.theme);
      applyTheme();
    };

    const langBtn = $("#langToggle");
    if (langBtn) langBtn.onclick = () => {
      state.lang = state.lang === "fa" ? "en" : "fa";
      localStorage.setItem("abulix.lang", state.lang);
      applyLang();
      renderNav();
      render();
    };

    // Hash change navigation
    window.addEventListener("hashchange", () => {
      const h = (location.hash || "").replace(/^#/, "");
      if (h && NAV_ITEMS.some((n) => n.route === h) && h !== state.route) {
        state.route = h;
        renderNav();
        render();
      }
    });

    // Close drawer on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeDrawer();
    });
  }

  // Expose for console debugging (harmless)
  window.__abulix = { state, api, toast, navigate };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();