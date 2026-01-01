import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { API_BASE_URL } from "@/lib/api";

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

const SITE_URL = import.meta.env.VITE_SITE_URL || ""; // set in Vercel env if you want canonical

export default function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/blogs/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBlog(data);
      } catch (e) {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const cleanHtml = useMemo(() => {
    return blog?.content ? DOMPurify.sanitize(blog.content) : "";
  }, [blog?.content]);

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  if (!blog) return <div className="max-w-4xl mx-auto p-6">Blog not found.</div>;

  const metaTitle = blog.meta_title?.trim() || blog.title;
  const metaDesc = blog.meta_description?.trim() || blog.description;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        {blog.keywords?.trim() ? <meta name="keywords" content={blog.keywords} /> : null}
        {SITE_URL ? <link rel="canonical" href={`${SITE_URL}/blog/${blog.slug}`} /> : null}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
      </Helmet>

      {blog.thumbnail ? (
        <img src={blog.thumbnail} alt={blog.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : null}

      <div className="text-sm text-gray-500 mb-2">
        {blog.category ? <span className="mr-2">{blog.category}</span> : null}
        {blog.author ? <span>• {blog.author}</span> : null}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

      {blog.description ? <p className="text-gray-700 mb-6">{blog.description}</p> : null}

      {/* ✅ Render Quill HTML safely */}
      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  );
}
