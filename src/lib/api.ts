// src/lib/api.ts
// Centralized API helpers and services. All requests go through API_BASE_URL.
// Ensure on Vercel you set: VITE_API_BASE_URL=https://nsvfinserv-api.onrender.com/api

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
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  // @ts-ignore allow text fallback
  return (await res.text()) as T;
}

/** Convenience to build a full API URL */
export const withApi = (path: string) => `${API_BASE_URL}${path}`;

/* ==================== Feature-specific services ==================== */
/* Note: If your backend uses slightly different routes, adjust the paths here. */

/** Reviews */
export const reviewsAPI = {
  getAll: () => apiFetch('/reviews'),
  create: (payload: any) =>
    apiFetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  remove: (id: string | number) =>
    apiFetch(`/reviews/${id}`, { method: 'DELETE' }),
};

/** Events */
export const eventsAPI = {
  getAll: () => apiFetch('/events'),
};

/** Testimonial videos */
export const videosAPI = {
  getAll: () => apiFetch('/testimonial-videos'),
};

/** Regulatory updates/news */
export const regulatoryAPI = {
  getAll: () => apiFetch('/regulatory-updates'),
};

/** Eligibility calculator */
export const eligibilityAPI = {
  // Change '/eligibility/calculate' if your backend route differs
  calculate: (payload: any) =>
    apiFetch('/eligibility/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

/** Loan application/admin */
export const loanAPI = {
  // public user submit
  apply: (payload: any) =>
    apiFetch('/loan-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  // admin list
  list: () => apiFetch('/loan-applications'),
  // admin status change
  updateStatus: (id: string | number, status: string) =>
    apiFetch(`/loan-applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
};

/** Lightweight analytics */
export const trackAPI = {
  click: (payload: any) =>
    apiFetch('/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};
