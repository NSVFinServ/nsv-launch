export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/** Generic fetch that throws on non-2xx and returns JSON or text */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  // @ts-ignore text fallback
  return (await res.text()) as T;
}

/** Build a full API URL */
export const withApi = (path: string) => `${API_BASE_URL}${path}`;

/* ================= Services exported as named symbols ================ */

export const eligibilityAPI = {
  // adjust path if your backend differs
  calculate: (payload: any) =>
    apiFetch('/eligibility/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

export const reviewsAPI = {
  getAll: () => apiFetch('/reviews'),
  create: (payload: any) =>
    apiFetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  remove: (id: string | number) => apiFetch(`/reviews/${id}`, { method: 'DELETE' }),
};

export const eventsAPI = {
  getAll: () => apiFetch('/events'),
};

export const videosAPI = {
  getAll: () => apiFetch('/testimonial-videos'),
};

export const regulatoryAPI = {
  getAll: () => apiFetch('/regulatory-updates'),
};

export const loanAPI = {
  apply: (payload: any) =>
    apiFetch('/loan-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  list: () => apiFetch('/loan-applications'),
  updateStatus: (id: string | number, status: string) =>
    apiFetch(`/loan-applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
};

export const trackAPI = {
  click: (payload: any) =>
    apiFetch('/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

/** Optional default export so `import api from '../lib/api'` also works */
const api = {
  API_BASE_URL,
  apiFetch,
  withApi,
  eligibilityAPI,
  reviewsAPI,
  eventsAPI,
  videosAPI,
  regulatoryAPI,
  loanAPI,
  trackAPI,
};
export default api;
