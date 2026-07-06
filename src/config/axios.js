import axios from 'axios';

/**
 * Axios instance pre-configured with base URL and auth header injection.
 * All API service functions import this instead of raw axios.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handle 401 globally — clear token (but don't redirect; React Router handles it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token on a genuine 401 from the server (invalid/expired JWT).
    // Do NOT log out on network errors (error.response is undefined) or other
    // status codes – those are handled per-request.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Fire a custom event so AuthContext can react without a hard redirect
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
