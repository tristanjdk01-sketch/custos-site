#!/usr/bin/env node
// Detailed accessibility breakdown for one URL (default: home).
// Usage: node scripts/psi-a11y-details.mjs [path-or-url]
// Adapted from NPU Labs' handover; retargeted via config.mjs.
import { SITE_URL } from "./config.mjs";

const arg = process.argv[2];
const url = !arg ? `${SITE_URL}/` : arg.startsWith("http") ? arg : `${SITE_URL}${arg.startsWith("/") ? "" : "/"}${arg}`;

const params = new URLSearchParams({ url, strategy: "mobile", category: "accessibility" });
if (process.env.PSI_API_KEY) params.append("key", process.env.PSI_API_KEY);
const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`);
if (!r.ok) { console.error(`${r.status} ${(await r.text()).slice(0, 200)}`); process.exit(1); }
const data = await r.json();

const cat = data.lighthouseResult?.categories?.accessibility;
console.log(`Accessibility for ${url}: ${cat ? Math.round(cat.score * 100) : "?"}\n`);

const audits = data.lighthouseResult?.audits || {};
const failing = Object.entries(audits)
  .filter(([, a]) => a.score != null && a.score < 1 && a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "informative");

if (failing.length === 0) {
  console.log("No failing accessibility audits. ✓");
} else {
  for (const [id, a] of failing) {
    console.log(`✗ ${id}`);
    console.log(`  ${a.title}`);
    if (a.description) console.log(`  ${a.description.replace(/\[.*?\]\(.*?\)/g, "").slice(0, 140).trim()}`);
    const items = a.details?.items || [];
    if (items.length) console.log(`  affected elements: ${items.length}`);
    console.log("");
  }
}
