// Shared config for the Custos SEO toolkit.
// Single source of truth for the domain and the routes we audit/inspect.
// Adapted from NPU Labs' handover toolkit, retargeted to custosza.com and
// parameterised so the site URL lives in one place (.env override supported).
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

// SITE_URL can be overridden in .env; defaults to production.
export const SITE_URL = (process.env.SITE_URL || "https://custosza.com").replace(/\/$/, "");

// Google Search Console property id. Domain-property form covers http/https/www.
export const GSC_SITE = process.env.GSC_SITE || `sc-domain:${SITE_URL.replace(/^https?:\/\//, "")}`;

export const SITEMAP_URL = `${SITE_URL}/sitemap-index.xml`;

// The routes that currently exist on the Custos Astro site.
export const ROUTES = [
  "/",
  "/approach",
  "/services",
  "/writing",
  "/about",
  "/contact",
];

export const URLS = ROUTES.map((r) => (r === "/" ? `${SITE_URL}/` : `${SITE_URL}${r}`));

export function label(url) {
  return url.replace(SITE_URL, "") || "/";
}
