import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.VITE_SITE_URL || "https://www.nsvfinserv.com").replace(/\/+$/, "");
const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://nsvfinserv-api.onrender.com/api";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");
const ROBOTS_PATH = path.join(PUBLIC_DIR, "robots.txt");

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function fetchBlogs() {
  const url = `${API_BASE_URL}/blogs`;
  const res = await fetch(url, { headers: { accept: "application/json" } });

  if (!res.ok) {
    throw new Error(`Failed to fetch blogs from ${url} (${res.status})`);
  }

  const data = await res.json();
  const list = Array.isArray(data) ? data : [];

  // Keep only published blogs
  const published = list.filter((b) => b && (b.is_published === true || b.is_published === 1));

  // Extract slugs
  const slugs = published
    .map((b) => (typeof b.slug === "string" ? b.slug.trim() : ""))
    .filter(Boolean);

  return slugs;
}

function buildSitemap(urls) {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  return body;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  let slugs = [];
  try {
    slugs = await fetchBlogs();
  } catch (err) {
    // If API is down during build, still write a minimal sitemap so deployment succeeds
    console.warn("[sitemap] Warning:", err?.message || err);
    slugs = [];
  }

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/blogs`,
    ...slugs.map((slug) => `${SITE_URL}/blogs/${encodeURIComponent(slug)}`),
  ];

  const xml = buildSitemap(urls);
  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
  console.log(`[sitemap] Wrote ${SITEMAP_PATH} with ${urls.length} URLs`);

  // Optional but recommended: generate robots.txt too
  fs.writeFileSync(ROBOTS_PATH, buildRobots(), "utf8");
  console.log(`[robots] Wrote ${ROBOTS_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
