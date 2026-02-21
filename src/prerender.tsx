import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./Router";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://nsvfinserv-api.onrender.com/api";

async function getPrerenderData(url: string) {
  // /blogs -> list
  if (url === "/blogs") {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    return { blogs: Array.isArray(data) ? data : [] };
  }

  // /blogs/:slug -> details
  const m = url.match(/^\/blogs\/([^/]+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`);
    const blog = await res.json();
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
        {/* Provide data via a global script the client can reuse */}
        <AppRoutes prerenderData={prerenderData as any} />
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;

  const head =
    (helmet?.title?.toString?.() || "") +
    (helmet?.meta?.toString?.() || "") +
    (helmet?.link?.toString?.() || "") +
    (helmet?.script?.toString?.() || "");

  const dataScript = `<script>window.__PRERENDER_DATA__=${JSON.stringify(
    prerenderData
  ).replace(/</g, "\\u003c")}</script>`;

  return { html, head: head + dataScript };
}
