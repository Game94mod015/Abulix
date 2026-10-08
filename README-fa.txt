ABULIX PANEL — NETLIFY EDGE (نسخه کامل)

این بسته از Worker بزرگ Abulix Panel ساخته شده و UI/مسیرهای اصلی آن را نگه می‌دارد.
KV کلادفلر با Netlify Blobs جایگزین شده است؛ D1 اختیاری کلادفلر عمداً استفاده نمی‌شود.

1) کل این پوشه را در GitHub یک Repository جدید قرار بده.
2) در Netlify: Add new project -> Import an existing project -> GitHub.
3) Repository را انتخاب کن.
4) Build command را خالی بگذار.
5) Publish directory را خالی بگذار.
6) Deploy site را بزن.

متغیرهای محیطی را در:
Project configuration -> Environment variables
با Scope مربوط به Functions تنظیم کن.

حداقل این متغیر را بساز:
ADMIN = یک رمز قوی دلخواه

اختیاری:
KEY = یک کلید دلخواه برای پنل
BACKEND_URL = آدرس بک‌اند/VPS اگر در پنل استفاده می‌کنی
ENABLE_BACKEND = true

بعد از تغییر Environment Variables باید دوباره Deploy کنی تا Edge Function مقدار جدید را ببیند.

تست:
https://YOUR-SITE.netlify.app/healthz

نکته مهم:
بخش WebSocket/relay این Worker برای Cloudflare Workers نوشته شده و Netlify Edge همان API WebSocketPair کلادفلر را ارائه نمی‌کند؛ بنابراین ممکن است خود پنل، لاگین، کاربران، اشتراک و ابزارهای HTTP کار کنند ولی Relay مبتنی بر WebSocket نیاز به backend جدا یا سازگار با Netlify داشته باشد.

همچنین توکن ربات تلگرام را داخل کد نگذار. توکنی که قبلاً در چت فرستاده شد را در BotFather باطل و یک توکن جدید بساز؛ سپس فقط در Environment Variables قرار بده اگر نسخه‌ای که از آن استفاده می‌کنی به آن نیاز دارد.
