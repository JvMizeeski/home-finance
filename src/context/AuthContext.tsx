import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_USERS } from '../lib/constants';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  addUser: (name: string, color?: string) => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('home_finance_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace any old "Esposa" name with "Rafaella"
          return parsed.map((u: any) => u.name === 'Esposa' ? { ...u, id: 'u_rafaella', name: 'Rafaella' } : u);
        }
      } catch (e) {
        console.error("Failed to parse saved users", e);
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedId = localStorage.getItem('home_finance_current_user_id');
    const found = availableUsers.find(u => u.id === savedId || (savedId === 'u_esposa' && u.id === 'u_rafaella'));
    return found || availableUsers[0];
  });

  useEffect(() => {
    localStorage.setItem('home_finance_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  useEffect(() => {
    localStorage.setItem('home_finance_current_user_id', currentUser.id);
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const targetId = userId === 'u_esposa' ? 'u_rafaella' : userId;
    const found = availableUsers.find(u => u.id === targetId || u.name.toLowerCase() === userId.toLowerCase());
    if (found) {
      setCurrentUser(found);
    }
  };

  const addUser = (name: string, color?: string): UserProfile => {
    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      name,
      avatarColor: color || (name.toLowerCase() === 'rafaella' ? 'bg-rose-500' : 'bg-emerald-600')
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
