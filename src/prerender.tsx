import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./Router";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://nsvfinserv-api-h7nt.onrender.com/api";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function getPrerenderData(url: string) {
  if (url === "/blogs") {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    if (!res.ok) return { blogs: [] };
    const data = await safeJson(res);
    return { blogs: Array.isArray(data) ? data : [] };
  }

  const m = url.match(/^\/blogs\/([^/]+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`);
    if (!res.ok) return { blog: null };
    const blog = await safeJson(res);
    return { blog };
  }

  return {};
}

export async function prerender(data: { url: string }) {
  const helmetContext: any = {};
  const prerenderData = await getPrerenderData(data.url);

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={data.url}>
        <AppRoutes prerenderData={prerenderData as any} />
      </StaticRouter>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  const head =
    (helmet?.title?.toString?.() || "") +
    (helmet?.meta?.toString?.() || "") +
    (helmet?.link?.toString?.() || "") +
    (helmet?.script?.toString?.() || "");

  const dataScript = `<script>window.__PRERENDER_DATA__=${JSON.stringify(
    prerenderData
  ).replace(/</g, "\\u003c")}</script>`;

  return {
    html,
    head: head + dataScript,
  };
}
