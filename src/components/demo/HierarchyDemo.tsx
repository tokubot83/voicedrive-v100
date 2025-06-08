import React from 'react';
import { Shield, DollarSign, Users, Building2, ChevronRight } from 'lucide-react';
import { useDemoMode } from './DemoModeController';
import { usePermissions } from '../../hooks/usePermissions';
import { AccountHierarchyService } from '../../services/AccountHierarchyService';
import { getUserManager, getDirectReports } from '../../data/demo/users';
import { FACILITIES } from '../../data/medical/facilities';

export const HierarchyDemo: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { canApproveBudget, getNextApprover } = usePermissions();
  
  if (!currentUser) return null;
  
  const manager = getUserManager(currentUser.id);
  const directReports = getDirectReports(currentUser.id);
  const orgStats = AccountHierarchyService.getOrganizationStats(currentUser.id);
  
  // Test budget amounts
  const testAmounts = [50000, 100000, 500000, 1000000, 5000000];
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Hierarchy Demo</h2>
      
      {/* Current User Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          現在のユーザー情報
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">氏名</p>
            <p className="font-medium">{currentUser.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">役職</p>
            <p className="font-medium">{currentUser.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">アカウントタイプ</p>
            <p className="font-medium">{AccountHierarchyService.getAccountTypeLabel(currentUser.accountType)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">権限レベル</p>
            <p className="font-medium">Level {currentUser.permissionLevel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">予算承認限度額</p>
            <p className="font-medium">{AccountHierarchyService.formatBudgetLimit(currentUser.budgetApprovalLimit)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">施設</p>
            <p className="font-medium">
              {currentUser.facility_id 
                ? FACILITIES[currentUser.facility_id as keyof typeof FACILITIES]?.name 
                : '-'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Organization Relationships */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          組織上の関係
        </h3>
        
        <div className="space-y-4">
          {/* Manager */}
          {manager && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img src={manager.avatar} alt={manager.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">上司</p>
                <p className="font-medium">{manager.name}</p>
                <p className="text-sm text-gray-600">{manager.position}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          )}
          
          {/* Direct Reports */}
          {directReports.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">直属の部下 ({directReports.length}名)</p>
              <div className="space-y-2">
                {directReports.map(report => (
                  <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={report.avatar} alt={report.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-gray-600">{report.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Organization Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{orgStats.directReports}</p>
            <p className="text-sm text-gray-500">直属の部下</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{orgStats.totalSubordinates}</p>
            <p className="text-sm text-gray-500">総部下数</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{orgStats.organizationDepth}</p>
            <p className="text-sm text-gray-500">階層深度</p>
          </div>
        </div>
      </div>
      
      {/* Budget Approval Demo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          予算承認デモ
        </h3>
        
        <div className="space-y-3">
          {testAmounts.map(amount => {
            const canApprove = canApproveBudget(amount);
            const nextApprover = getNextApprover(amount);
            
            return (
              <div key={amount} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {canApprove ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      承認可能
                    </span>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        承認不可
                      </span>
                      {nextApprover && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ChevronRight className="w-4 h-4" />
                          <img src={nextApprover.avatar} alt={nextApprover.name} className="w-6 h-6 rounded-full" />
                          <span>{nextApprover.name}へエスカレーション</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};