import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../config/axios';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/** Check whether the current member has an active profile.
 *  Returns true if they are pending (no profile or not active).
 *  Always returns false for managers. */
const checkMemberPending = async (userData) => {
  if (!userData || userData.role !== 'member') return false;
  try {
    const { data: memberData } = await api.get('/members/me');
    return !memberData.data || memberData.data.status !== 'active';
  } catch {
    return true; // treat errors as pending
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading]     = useState(true);
  const [isPending, setIsPending] = useState(false);

  /** Called by PendingPage "Refresh" button so a newly-activated member can
   *  re-check their status without a full page reload. */
  const refreshPendingStatus = useCallback(async () => {
    if (!user) return;
    const pending = await checkMemberPending(user);
    setIsPending(pending);
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

      // Resolve pending status BEFORE updating state so there is no flash
      const pending = await checkMemberPending(userData);

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
      setToken(null);
      setUser(null);
      setIsPending(false);
    }
  };

  // ============================================================
  // Session Restoration on Mount
  //
  // FAST PATH (token exists in localStorage):
  //   Validate the stored JWT with a single GET /auth/me call.
  //   This avoids the expensive Firebase handshake on every page load.
  //   If the JWT has expired, the axios interceptor will silently renew
  //   it via Firebase and retry the request transparently.
  //
  // SLOW PATH / REHYDRATION (no token stored or initial visit):
  //   Wait for Firebase authStateReady, then exchange the Firebase ID token
  //   for a fresh backend JWT without requiring user interaction.
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. Ensure browserLocalPersistence is active
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        // Silently continue if already configured or unsupported
      }

      const storedToken = localStorage.getItem('token');

      // FAST PATH: Token found in localStorage
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/me');
          if (!isMounted) return;

          const userData = data.data;
          const pending  = await checkMemberPending(userData);

          setUser(userData);
          setToken(storedToken);
          setIsPending(pending);
          setLoading(false);
          return;
        } catch {
          // If /auth/me failed and axios interceptor renewal also failed,
          // storedToken is invalid/expired. Fall through to verify Firebase session.
        }
      }

      // SLOW PATH / FALLBACK: Check Firebase auth session
      try {
        if (typeof auth.authStateReady === 'function') {
          await auth.authStateReady();
        }

        let firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          firebaseUser = await new Promise((resolve) => {
            const timer = setTimeout(() => resolve(null), 2500);
            const unsub = onAuthStateChanged(auth, (u) => {
              clearTimeout(timer);
              unsub();
              resolve(u);
            });
          });
        }

        if (firebaseUser) {
          const idToken  = await firebaseUser.getIdToken();
          const { data } = await api.post('/auth/google', { idToken });
          if (!isMounted) return;

          const jwtToken = data.data.token;
          const userData = data.data.user;

          localStorage.setItem('token', jwtToken);

          const pending = await checkMemberPending(userData);

          setUser(userData);
          setToken(jwtToken);
          setIsPending(pending);
        } else {
          if (isMounted) {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsPending(false);
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
        if (isMounted) {
          localStorage.removeItem('token');
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
        if (newUser) setUser(newUser);
      }
    };

    // Fired when renewal is impossible (no Firebase session, account disabled, etc.).
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
      setIsPending(false);
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
