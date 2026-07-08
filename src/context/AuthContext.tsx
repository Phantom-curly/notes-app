import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';// then use `${API_BASE}/api/register`

console.log('🔵 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('🔵 PROD?', import.meta.env.PROD);

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = async (email: string, password: string) => {
  console.log('🔵 Login called, API_BASE:', API_BASE); // Debug
  console.log('🔵 Full URL:', `${API_BASE}/api/login`); // Debug

  const response = await fetch('https://notes-app-tpma.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  setUser(data.user);
  setToken(data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
};

  const register = async (email: string, password: string) => {
    const response = await fetch('https://notes-app-tpma.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    console.log('Logout called');

    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
