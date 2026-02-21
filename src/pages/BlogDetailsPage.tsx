import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { API_BASE_URL, API_ORIGIN } from "@/lib/api";

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  author?: string | null;
  category?: string | null;
  thumbnail?: string | null;

  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;

  created_at?: string | null;
}

type BlogDetailsProps = {
  prerenderData?: {
    blog?: Blog;
  };
};

const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/+$/, "");
const resolveAssetUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
};

export default function BlogDetailsPage({ prerenderData }: BlogDetailsProps) {
  const { slug } = useParams();

  const initialBlog = prerenderData?.blog ?? null;

  const [blog, setBlog] = useState<Blog | null>(initialBlog);
  const [loading, setLoading] = useState<boolean>(!initialBlog);

  useEffect(() => {
    if (!slug) return;

    // ✅ If prerender already injected the same blog, do not refetch immediately
    if (blog?.slug === slug) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBlog(data);
      } catch {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const cleanHtml = useMemo(() => {
    const raw = blog?.content ?? "";
    if (!raw) return "";

    // During prerender/build: do not touch DOM, return raw HTML as-is
    if (typeof window === "undefined") return raw;

    let decoded = raw;

    if (decoded.includes("&lt;") || decoded.includes("&gt;")) {
      try {
        const txt = document.createElement("textarea");
        txt.innerHTML = decoded;
        decoded = txt.value;
      } catch {}
    }

    return DOMPurify.sanitize(decoded);
  }, [blog?.content]);

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  if (!blog) return <div className="max-w-4xl mx-auto p-6">Blog not found.</div>;

  const metaTitle = blog.meta_title?.trim() || blog.title;
  const metaDesc = blog.meta_description?.trim() || blog.description;
  const metaKeywords: string = blog.keywords?.trim() || "";

  const canonical = SITE_URL ? `${SITE_URL}/blogs/${blog.slug}` : "";
  const ogImage = resolveAssetUrl(blog.thumbnail);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet prioritizeSeoTags>
        <title key="title">{metaTitle}</title>

        <meta key="meta-description" name="description" content={metaDesc} />
        {metaKeywords ? (
          <meta key="meta-keywords" name="keywords" content={metaKeywords} />
        ) : null}

        {canonical ? <link key="canonical" rel="canonical" href={canonical} /> : null}

        {/* Open Graph */}
        <meta key="og-title" property="og:title" content={metaTitle} />
        <meta key="og-description" property="og:description" content={metaDesc} />
        {canonical ? <meta key="og-url" property="og:url" content={canonical} /> : null}
        <meta key="og-type" property="og:type" content="article" />
        {ogImage ? <meta key="og-image" property="og:image" content={ogImage} /> : null}

        {/* Twitter */}
        <meta key="tw-card" name="twitter:card" content="summary_large_image" />
        <meta key="tw-title" name="twitter:title" content={metaTitle} />
        <meta key="tw-description" name="twitter:description" content={metaDesc} />
        {ogImage ? <meta key="tw-image" name="twitter:image" content={ogImage} /> : null}
      </Helmet>

      {blog.thumbnail ? (
        <img
          src={resolveAssetUrl(blog.thumbnail)}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
      ) : null}

      <div className="text-sm text-gray-500 mb-2">
        {blog.category ? <span className="mr-2">{blog.category}</span> : null}
        {blog.author ? <span>• {blog.author}</span> : null}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
      {blog.description ? <p className="text-gray-700 mb-6">{blog.description}</p> : null}

      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  );
}
