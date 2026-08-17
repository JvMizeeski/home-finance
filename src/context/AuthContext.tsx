import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_USERS } from '../lib/constants';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  addUser: (name: string, role: 'husband' | 'wife' | 'custom', color?: string) => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('financas_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved users", e);
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedId = localStorage.getItem('financas_current_user_id');
    const found = availableUsers.find(u => u.id === savedId);
    return found || availableUsers[0];
  });

  useEffect(() => {
    localStorage.setItem('financas_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  useEffect(() => {
    localStorage.setItem('financas_current_user_id', currentUser.id);
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const found = availableUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addUser = (name: string, role: 'husband' | 'wife' | 'custom', color?: string): UserProfile => {
    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      name,
      role,
      avatarColor: color || (role === 'wife' ? 'bg-rose-500' : role === 'husband' ? 'bg-blue-600' : 'bg-emerald-600')
    };
    setAvailableUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ currentUser, availableUsers, switchUser, addUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
