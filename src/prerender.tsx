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
  try {
    if (url === "/blogs") {
      const res = await fetch(`${API_BASE_URL}/blogs`);
      if (!res.ok) return { blogs: [] };
      const data = await safeJson(res);
      return { blogs: Array.isArray(data) ? data : [] };
    }

    const match = url.match(/^\/blogs\/([^/]+)$/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`);
      if (!res.ok) return { blog: null };
      const blog = await safeJson(res);
      return { blog: blog ?? null };
    }
  } catch {
    if (url === "/blogs") return { blogs: [] };
    if (url.startsWith("/blogs/")) return { blog: null };
  }

  return {};
}

function helmetToElements(helmet: any) {
  const elements: Array<{ type: string; props: Record<string, string> }> = [];

  const pushTagMatches = (html: string, type: string) => {
    const tagRegex = new RegExp(`<${type}\\s+([^>]*?)(?:\\/?>)`, "gi");
    let match;
    while ((match = tagRegex.exec(html))) {
      const attrs = match[1];
      const props: Record<string, string> = {};
      const attrRegex = /([:@A-Za-z0-9_-]+)="([^"]*)"/g;
      let a;
      while ((a = attrRegex.exec(attrs))) {
        props[a[1]] = a[2];
      }
      elements.push({ type, props });
    }
  };

  pushTagMatches(helmet?.meta?.toString?.() || "", "meta");
  pushTagMatches(helmet?.link?.toString?.() || "", "link");

  const scriptHtml = helmet?.script?.toString?.() || "";
  const scriptRegex = /<script\s+([^>]*?)>([\s\S]*?)<\/script>/gi;
  let s;
  while ((s = scriptRegex.exec(scriptHtml))) {
    const attrs = s[1];
    const inner = s[2];
    const props: Record<string, string> = {};
    const attrRegex = /([:@A-Za-z0-9_-]+)="([^"]*)"/g;
    let a;
    while ((a = attrRegex.exec(attrs))) {
      props[a[1]] = a[2];
    }
    if (inner && inner.trim()) {
      props.children = inner;
    }
    elements.push({ type: "script", props });
  }

  return elements;
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
  const rawTitle = helmet?.title?.toString?.() || "";
  const titleMatch = rawTitle.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : undefined;

  const elements = helmetToElements(helmet);

  return {
    html,
    data: prerenderData,
    head: {
      title,
      elements: new Set(elements),
    },
  };
}
