# Deployment checklist

## 1. Install and build

```bash
npm install
npm run lint
npm run check:assets
npm run build
```

Upload the contents of `dist/` to the website root.

## 2. SPA routing

The project includes `public/.htaccess`. It is copied to `dist/.htaccess` during build by Vite.

Keep it on Apache hosting so direct URLs like `/about`, `/team`, `/hospital`, `/kyiv/team` and direction pages open correctly after refresh.

## 3. Static assets

Some project data still uses static string paths like:

```txt
/src/assets/images/doctor-1.webp
```

The build script runs:

```bash
npm run copy:assets
```

and copies `src/assets` into `dist/src/assets`, so these URLs will work in production.

Before deployment you can verify all static asset paths:

```bash
npm run check:assets
```

## 4. SEO files

The project includes:

```txt
public/robots.txt
public/sitemap.xml
public/og-image.webp
```

`sitemap.xml` is regenerated on `npm run build`.

The sitemap domain is taken from:

```txt
VITE_SITE_URL
```

Fallback domain:

```txt
https://dr-isaenko.com
```

## 5. Contact form API

The API template is located at:

```txt
public/api/contact.php
```

After deployment, configure server environment variables:

```txt
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
CONTACT_FORM_EMAIL
SITE_URL
```

The form sends requests to `/api/contact.php` by default. The endpoint supports Telegram and email. If neither is configured, the request is logged with `error_log` and still returns success.

## 6. After deployment check

Open and refresh directly:

```txt
/
/about
/team
/hospital
/contacts
/kyiv
/kyiv/about
/psychiatry
/psychologist
```

Also check:

```txt
/robots.txt
/sitemap.xml
/og-image.webp
/api/contact.php
```

The API endpoint should not show PHP source code. If it does, PHP is not configured correctly on the server.
