import React from 'react';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface RiskAssessmentMatrixProps {
  risks?: any[];
}

const RiskAssessmentMatrix: React.FC<RiskAssessmentMatrixProps> = ({ risks = [] }) => {
  const { userLevel } = usePermissions();
  
  // レベル6以上のアカウントのみアクセス可能
  if (userLevel < PermissionLevel.LEVEL_6) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>🔒</span>
          リスク評価マトリックス
        </h3>
        <div className="permission-notice">
          <p className="text-gray-400">この機能はレベル6以上のアカウントでご利用いただけます</p>
          <p className="text-gray-500 text-sm">人財統括本部統括管理部門長以上の権限が必要です</p>
        </div>
      </div>
    );
  }
  
  const defaultRisks = [
    { name: '予算超過', impact: 3, probability: 2, color: 'bg-yellow-500' },
    { name: '期限遅延', impact: 2, probability: 3, color: 'bg-orange-500' },
    { name: '品質問題', impact: 4, probability: 1, color: 'bg-red-500' },
    { name: '人材不足', impact: 3, probability: 3, color: 'bg-red-600' }
  ];

  const displayRisks = risks.length > 0 ? risks : defaultRisks;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">リスク評価マトリックス</h3>
      <div className="grid grid-cols-5 gap-1 h-48">
        <div className="col-span-1 flex flex-col justify-between text-xs text-gray-400">
          <span>高</span>
          <span>影響度</span>
          <span>低</span>
        </div>
        <div className="col-span-4">
          <div className="grid grid-cols-4 grid-rows-4 gap-1 h-full">
            {displayRisks.map((risk, index) => (
              <div
                key={index}
                className={`${risk.color} rounded p-1 text-xs text-white flex items-center justify-center`}
                style={{
                  gridColumn: risk.probability,
                  gridRow: 5 - risk.impact
                }}
              >
                {risk.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-2 text-xs text-gray-400">
        <span>低 ← 発生確率 → 高</span>
      </div>
    </div>
  );
};

export default RiskAssessmentMatrix;