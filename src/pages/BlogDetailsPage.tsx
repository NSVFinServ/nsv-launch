import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type BlogDetails = {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string | null;
  created_at?: string | null;
};

export default function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [blog, setBlog] = useState<BlogDetails | null>(null);
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
          // try to read backend message (optional)
          let msg = `Failed to load blog (${res.status})`;
          try {
            const errData = await res.json();
            msg = errData?.message || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as BlogDetails;
        setBlog(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [slug]);

  if (loading) return <p className="p-6">Loading...</p>;

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

  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/blogs" className="text-sm text-blue-600 hover:text-blue-800">
        ← Back to Blogs
      </Link>

      <h1 className="text-3xl font-bold mt-3">{blog.title}</h1>
      {blog.created_at && <p className="text-gray-500">{blog.created_at}</p>}

      {blog.thumbnail && (
        <img src={blog.thumbnail} alt={blog.title} className="my-6 rounded-lg w-full" />
      )}

      <div className="whitespace-pre-wrap leading-7">{blog.content}</div>
    </div>
  );
}
