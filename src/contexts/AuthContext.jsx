import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send Firebase token to our backend
      const { data } = await api.post('/auth/google', { idToken });
      
      const jwtToken = data.data.token;
      const userData = data.data.user;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout').catch(() => {});
      }
    } finally {
      await signOut(auth).catch(() => {});
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
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
    loginWithGoogle,
    logout,
    isAuthenticated: !!token && !!user,
    isManager: user?.role === 'manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
