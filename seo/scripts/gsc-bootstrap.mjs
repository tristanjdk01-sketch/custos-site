#!/usr/bin/env node
// Confirm the service account has access to the GSC property, submit the
// sitemap, then run URL Inspection on the key pages.
// Adapted from NPU Labs' handover; retargeted to custosza.com via config.mjs.
// Requires GCP setup (service account + Owner on the GSC property).
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { resolve } from "node:path";
import { GSC_SITE, SITEMAP_URL, URLS } from "./config.mjs";

function b64url(x) {
  return (Buffer.isBuffer(x) ? x : Buffer.from(x))
    .toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
async function mint(sa, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${head}.${body}`);
  const sig = b64url(signer.sign(sa.private_key));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${body}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j));
  return j.access_token;
}

if (!process.env.GCP_SA_KEY_PATH) {
  console.error("GCP_SA_KEY_PATH not set in .env. Complete the GCP/GSC setup first (see seo/README.md).");
  process.exit(1);
}
const sa = JSON.parse(readFileSync(resolve(process.cwd(), process.env.GCP_SA_KEY_PATH), "utf8"));
const token = await mint(sa, ["https://www.googleapis.com/auth/webmasters"]);

// 1) List sites — confirms SA has access
console.log("=== Verifying SA access ===");
const sites = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());
const mine = (sites.siteEntry || []).find((s) => s.siteUrl === GSC_SITE);
if (!mine) {
  console.error("SA does not have access to", GSC_SITE);
  console.error("Sites visible:", (sites.siteEntry || []).map((s) => `${s.siteUrl} (${s.permissionLevel})`));
  process.exit(1);
}
console.log(`  ${GSC_SITE} -> ${mine.permissionLevel}`);

// 2) Submit sitemap
console.log("\n=== Submitting sitemap ===");
const subRes = await fetch(
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`,
  { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
);
console.log(`  PUT ${SITEMAP_URL} -> ${subRes.status} ${subRes.status === 200 ? "OK" : await subRes.text()}`);

// 3) List sitemaps to confirm
const list = await fetch(
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps`,
  { headers: { Authorization: `Bearer ${token}` } }
).then((r) => r.json());
for (const sm of list.sitemap || []) {
  console.log(`  registered: ${sm.path}  isPending=${sm.isPending}  lastSubmitted=${sm.lastSubmitted}`);
}

// 4) URL Inspection
console.log("\n=== URL Inspection ===");
for (const u of URLS) {
  const r = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: u, siteUrl: GSC_SITE }),
  });
  const j = await r.json();
  const idx = j.inspectionResult?.indexStatusResult;
  console.log(`  ${u}`);
  console.log(`    verdict=${idx?.verdict || "?"}  coverage="${idx?.coverageState || "?"}"  robots=${idx?.robotsTxtState || "?"}`);
}
