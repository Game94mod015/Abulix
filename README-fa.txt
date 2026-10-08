Abulix Panel — Netlify v4

Deploy this folder as a Netlify site. The Edge Function is:
netlify/edge-functions/panel.js

Routes:
/          -> /admin
/admin     -> panel
/admin/    -> panel
/healthz   -> JSON health check from the Edge Function

Required:
- Netlify Edge Functions enabled
- @netlify/blobs dependency available (package.json included)

Do not hardcode Telegram bot tokens. Set secrets as Netlify environment variables.
