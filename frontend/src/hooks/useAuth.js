'use client';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      let token = localStorage.getItem('accessToken');
      let userData = localStorage.getItem('user');
      
      if (!token) {
        token = sessionStorage.getItem('accessToken');
        userData = sessionStorage.getItem('user');
      }
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, accessToken, refreshToken, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('user', JSON.stringify(userData));
    
    // Clear the other storage to avoid conflicts
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem('accessToken');
    otherStorage.removeItem('refreshToken');
    otherStorage.removeItem('user');
    
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, logout, loading, checkAuth };
};