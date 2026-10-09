import axios from 'axios';
import { auth } from './firebase';

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

// ─── 401 Token Renewal State ──────────────────────────────────────────────────
// Track whether a renewal is already in flight to avoid duplicate requests.
let _isRenewing = false;
let _renewQueue = [];

/**
 * Flush all queued requests after a renewal attempt.
 * @param {string|null} newToken – null means renewal failed.
 */
function _flushQueue(newToken) {
  _renewQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
      resolve(api(config));
    } else {
      reject(new Error('Session expired'));
    }
  });
  _renewQueue = [];
}

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401: attempt a silent Firebase token renewal before giving up.
// This means users are never logged out just because the JWT expired — as
// long as Firebase still has an active session.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    // Only attempt renewal on genuine 401s from OUR server.
    // Skip if it's already a retry, a network error, or the /auth/google exchange itself.
    if (
      error.response?.status !== 401 ||
      originalConfig._retried ||
      originalConfig.url?.includes('/auth/google')
    ) {
      return Promise.reject(error);
    }

    // If we are already renewing, queue this request until renewal finishes.
    if (_isRenewing) {
      return new Promise((resolve, reject) => {
        _renewQueue.push({ resolve, reject, config: originalConfig });
      });
    }

    // Mark as retried so we don't loop infinitely.
    originalConfig._retried = true;
    _isRenewing = true;

    try {
      let firebaseUser = auth.currentUser;
      if (!firebaseUser && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
        firebaseUser = auth.currentUser;
      }
      if (!firebaseUser) {
        // Wait briefly for onAuthStateChanged just in case
        firebaseUser = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve(null), 2500);
          const unsub = auth.onAuthStateChanged((u) => {
            clearTimeout(timer);
            unsub();
            resolve(u);
          });
        });
      }

      if (!firebaseUser) {
        // No Firebase session — full logout is unavoidable.
        throw new Error('No Firebase session');
      }

      // Force-refresh the Firebase ID token (bypasses local cache).
      const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);

      // Exchange Firebase ID token for a new backend JWT.
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/google`,
        { idToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newToken = data?.data?.token;
      if (!newToken) throw new Error('Renewal response missing token');

      localStorage.setItem('token', newToken);

      // Notify AuthContext of the fresh user data (role, etc.) without logout.
      window.dispatchEvent(
        new CustomEvent('auth:tokenRenewed', { detail: { token: newToken, user: data.data.user } })
      );

      // Flush queued requests with the new token.
      _flushQueue(newToken);

      // Retry the original failed request.
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    } catch {
      // Renewal failed — now it's safe to log out.
      _flushQueue(null);
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    } finally {
      _isRenewing = false;
    }
  }
);

export default api;
