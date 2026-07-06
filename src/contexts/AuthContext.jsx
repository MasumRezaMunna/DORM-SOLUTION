import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
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
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
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
      const result = await signInWithPopup(auth, googleProvider);
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

  // On mount (or token change), rehydrate user + pending status together
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const userData = data.data;
        // Resolve pending before rendering so children see a consistent state
        const pending = await checkMemberPending(userData);
        setUser(userData);
        setIsPending(pending);
      } catch {
        // Token is invalid – force logout
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsPending(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

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
