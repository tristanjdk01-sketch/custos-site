#!/usr/bin/env node
// Enable the SEO-related Google APIs in the GCP project using the
// service-account JSON key. Mints a JWT, exchanges for an access
// token, then calls serviceusage.services.enable per API.
//
// Run: node scripts/gcp/enable-apis.mjs
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

const KEY_PATH = process.env.GCP_SA_KEY_PATH;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
if (!KEY_PATH || !PROJECT_ID) {
  console.error("Missing GCP_SA_KEY_PATH or GCP_PROJECT_ID in .env");
  process.exit(1);
}

const APIS = [
  "pagespeedonline.googleapis.com",
  "searchconsole.googleapis.com",
  "indexing.googleapis.com",
  "serviceusage.googleapis.com",
];

const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function mintAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const sig = signer.sign(sa.private_key);
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`token mint failed ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function enableApi(token, api) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${api}:enable`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

const sa = JSON.parse(readFileSync(resolve(process.cwd(), KEY_PATH), "utf8"));
console.log(`Project: ${PROJECT_ID}`);
console.log(`SA:      ${sa.client_email}`);

const token = await mintAccessToken(sa);
console.log("Access token minted.");

for (const api of APIS) {
  process.stdout.write(`  enabling ${api} ... `);
  try {
    const r = await enableApi(token, api);
    if (r.ok) {
      const parsed = JSON.parse(r.body);
      const done = parsed.done === true || parsed.name?.includes("operations");
      console.log(done ? "OK" : `OK (op: ${parsed.name})`);
    } else {
      console.log(`FAIL ${r.status}`);
      console.log(`    ${r.body.slice(0, 400)}`);
    }
  } catch (e) {
    console.log(`ERR ${e.message}`);
  }
}
