# Custos SEO toolkit

SEO control plane for `custosza.com`: PageSpeed/Lighthouse audits, Google
Search Console sitemap submission, and URL inspection.

Adapted from a handover toolkit (originally written for NPU Labs / Next.js)
and retargeted to the Custos Astro site. The domain and route list live in
one place: `scripts/config.mjs` (override `SITE_URL` via `.env`).

## Status (what works, what's pending)

| Capability | Status |
|---|---|
| Scripts retargeted to custosza.com | Done (via `config.mjs`) |
| PSI audit reaches the live site | Confirmed working |
| PSI audit returns scores | Blocked on the shared keyless quota (HTTP 429). Needs your own `PSI_API_KEY`. |
| GSC sitemap submit / URL inspection | Needs GCP service account + Owner on the GSC property (human setup) |
| A sitemap to submit | **Not built yet** — the Astro site has no `sitemap.xml` / `robots.txt` / per-page meta yet. This is the next foundation task. |

## Quick start (audit only, no Google setup)

```bash
cd seo
cp .env.example .env       # SITE_URL defaults to https://custosza.com
npm install
npm run audit              # PSI Lighthouse audit, all pages, mobile + desktop
```

If you hit `429 Quota exceeded`, the shared anonymous PSI quota is exhausted.
Create your own key (see setup below) and put it in `.env` as `PSI_API_KEY`.

## Commands

| Command | What it does |
|---|---|
| `npm run audit` | Lighthouse scores (Perf/A11y/BP/SEO) for every page, mobile + desktop |
| `npm run contrast` | Contrast-failure audit across all pages |
| `npm run a11y -- /approach` | Detailed accessibility breakdown for one page |
| `npm run gsc` | Submit sitemap + URL inspection (requires GCP/GSC setup) |

## One-time Google setup (human steps — only you can do these)

These need a logged-in human; Google won't trust an automated agent:

1. **Create a GCP project** at <https://console.cloud.google.com> (e.g. `custos-seo-2026`).
2. **Create a service account** (`seo-automation`), add a **JSON key**, save it to
   `seo/.secrets/gcp-seo-sa.json` (gitignored). Treat it like a password.
3. **Verify `custosza.com`** in <https://search.google.com/search-console> using a
   **Domain** property (covers www + https). Add the TXT record it gives you to
   Cloudflare DNS, click Verify.
4. **Add the service-account email as Owner** in GSC → Settings → Users and permissions.
5. Fill in `seo/.env`: `GCP_PROJECT_ID`, `GCP_SA_KEY_PATH`, and (after step 6) `PSI_API_KEY`.
6. `node scripts/enable-apis.mjs` then `node scripts/create-api-key.mjs`, paste the key into `.env`.
7. `npm run gsc` — should confirm access, submit the sitemap, and inspect URLs.

## Safety

- `.env`, `.secrets/`, and any `*-sa.json` are gitignored. Never commit them.
- Never paste the SA JSON or `PSI_API_KEY` into chat. If a key leaks, revoke it
  in GCP Console → IAM → Service Accounts → Keys and re-create.

## Note on the sitemap

These scripts submit `${SITE_URL}/sitemap-index.xml`. The Astro site does not yet
generate a sitemap. The next foundation task adds `@astrojs/sitemap` (which emits
`sitemap-index.xml`), `robots.txt`, per-page meta, and JSON-LD schema. Until then,
`npm run gsc` will submit a sitemap URL that 404s.
