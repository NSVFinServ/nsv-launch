const SITE_URL = "https://www.nsvfinserv.com";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://nsvfinserv-api.onrender.com/api";

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req: any, res: any) {
  try {
    const r = await fetch(`${API_BASE_URL}/blogs`, {
      headers: { accept: "application/json" },
    });
    const data = await r.json();
    const published = Array.isArray(data)
      ? data.filter((b: any) => b?.is_published)
      : [];

    const urls = [
      `${SITE_URL}/`,
      `${SITE_URL}/blogs`,
      ...published.map((b: any) => `${SITE_URL}/blogs/${encodeURIComponent(b.slug)}`),
    ];

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map((u) => `<url><loc>${xmlEscape(u)}</loc></url>`).join("") +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(body);
  } catch (e: any) {
    res.status(500).send("sitemap error");
  }
}
