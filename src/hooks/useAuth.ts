import React, { useState, createContext, useContext, ReactNode } from 'react';
import { HierarchicalUser } from '../data/demo/hierarchicalUsers';
import { demoUsers } from '../data/demo/users';

interface AuthContextType {
  currentUser: HierarchicalUser | null;
  setCurrentUser: (user: HierarchicalUser | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // デモ用: 最初のユーザーをデフォルトとして設定
  const [currentUser, setCurrentUser] = useState<HierarchicalUser | null>(demoUsers[0] as HierarchicalUser);

  const isAuthenticated = !!currentUser;

  const contextValue: AuthContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};