import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { Prerenderer, PuppeteerRenderer } from "vite-prerender-plugin";
import path from "path";

export default defineConfig(async () => {
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL ||
    "https://nsvfinserv-api.onrender.com/api";

  let blogRoutes: string[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    const published = Array.isArray(data) ? data.filter((b: any) => b?.is_published) : [];
    blogRoutes = published
      .map((b: any) => b?.slug)
      .filter(Boolean)
      .map((slug: string) => `/blogs/${slug}`);
  } catch {
    blogRoutes = [];
  }

  const routes = ["/", "/blogs", ...blogRoutes];

  return {
    plugins: [
      react(),
      Prerenderer({
        staticDir: path.join(__dirname, "dist"),
        routes,
        renderer: new PuppeteerRenderer({
          renderAfterDocumentEvent: "prerender-ready"
        })
      })
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: { "@": resolve("./src") }
    },
    optimizeDeps: {
      exclude: ["lucide-react"]
    }
  };
});
