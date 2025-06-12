
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = "admin";
const AUTH_STORAGE_KEY = "isAdminAuthenticated";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial client-side load
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage for auth:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username: string): boolean => {
    if (username.toLowerCase() === ADMIN_USERNAME) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Error setting localStorage for auth:", error);
        return false;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing localStorage for auth:", error);
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
