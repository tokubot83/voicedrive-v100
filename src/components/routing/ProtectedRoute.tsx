import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredLevel?: PermissionLevel;
  maxLevel?: PermissionLevel;
  exactLevel?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredLevel,
  maxLevel,
  exactLevel = false,
  fallbackPath = '/'
}) => {
  const { userLevel } = usePermissions();
  const location = useLocation();
  
  
  // Check if user has required permission level
  if (requiredLevel) {
    if (exactLevel) {
      // Exact level match required
      if (userLevel !== requiredLevel) {
        // Store the attempted path for redirect after login
        return (
          <Navigate 
            to={fallbackPath} 
            state={{ from: location.pathname }} 
            replace 
          />
        );
      }
    } else {
      // Minimum level required
      if (userLevel < requiredLevel) {
        return (
          <Navigate 
            to={fallbackPath} 
            state={{ from: location.pathname }} 
            replace 
          />
        );
      }
    }
  }
  
  // Check maximum level constraint (for evaluation target restrictions)
  if (maxLevel && userLevel > maxLevel) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;