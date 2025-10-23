import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Oldal betöltésekor ellenőrizzük van-e mentett token
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { token, user: savedUser } = authService.getAuthData();
    
    if (token && savedUser) {
      // Token validálása a backend-del
      const result = await authService.getProfile();
      if (result.success) {
        setUser(result.user);
      } else {
        // Token érvénytelen, töröljük
        setUser(null);
      }
    }
    
    setLoading(false);
  };

  const login = async (identifier, password, rememberMe = false) => {
    const result = await authService.login(identifier, password, rememberMe);
    
    if (result.success) {
      setUser(result.user);
    }
    
    return result;
  };

  const register = async (username, email, password, rememberMe = false) => {
    const result = await authService.register(username, email, password, rememberMe);
    
    if (result.success) {
      setUser(result.user);
    }
    
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;