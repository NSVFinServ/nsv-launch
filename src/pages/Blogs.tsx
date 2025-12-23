import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs`)
      .then(res => res.json())
      .then(setBlogs);
  }, []);

  return (
    <div>
      <h1>Blogs</h1>
      {blogs.map((b: any) => (
        <div key={b.id}>{b.title}</div>
      ))}
    </div>
  );
};

export default Blogs;
