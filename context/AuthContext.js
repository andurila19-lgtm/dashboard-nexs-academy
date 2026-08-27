'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Mock users
const MOCK_USERS = [
  {
    id: 'admin-1',
    name: 'Admin NEXS',
    email: 'admin@nexs.com',
    password: 'admin123',
    role: 'admin',
    phone: '081234567890',
    status: 'Aktif'
  },
  {
    id: 'pengajar-1',
    name: 'Sensei Tanaka',
    email: 'tanaka@nexs.com',
    password: 'sensei123',
    role: 'pengajar',
    phone: '081234567891',
    status: 'Aktif'
  },
  {
    id: 'pengajar-2',
    name: 'Sensei Yamamoto',
    email: 'yamamoto@nexs.com',
    password: 'sensei123',
    role: 'pengajar',
    phone: '081234567892',
    status: 'Aktif'
  },
  {
    id: 'pengajar-3',
    name: 'Sensei Suzuki',
    email: 'suzuki@nexs.com',
    password: 'sensei123',
    role: 'pengajar',
    phone: '081234567893',
    status: 'Aktif'
  },
  {
    id: 'pengajar-4',
    name: 'Sensei Nakamura',
    email: 'nakamura@nexs.com',
    password: 'sensei123',
    role: 'pengajar',
    phone: '081234567894',
    status: 'Aktif'
  },
  {
    id: 'pengajar-5',
    name: 'Sensei Watanabe',
    email: 'watanabe@nexs.com',
    password: 'sensei123',
    role: 'pengajar',
    phone: '081234567895',
    status: 'Aktif'
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    try {
      const saved = localStorage.getItem('nexs_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const user = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    if (user) {
      const userInfo = { ...user };
      delete userInfo.password;
      setCurrentUser(userInfo);
      localStorage.setItem('nexs_user', JSON.stringify(userInfo));
      return { success: true, user: userInfo };
    }
    return { success: false, error: 'Email atau password salah' };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('nexs_user');
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isPengajar = currentUser?.role === 'pengajar';

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      logout,
      isAdmin,
      isPengajar,
      MOCK_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
