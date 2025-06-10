import React from 'react';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface BenchmarkComparisonProps {
  data?: any;
}

const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({ data }) => {
  const { userLevel } = usePermissions();
  
  // レベル6以上のアカウントのみアクセス可能
  if (userLevel < PermissionLevel.LEVEL_6) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>🔒</span>
          ベンチマーク比較
        </h3>
        <div className="permission-notice">
          <p className="text-gray-400">この機能はレベル6以上のアカウントでご利用いただけます</p>
          <p className="text-gray-500 text-sm">人財統括本部統括管理部門長以上の権限が必要です</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">ベンチマーク比較</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">業界平均</span>
          <span className="text-white font-bold">85%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">当組織</span>
          <span className="text-green-400 font-bold">92%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkComparison;