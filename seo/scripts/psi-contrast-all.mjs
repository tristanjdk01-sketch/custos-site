#!/usr/bin/env node
// Contrast-failure audit across every Custos page (mobile).
// Groups identical contrast failures and lists which pages hit each.
// Adapted from NPU Labs' handover; retargeted via config.mjs.
import { URLS, label } from "./config.mjs";

const patterns = new Map();
for (const url of URLS) {
  const params = new URLSearchParams({ url, strategy: "mobile", category: "accessibility" });
  if (process.env.PSI_API_KEY) params.append("key", process.env.PSI_API_KEY);
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;
  try {
    const r = await fetch(api);
    if (!r.ok) { console.log(`${label(url)}: ERR ${r.status}`); continue; }
    const data = await r.json();
    const audit = data.lighthouseResult?.audits?.["color-contrast"];
    if (audit && audit.score != null && audit.score < 1) {
      for (const item of audit.details?.items || []) {
        const key = item.node?.snippet || item.node?.selector || "unknown";
        if (!patterns.has(key)) patterns.set(key, { urls: new Set(), explanation: item.node?.explanation || "" });
        patterns.get(key).urls.add(label(url));
      }
    }
  } catch (e) {
    console.log(`${label(url)}: ERR ${e.message}`);
  }
}

if (patterns.size === 0) {
  console.log("No contrast failures found across audited pages. ✓");
} else {
  console.log(`Contrast failures (${patterns.size} distinct):\n`);
  for (const [snippet, info] of patterns) {
    console.log(`  pages: ${[...info.urls].join(", ")}`);
    console.log(`  element: ${snippet.slice(0, 120)}`);
    if (info.explanation) console.log(`  ${info.explanation.slice(0, 120)}`);
    console.log("");
  }
}
