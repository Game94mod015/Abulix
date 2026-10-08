راهنمای نصب Abulix Panel روی Netlify Edge

1) وارد Netlify شوید و یک Site بسازید.
2) این پوشه را به یک repository در GitHub/GitLab/Bitbucket منتقل کنید:
   netlify/
   netlify.toml

3) در Netlify از Add new project / Import an existing project، repository را انتخاب کنید.
4) Build command را خالی بگذارید؛ این پروژه build ندارد.
5) Publish directory را خالی بگذارید.
6) Deploy را بزنید.

مسیر اصلی:
   https://DOMAIN/

Health check:
   https://DOMAIN/healthz

نکته:
- Edge Function از مسیر /* اجرا می‌شود.
- KV و D1 لازم نیست.
- پنل فعلی از همان رمز داخل فایل استفاده می‌کند.
- برای امنیت بهتر، رمز را hard-code نکنید و بعداً آن را به Netlify Environment Variable منتقل کنید.

Netlify Edge Functions از runtime مبتنی بر Deno استفاده می‌کنند و فایل‌ها باید در netlify/edge-functions قرار بگیرند.
