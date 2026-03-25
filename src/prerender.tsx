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

function parseTagElements(html: string, type: string) {
  const elements: Array<{ type: string; props: Record<string, string> }> = [];
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

  return elements;
}

function parseScriptElements(html: string) {
  const elements: Array<{ type: string; props: Record<string, string> }> = [];
  const scriptRegex = /<script\s+([^>]*?)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html))) {
    const attrs = match[1];
    const inner = match[2];
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

function helmetToElements(helmet: any) {
  const elements: Array<{ type: string; props: Record<string, string> }> = [];

  // Normal helmet output
  elements.push(...parseTagElements(helmet?.meta?.toString?.() || "", "meta"));
  elements.push(...parseTagElements(helmet?.link?.toString?.() || "", "link"));
  elements.push(...parseScriptElements(helmet?.script?.toString?.() || ""));

  // IMPORTANT: prioritized SEO tags from react-helmet-async
  const priorityHtml = helmet?.priority?.toString?.() || "";
  elements.push(...parseTagElements(priorityHtml, "meta"));
  elements.push(...parseTagElements(priorityHtml, "link"));

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
      elements,
    },
  };
}
