const $ = (s) => document.querySelector(s);

const LANG = localStorage.getItem("abulix.lang") || "fa";
const THEME = localStorage.getItem("abulix.theme") || "dark";
if (THEME === "light") document.documentElement.dataset.theme = "light";
if (LANG === "en") {
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
  $("#lblSub").textContent = "Sign in to admin panel";
  $("#lblUser").textContent = "Username";
  $("#lblPass").textContent = "Password";
  $("#lblRemember").textContent = "Remember me";
  $("#lblLogin").textContent = "Sign in";
  document.title = "Sign in · Abulix Panel";
}

const form = $("#loginForm");
const errBox = $("#loginError");
const btn = $("#btnSubmit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errBox.hidden = true;
  const fd = new FormData(form);
  const body = {
    username: String(fd.get("username") || "").trim(),
    password: String(fd.get("password") || ""),
    remember: !!fd.get("remember"),
  };
  btn.disabled = true;
  try {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) {
      errBox.textContent = translateError(data.error || "login_failed");
      errBox.hidden = false;
      return;
    }
    location.replace("/admin/");
  } catch (err) {
    errBox.textContent = LANG === "fa" ? "خطای شبکه" : "Network error";
    errBox.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

function translateError(code) {
  const fa = {
    invalid_credentials: "نام کاربری یا رمز عبور نادرست است",
    too_many_attempts: "تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد تلاش کنید.",
    missing_credentials: "نام کاربری و رمز عبور را وارد کنید",
    login_failed: "ورود ناموفق بود",
    unauthorized: "دسترسی غیرمجاز",
  };
  const en = {
    invalid_credentials: "Invalid username or password",
    too_many_attempts: "Too many attempts. Try again later.",
    missing_credentials: "Enter username and password",
    login_failed: "Login failed",
    unauthorized: "Unauthorized",
  };
  return (LANG === "fa" ? fa : en)[code] || code;
}