import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import path from "path";
import { vitePrerenderPlugin } from "vite-prerender-plugin";

export default defineConfig(async () => {
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "https://nsvfinserv-api-h7nt.onrender.com/api";

  let blogRoutes: string[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    const data = await res.json();

    const published = Array.isArray(data)
      ? data.filter((b: any) => b && (b.is_published === 1 || b.is_published === true))
      : [];

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
        renderTarget: "#root",
        prerenderScript: path.resolve(__dirname, "src/prerender.tsx"),
        additionalPrerenderRoutes: ["/", "/blogs", ...blogRoutes],
        addCopyScript: false,
      }),
    ],
    resolve: {
      alias: { "@": resolve("./src") },
      dedupe: ["react", "react-dom"],
    },
    ssr: {
      noExternal: ["react-helmet-async"],
    },
  };
});
