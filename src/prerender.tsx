import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRoutes from "./Router"; // (we’ll create this shared route tree)

export async function prerender(data: { url: string }) {
  const html = renderToString(
    <StaticRouter location={data.url}>
      <AppRoutes />
    </StaticRouter>
  );

  return { html };
}
