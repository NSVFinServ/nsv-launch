import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs/${slug}`)
      .then(res => res.json())
      .then(setBlog);
  }, [slug]);

  if (!blog) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="text-gray-500">{blog.created_at}</p>

      {blog.thumbnail && (
        <img src={blog.thumbnail} className="my-6 rounded-lg" />
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
};

export default BlogDetails;
