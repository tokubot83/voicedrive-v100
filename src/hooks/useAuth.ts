import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { HierarchicalUser } from '../data/demo/hierarchicalUsers';
import { demoUsers } from '../data/demo/users';

interface AuthContextType {
  currentUser: HierarchicalUser | null;
  setCurrentUser: (user: HierarchicalUser | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // デモ用: 最初のユーザーをデフォルトとして設定
  const [currentUser, setCurrentUser] = useState<HierarchicalUser | null>(demoUsers[0] as HierarchicalUser);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated }}>
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