import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
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
  updated_at?: string | null;
}

type BlogDetailsProps = {
  prerenderData?: {
    blog?: Blog | null;
  };
};

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.nsvfinserv.com").replace(/\/+$/, "");

const resolveAssetUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
};

const stripHtml = (value: string) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function BlogDetailsPage({ prerenderData }: BlogDetailsProps) {
  const { slug = "" } = useParams();
  const initialBlog = prerenderData?.blog ?? null;

  const [blog, setBlog] = useState<Blog | null>(initialBlog);
  const [loading, setLoading] = useState<boolean>(!initialBlog);
  const [hasFetched, setHasFetched] = useState<boolean>(!!initialBlog);

  useEffect(() => {
    if (!slug) {
      setBlog(null);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    if (initialBlog?.slug === slug) {
      setBlog(initialBlog);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setBlog(null);
          return;
        }

        const data = await res.json();
        setBlog(data ?? null);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setBlog(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setHasFetched(true);
        }
      }
    })();

    return () => controller.abort();
  }, [slug, initialBlog]);

  const cleanHtml = useMemo(() => {
    const raw = blog?.content ?? "";
    if (!raw) return "";
    if (typeof window === "undefined") return raw;

    let decoded = raw;

    if (decoded.includes("&lt;") || decoded.includes("&gt;")) {
      try {
        const txt = document.createElement("textarea");
        txt.innerHTML = decoded;
        decoded = txt.value;
      } catch {}
    }

    return DOMPurify.sanitize(decoded, {
      ADD_TAGS: ["table", "thead", "tbody", "tr", "td", "th"],
      ADD_ATTR: ["colspan", "rowspan", "style"],
    });
  }, [blog?.content]);

  if (loading && !hasFetched) {
    return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  }

  if (!blog) {
    const missingTitle = "Page Not Found | NSV Finserv";
    const missingDescription =
      "This article could not be found on NSV Finserv. Please check the URL or browse our latest financial guides.";
    const canonicalMissing = slug ? `${SITE_URL}/blogs/${encodeURIComponent(slug)}` : `${SITE_URL}/blogs`;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Helmet prioritizeSeoTags>
          <title>{missingTitle}</title>
          <meta name="description" content={missingDescription} />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalMissing} />
        </Helmet>

        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">404</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Blog not found</h1>
          <p className="text-gray-600 mb-6">
            The requested article is unavailable. Please check the URL or browse our blog page.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition"
          >
            Browse blogs
          </Link>
        </div>
      </div>
    );
  }

  const contentText = stripHtml(cleanHtml || blog.content || "");
  const metaTitle = (blog.meta_title?.trim() || `${blog.title} | NSV Finserv`).trim();
  const metaDesc = (
    blog.meta_description?.trim() ||
    blog.description?.trim() ||
    contentText.slice(0, 155)
  ).trim();
  const metaKeywords = blog.keywords?.trim() || "";
  const canonical = `${SITE_URL}/blogs/${blog.slug}`;
  const ogImage = resolveAssetUrl(blog.thumbnail);
  const publishedTime = blog.created_at || undefined;
  const modifiedTime = blog.updated_at || blog.created_at || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: metaDesc,
    mainEntityOfPage: canonical,
    url: canonical,
    image: ogImage ? [ogImage] : undefined,
    author: blog.author
      ? {
          "@type": "Person",
          name: blog.author,
        }
      : {
          "@type": "Organization",
          name: "NSV Finserv",
        },
    publisher: {
      "@type": "Organization",
      name: "NSV Finserv",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    datePublished: publishedTime,
    dateModified: modifiedTime,
    articleSection: blog.category || undefined,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet prioritizeSeoTags>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        {metaKeywords ? <meta name="keywords" content={metaKeywords} /> : null}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonical} />

        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="NSV Finserv" />
        {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
        {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
        {blog.author ? <meta property="article:author" content={blog.author} /> : null}
        {blog.category ? <meta property="article:section" content={blog.category} /> : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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

      <article
        className="prose max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}
