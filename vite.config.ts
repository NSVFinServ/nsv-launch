import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import path from "path";

export default defineConfig(async () => {
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "https://nsvfinserv-api.onrender.com/api";

  // Fetch slugs at build-time to prerender /blogs/:slug
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

  return {
    plugins: [
      react(),
      vitePrerenderPlugin({
        renderTarget: "#root", // change if your index.html uses a different root
        prerenderScript: path.resolve(__dirname, "src/prerender.tsx"),
        additionalPrerenderRoutes: ["/", "/blogs", ...blogRoutes]
      })
    ],
    resolve: {
      alias: { "@": resolve("./src") },
      dedupe: ["react", "react-dom"]
    }
  };
});
