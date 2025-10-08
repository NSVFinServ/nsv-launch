// API Configuration for deployment
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/** Join the API base with a path that starts with '/' */
export const withApi = (path: string) => `${API_BASE_URL}${path}`;
