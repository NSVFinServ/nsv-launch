import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./Router";

export async function prerender(data: { url: string }) {
  const helmetContext: any = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={data.url}>
        <AppRoutes />
      </StaticRouter>
    </HelmetProvider>
  );

  // vite-prerender-plugin can consume `head` if provided
  const { helmet } = helmetContext;

  const head =
    (helmet?.title?.toString?.() || "") +
    (helmet?.meta?.toString?.() || "") +
    (helmet?.link?.toString?.() || "") +
    (helmet?.script?.toString?.() || "");

  return { html, head };
}
