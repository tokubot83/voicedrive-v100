// 権限ゲートコンポーネント - 8段階権限システム対応
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionLevel, PERMISSION_METADATA } from '../types/PermissionTypes';

interface PermissionGateProps {
  requiredLevel?: PermissionLevel;
  requiredFeature?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  userId?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  requiredLevel,
  requiredFeature,
  fallback = null,
  children,
  userId
}) => {
  const { userLevel, checkFeatureAccess } = usePermissions(userId);
  
  // 権限レベルチェック
  if (requiredLevel !== undefined) {
    if (userLevel < requiredLevel) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="permission-gate">
          <div className="permission-icon">🔒</div>
          <h3>アクセス権限が必要です</h3>
          <p>
            この機能にアクセスするには
            <strong>{PERMISSION_METADATA[requiredLevel].displayName}</strong>
            以上の権限が必要です。
          </p>
          <p>現在の権限レベル: {PERMISSION_METADATA[userLevel].displayName}</p>
        </div>
      );
    }
  }
  
  // 機能別権限チェック
  if (requiredFeature) {
    const accessResult = checkFeatureAccess(requiredFeature);
    if (!accessResult.hasPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="permission-gate">
          <div className="permission-icon">🔒</div>
          <h3>アクセス権限が必要です</h3>
          <p>{accessResult.reason}</p>
          <p>現在の権限レベル: {PERMISSION_METADATA[userLevel].displayName}</p>
        </div>
      );
    }
  }
  
  // 権限チェックをパスした場合は子要素を表示
  return <>{children}</>;
};

export default PermissionGate;