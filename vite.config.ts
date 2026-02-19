import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import vitePrerender from "vite-plugin-prerender";
import path from "path";

const Renderer = vitePrerender.PuppeteerRenderer;

export default defineConfig(async () => {
  // Prefer env var, fallback to your known Render API
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL ||
    "https://nsvfinserv-api.onrender.com/api";

  // Fetch blog slugs at build time
  let blogRoutes: string[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();
    const published = Array.isArray(data)
      ? data.filter((b: any) => b?.is_published)
      : [];

    blogRoutes = published
      .map((b: any) => b?.slug)
      .filter(Boolean)
      .map((slug: string) => `/blogs/${slug}`);
  } catch {
    // If API is temporarily down during build, at least prerender core routes
    blogRoutes = [];
  }

  const routes = ["/", "/blogs", ...blogRoutes];

  return {
    plugins: [
      react(),
      vitePrerender({
        staticDir: path.join(__dirname, "dist"),
        routes,
        renderer: new Renderer({
          // Wait until our app says it's ready (we dispatch this event in the pages)
          renderAfterDocumentEvent: "prerender-ready"
        })
      })
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": resolve("./src")
      }
    },
    optimizeDeps: {
      exclude: ["lucide-react"]
    }
  };
});
