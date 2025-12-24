import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  created_at: string;
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs`)
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

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
      {/*Back to Home*/}
      <Link
          to="/"
          className="inline-flex items-center text-gray-900 hover:text-gray-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      
      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        {loading && (
          <p className="text-center text-gray-500">Loading blogs...</p>
        )}

        {!loading && blogs.length === 0 && (
          <p className="text-center text-gray-500">No blogs published yet.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gray-200">
                {blog.thumbnail && (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt}
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

      </div>
    </div>
  );
};

export default BlogsPage;
