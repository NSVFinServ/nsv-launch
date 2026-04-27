import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'admin' | 'intern' | null;

interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  intern_code: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  internCode: string | null;
  isAdmin: boolean;
  isIntern: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// Safe default so useAuth doesn't throw during SSR / prerender
const defaultValue: AuthContextValue = {
  user: null,
  token: null,
  role: null,
  internCode: null,
  isAdmin: false,
  isIntern: false,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultValue);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const role: UserRole = user?.role ?? null;
  const internCode = user?.intern_code ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        internCode,
        isAdmin: role === 'admin',
        isIntern: role === 'intern',
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
