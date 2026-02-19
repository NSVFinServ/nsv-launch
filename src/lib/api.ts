// src/lib/api.ts
// Centralized API helpers/services. On Vercel (Production) set:
// VITE_API_BASE_URL = https://nsvfinserv-api.onrender.com/api

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = String(API_BASE_URL).replace(/\/api\/?$/, "");
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
  // @ts-ignore allow text fallback
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

// src/lib/api.ts
export const loanAPI = {
  // ✅ CREATE — this already points to the correct endpoint.
  // Just be sure the payload is: { user_id, service_id, amount, ask_expert_id? }
  apply: (payload: any) =>
    apiFetch('/loan-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // ✅ LIST — fix the path to plural to match backend GET /api/loan-applications
  list: () => apiFetch('/loan-applications'),

  // ✅ UPDATE STATUS — match backend: PUT /api/admin/loan-applications/:id  (no /status)
  updateStatus: (id: string | number, status: string) =>
    apiFetch(`/admin/loan-applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
};


/** Lightweight analytics/track */
export const trackAPI = {
  click: (payload: any) =>
    apiFetch('/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

// Provide analyticsAPI alias for files importing from './api.ts' or '../lib/api'
export const analyticsAPI = {
  trackClick: (page: string, action: string) =>
    trackAPI.click({ page, action }),
};

/** Optional default export */
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
  analyticsAPI,
};
export default api;
