import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { API_BASE_URL } from "@/lib/api";

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const resolveUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const stripMarkdown = (s: string) =>
  s
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const DetailsSkeleton = () => (
  <div className="max-w-3xl mx-auto p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
    <div className="h-64 bg-gray-200 rounded mb-6" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-9/12" />
    </div>
  </div>
);

export default function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = `Failed to load blog (${res.status})`;
          try {
            const err = await res.json();
            msg = err?.message || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as Blog;
        setBlog(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [slug]);

  const siteBase = "https://nsvfinserv.com"; // ✅ change if different

  const seo = useMemo(() => {
    if (!blog) return null;

    const pageUrl = `${siteBase}/blogs/${blog.slug}`;
    const imageUrl = resolveUrl(blog.thumbnail);

    const raw = blog.excerpt?.trim()
      ? blog.excerpt
      : blog.content?.slice(0, 240) || "";

    const description = stripMarkdown(raw).slice(0, 160);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description,
      url: pageUrl,
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: blog.created_at || undefined,
      dateModified: blog.updated_at || blog.created_at || undefined,
      author: {
        "@type": "Organization",
        name: "NSV Finserv",
      },
      publisher: {
        "@type": "Organization",
        name: "NSV Finserv",
        // If you have a logo URL, add it:
        // logo: { "@type": "ImageObject", url: `${siteBase}/logo.png` }
      },
    };

    return { pageUrl, imageUrl, description, jsonLd };
  }, [blog]);

  if (loading) return <DetailsSkeleton />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/blogs" className="text-blue-600 hover:text-blue-800">
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  if (!blog || !seo) return null;

  return (
    <>
      {/* SEO + JSON-LD */}
      <Helmet>
        <title>{blog.title} | NSV Finserv</title>
        <meta name="description" content={seo.description} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.pageUrl} />
        {seo.imageUrl && <meta property="og:image" content={seo.imageUrl} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.imageUrl && <meta name="twitter:image" content={seo.imageUrl} />}

        <script type="application/ld+json">
          {JSON.stringify(seo.jsonLd)}
        </script>
      </Helmet>

      {/* PAGE */}
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/blogs" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Blogs
        </Link>

        <h1 className="text-3xl font-bold mt-4">{blog.title}</h1>

        {blog.created_at && (
          <p className="text-gray-500 text-sm mt-1">{blog.created_at}</p>
        )}

        {blog.thumbnail && (
          <img
            src={seo.imageUrl}
            alt={blog.title}
            className="my-6 rounded-lg w-full"
            loading="lazy"
          />
        )}

        {/* ✅ Markdown rendering (safe) */}
        <article className="prose prose-gray max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {blog.content}
          </ReactMarkdown>
        </article>
      </div>
    </>
  );
}
