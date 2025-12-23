useEffect(() => {
  fetch(`${API_BASE_URL}/blogs`)
    .then(res => res.json())
    .then(setBlogs);
}, []);
