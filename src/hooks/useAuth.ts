import { useState, useEffect } from 'react';
import { User } from '@/types/user';

const AUTH_KEY = 'local-app-user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, createdAt: new Date(parsed.createdAt) };
    }
    return null;
  });

  const signUp = (username: string, displayName: string, email: string = '') => {
    const newUser: User = {
      id: crypto.randomUUID(),
      username: username.toLowerCase().replace(/\s+/g, ''),
      displayName,
      email,
      bio: '',
      createdAt: new Date(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return { user, signUp, updateUser, signOut, isAuthenticated: !!user };
};
