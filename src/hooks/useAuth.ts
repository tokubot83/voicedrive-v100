import React, { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { HierarchicalUser } from '../data/demo/hierarchicalUsers';
import { demoUsers } from '../data/demo/users';

interface AuthContextType {
  currentUser: HierarchicalUser | null;
  setCurrentUser: (user: HierarchicalUser | null) => void;
  isAuthenticated: boolean;
  // 互換性のためuserプロパティを追加
  user: HierarchicalUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = React.forwardRef<any, AuthProviderProps>(({ children }, ref) => {
  // デモ用: 最初のユーザーをデフォルトとして設定
  const [currentUser, setCurrentUser] = useState<HierarchicalUser | null>(demoUsers[0] as HierarchicalUser);

  const isAuthenticated = !!currentUser;

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    user: currentUser // 互換性のため追加
  };

  return React.createElement(AuthContext.Provider, { value }, children);
});

AuthProvider.displayName = 'AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};