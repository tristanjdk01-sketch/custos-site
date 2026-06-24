#!/usr/bin/env node
// Create a restricted API key in the GCP project for the
// PageSpeed Insights API. Prints the key string on success;
// you should drop it in .env as PSI_API_KEY.
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

const KEY_PATH = process.env.GCP_SA_KEY_PATH;
const PROJECT_ID = process.env.GCP_PROJECT_ID;

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
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${body}.${sig}` }),
  });
  return (await r.json()).access_token;
}

const sa = JSON.parse(readFileSync(resolve(process.cwd(), KEY_PATH), "utf8"));
const token = await mint(sa);

// 1) Ensure apikeys.googleapis.com is enabled
const enableRes = await fetch(
  `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/apikeys.googleapis.com:enable`,
  { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: "{}" }
);
console.log(`enable apikeys API: ${enableRes.status}`);

// 2) Create the key
const createRes = await fetch(
  `https://apikeys.googleapis.com/v2/projects/${PROJECT_ID}/locations/global/keys?keyId=npu-seo-key`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: "NPU Labs SEO automation",
      restrictions: {
        apiTargets: [
          { service: "pagespeedonline.googleapis.com" },
          { service: "searchconsole.googleapis.com" },
        ],
      },
    }),
  }
);
const op = await createRes.json();
console.log("create op:", op.name, "done:", op.done);

if (!op.done) {
  // Poll
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const pollRes = await fetch(`https://apikeys.googleapis.com/v2/${op.name}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const poll = await pollRes.json();
    if (poll.done) {
      console.log("op done.");
      Object.assign(op, poll);
      break;
    }
  }
}

// 3) Fetch the actual key string
const keyName = op.response?.name;
if (!keyName) {
  console.error("No key name in response:", JSON.stringify(op, null, 2));
  process.exit(1);
}
const stringRes = await fetch(`https://apikeys.googleapis.com/v2/${keyName}/keyString`, {
  headers: { Authorization: `Bearer ${token}` },
});
const stringJson = await stringRes.json();
console.log("\nAPI KEY:", stringJson.keyString);
console.log(`\nAdd to .env:\nPSI_API_KEY=${stringJson.keyString}`);
