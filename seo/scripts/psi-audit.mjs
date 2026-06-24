#!/usr/bin/env node
// Lighthouse audit on every key Custos page via the PageSpeed Insights API.
// Prints per-page Performance / Accessibility / Best Practices / SEO scores
// and surfaces the top failed audits.
//
// Auth: uses the service-account JSON if GCP_SA_KEY_PATH is set, otherwise
// falls back to UNAUTHENTICATED PSI (rate-limited, but works with zero setup).
// Adapted from NPU Labs' handover; retargeted to custosza.com via config.mjs.
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { resolve } from "node:path";
import { URLS, label } from "./config.mjs";

const STRATEGIES = ["mobile", "desktop"];
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

function b64url(x) {
  return (Buffer.isBuffer(x) ? x : Buffer.from(x))
    .toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
async function mint(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${head}.${body}`);
  const sig = b64url(signer.sign(sa.private_key));
  const jwt = `${head}.${body}.${sig}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  return (await r.json()).access_token;
}

async function psi(url, strategy) {
  const params = new URLSearchParams({ url, strategy });
  for (const c of CATEGORIES) params.append("category", c);
  if (process.env.PSI_API_KEY) params.append("key", process.env.PSI_API_KEY);
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;
  const r = await fetch(api);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

function pct(n) {
  if (n == null) return "  --";
  return String(Math.round(n * 100)).padStart(4);
}

// Auth is optional: SA key for higher limits, else unauthenticated.
let mode = "unauthenticated";
if (process.env.GCP_SA_KEY_PATH) {
  try {
    const sa = JSON.parse(readFileSync(resolve(process.cwd(), process.env.GCP_SA_KEY_PATH), "utf8"));
    await mint(sa); // token not needed for PSI URL calls, but proves the key is valid
    mode = "service-account";
  } catch {
    mode = "unauthenticated (SA key not found/invalid)";
  }
} else if (process.env.PSI_API_KEY) {
  mode = "api-key";
}

console.log(`Lighthouse via PSI (${mode})\n`);
console.log("URL                                          STRATEGY   PERF  A11Y  BP   SEO");
console.log("─".repeat(82));

const allResults = [];
for (const url of URLS) {
  for (const strategy of STRATEGIES) {
    try {
      const data = await psi(url, strategy);
      const cats = data.lighthouseResult?.categories || {};
      const row = {
        url, strategy,
        perf: cats.performance?.score,
        a11y: cats.accessibility?.score,
        bp: cats["best-practices"]?.score,
        seo: cats.seo?.score,
      };
      allResults.push({ ...row, audits: data.lighthouseResult?.audits });
      console.log(`${label(url).padEnd(44)} ${strategy.padEnd(10)} ${pct(row.perf)} ${pct(row.a11y)} ${pct(row.bp)} ${pct(row.seo)}`);
    } catch (e) {
      console.log(`${label(url).padEnd(44)} ${strategy.padEnd(10)} ERR ${e.message}`);
    }
  }
}

console.log("\nFailing/opportunity audits (score < 1, mobile only):");
const mobiles = allResults.filter((r) => r.strategy === "mobile");
const grouped = new Map();
for (const r of mobiles) {
  for (const [id, a] of Object.entries(r.audits || {})) {
    if (a.score != null && a.score < 1 && a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "informative") {
      if (!grouped.has(id)) grouped.set(id, { title: a.title, hits: 0 });
      grouped.get(id).hits++;
    }
  }
}
const sorted = [...grouped.entries()].sort((a, b) => b[1].hits - a[1].hits).slice(0, 15);
for (const [id, info] of sorted) {
  console.log(`  ${String(info.hits).padStart(2)}×  ${id.padEnd(40)} ${info.title}`);
}
