import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../config/axios';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/** Helper to decode JWT payload safely without external library */
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/** Helper to check whether a JWT token is expired (with 60-second safety window) */
const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now() + 60000;
};

/** Check whether the current member has an active profile.
 *  Returns true if they are pending (no profile or not active).
 *  Always returns false for managers. */
const checkMemberPending = async (userData) => {
  if (!userData || userData.role !== 'member') return false;
  try {
    const { data: memberData } = await api.get('/members/me');
    return !memberData.data || memberData.data.status !== 'active';
  } catch (err) {
    // Only treat genuine 404 (member profile record not found) as pending.
    // Temporary network or 5xx errors should never lock members out.
    if (err?.response?.status === 404) return true;
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  // Synchronous initial state from localStorage:
  // If the user already authenticated and their 30-day token is still unexpired,
  // we restore their credentials instantly so they never see /login when visiting the app.
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    return stored && !isTokenExpired(stored) ? stored : null;
  });

  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || isTokenExpired(storedToken)) return null;

      const cachedUser = localStorage.getItem('user');
      if (cachedUser) return JSON.parse(cachedUser);

      // Reconstruct minimal user from valid JWT payload if full object not yet cached
      const payload = decodeJwtPayload(storedToken);
      if (payload?.id) {
        return {
          _id: payload.id,
          id: payload.id,
          role: payload.role || 'member',
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isPending, setIsPending] = useState(() => {
    return localStorage.getItem('isPending') === 'true';
  });

  // If we already have a valid unexpired token & user info, start with loading = false
  // so the user immediately lands on their dashboard without bouncing through /login.
  const [loading, setLoading] = useState(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || isTokenExpired(storedToken)) return true;
    try {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) return false;
      const payload = decodeJwtPayload(storedToken);
      return !payload?.id;
    } catch {
      return true;
    }
  });

  /** Called by PendingPage "Refresh" button so a newly-activated member can
   *  re-check their status without a full page reload. */
  const refreshPendingStatus = useCallback(async () => {
    if (!user) return;
    const pending = await checkMemberPending(user);
    setIsPending(pending);
    localStorage.setItem('isPending', String(pending));
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      const result  = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const { data } = await api.post('/auth/google', { idToken });
      const jwtToken = data.data.token;
      const userData = data.data.user;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Resolve pending status BEFORE updating state so there is no flash
      const pending = await checkMemberPending(userData);
      localStorage.setItem('isPending', String(pending));

      setUser(userData);
      setToken(jwtToken);
      setIsPending(pending);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout').catch(() => {});
    } finally {
      await signOut(auth).catch(() => {});
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isPending');
      setToken(null);
      setUser(null);
      setIsPending(false);
    }
  };

  // ============================================================
  // Session Restoration & Background Validation
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');

      // ── FAST PATH: Valid unexpired JWT in storage ───────────────
      if (storedToken && !isTokenExpired(storedToken)) {
        try {
          // Validate / refresh user info in background without blocking navigation
          const { data } = await api.get('/auth/me');
          if (!isMounted) return;

          const userData = data.data;
          const pending  = await checkMemberPending(userData);

          setUser(userData);
          setToken(storedToken);
          setIsPending(pending);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isPending', String(pending));
          setLoading(false);
          return;
        } catch (err) {
          // If server explicitly returned 401/403, axios interceptor attempted renewal.
          // If renewal failed or token is genuinely revoked:
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            // Fall through to Firebase check below
          } else {
            // Cold start / timeout / temporary 5xx network glitch:
            // DO NOT log out! The JWT is cryptographically valid for 30 days.
            if (isMounted) {
              setLoading(false);
            }
            return;
          }
        }
      }

      // ── SLOW PATH / FALLBACK: Check Firebase Auth session ───────
      try {
        if (typeof auth.authStateReady === 'function') {
          await auth.authStateReady();
        }

        let firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          firebaseUser = await new Promise((resolve) => {
            const timer = setTimeout(() => resolve(null), 5000);
            const unsub = onAuthStateChanged(auth, (u) => {
              clearTimeout(timer);
              unsub();
              resolve(u);
            });
          });
        }

        if (firebaseUser) {
          const idToken  = await firebaseUser.getIdToken();
          
          // Exchange Firebase token for backend JWT (with retry on cold start)
          let responseData = null;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const res = await api.post('/auth/google', { idToken });
              responseData = res.data;
              break;
            } catch (postErr) {
              if (attempt === 0 && !postErr.response) {
                // Retry once after 2 seconds if server is waking up
                await new Promise((r) => setTimeout(r, 2000));
              } else {
                throw postErr;
              }
            }
          }

          if (!isMounted || !responseData) return;

          const jwtToken = responseData.data.token;
          const userData = responseData.data.user;

          localStorage.setItem('token', jwtToken);
          localStorage.setItem('user', JSON.stringify(userData));

          const pending = await checkMemberPending(userData);
          localStorage.setItem('isPending', String(pending));

          setUser(userData);
          setToken(jwtToken);
          setIsPending(pending);
        } else {
          // No Firebase session and no valid stored JWT: user is logged out
          if (isMounted) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isPending');
            setUser(null);
            setToken(null);
            setIsPending(false);
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
        const isAuthError = err?.response?.status === 401 || err?.response?.status === 403;
        if (isMounted && isAuthError) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isPending');
          setUser(null);
          setToken(null);
          setIsPending(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Global auth event handlers ────────────────────────────────────────────
  useEffect(() => {
    // Fired by the axios interceptor when a JWT expired but Firebase successfully
    // issued a new one. Update state without logging the user out.
    const handleTokenRenewed = (e) => {
      const { token: newToken, user: newUser } = e.detail || {};
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        if (newUser) {
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        }
      }
    };

    // Fired when renewal is impossible (no Firebase session, account disabled, etc.).
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
      setIsPending(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isPending');
      signOut(auth).catch(() => {});
    };

    window.addEventListener('auth:tokenRenewed', handleTokenRenewed);
    window.addEventListener('auth:logout',       handleAuthLogout);

    return () => {
      window.removeEventListener('auth:tokenRenewed', handleTokenRenewed);
      window.removeEventListener('auth:logout',       handleAuthLogout);
    };
  }, []);

  const value = {
    user,
    token,
    loading,
    isPending,
    loginWithGoogle,
    logout,
    refreshPendingStatus,
    isAuthenticated: !!token && !!user,
    isManager: user?.role === 'manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <LoadingSpinner fullPage message="Loading Home…" />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
