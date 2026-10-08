import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../config/axios';

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
  //   This avoids the expensive Firebase handshake (getIdToken + POST /auth/google
  //   + GET /members/me = 3 sequential network calls) on every page load.
  //   If the JWT has expired the backend returns 401, which the axios interceptor
  //   catches and fires auth:logout to clear state.
  //
  // SLOW PATH (no token stored):
  //   Subscribe to Firebase onAuthStateChanged once. If Firebase still has
  //   an active session (e.g. localStorage was cleared), exchange the Firebase
  //   ID token for a fresh JWT. Unsubscribe immediately after the first event
  //   to prevent duplicate state updates.
  // ============================================================
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      // Fast path: restore session from existing JWT (1 API call instead of 3)
      api.get('/auth/me')
        .then(async ({ data }) => {
          const userData = data.data;
          const pending  = await checkMemberPending(userData);
          setUser(userData);
          setToken(storedToken);
          setIsPending(pending);
        })
        .catch(() => {
          // JWT is invalid or expired — clear storage
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsPending(false);
        })
        .finally(() => setLoading(false));

      return; // skip Firebase listener when fast path is taken
    }

    // Slow path: no JWT stored — check Firebase session
    let settled = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (settled) return;
      settled = true;
      unsubscribe(); // one-shot: unsubscribe right away

      try {
        if (firebaseUser) {
          // Firebase has a session but no JWT in storage — exchange for a new one
          const idToken  = await firebaseUser.getIdToken();
          const { data } = await api.post('/auth/google', { idToken });
          const jwtToken = data.data.token;
          const userData = data.data.user;

          localStorage.setItem('token', jwtToken);

          const pending = await checkMemberPending(userData);

          setUser(userData);
          setToken(jwtToken);
          setIsPending(pending);
        }
        // No Firebase session + no stored JWT: stay logged-out (defaults are null/false)
      } catch (error) {
        console.error('Auth state rehydration error:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsPending(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Global 401 handler fired by the axios response interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
      setIsPending(false);
      signOut(auth).catch(() => {});
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
