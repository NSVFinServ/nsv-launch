import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { API_BASE_URL } from "@/lib/api";
import { ArrowLeft } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  slug: string;

  description?: string | null;  // ✅ DB column
  content?: string | null;      // (optional for list)

  thumbnail?: string | null;
  created_at?: string | null;

  author?: string | null;
  category?: string | null;

  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;

  is_published?: number | boolean;
}

const resolveUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
};

const stripMarkdown = (s: string) =>
  s
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const BlogsSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow overflow-hidden animate-pulse"
      >
        <div className="h-48 bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
        </div>
      </div>
    ))}
  </div>
);

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/blogs`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = `Failed to load blogs (${res.status})`;
          try {
            const err = await res.json();
            msg = err?.message || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as Blog[];
        setBlogs(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // --- SEO (Landing page) ---
  const siteBase = "https://nsvfinserv.com"; // ✅ change if different
  const pageUrl = `${siteBase}/blogs`;
  const title = "Blogs & Financial Insights | NSV Finserv";
  const description =
    "Read expert blogs and financial articles by nsvfinserv on loans, credit, EMIs, and smart money decisions to help you plan your financial future.";

  // --- JSON-LD for Blog list ---
  const blogListJsonLd = useMemo(() => {
  if (!blogs.length) return null;

  const items = blogs.slice(0, 20).map((b, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${siteBase}/blogs/${b.slug}`,
    name: b.title,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "NSV Finserv Blog",
    itemListElement: items,
  };
}, [blogs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        {/* JSON-LD */}
       {blogListJsonLd && (
  <script type="application/ld+json">
    {JSON.stringify(blogListJsonLd)}
  </script>
)}
      </Helmet>

      {/* HERO */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Blogs & Financial Insights
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Loan guidance, CIBIL tips, eligibility insights & smart finance by NSV Finserv.
          </p>
        </div>
      </div>
      {/*Back to Home Page*/}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {loading && <BlogsSkeleton count={6} />}

        {!loading && error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="text-center text-gray-500">No blogs published yet.</p>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gray-200">
                  {blog.thumbnail && (
                    <img
                      src={resolveUrl(blog.thumbnail)}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Body */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                  
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {stripMarkdown(blog.description || "") ||
                        stripMarkdown(blog.content || "").slice(0, 160)}
                    </p>
                  
                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Read article →
                    </Link>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
