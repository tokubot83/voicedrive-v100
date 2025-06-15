import React from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Activity,
  Award,
  Clock,
  Building2,
  Shield
} from 'lucide-react';
import { demoUsers, ACCOUNT_TYPE_MAPPING } from '../../data/demo/users';
import { demoPosts } from '../../data/demo/posts';
import { demoProjects } from '../../data/demo/projects';
import { demoROICalculations } from '../../data/demo/roi';
import { AccountHierarchyService } from '../../services/AccountHierarchyService';
import { FACILITIES } from '../../data/medical/facilities';

export const DemoSystemStats: React.FC = () => {
  // Calculate statistics
  const totalUsers = demoUsers.length;
  const totalPosts = demoPosts.length;
  const totalProjects = demoProjects.length;
  
  const activeProjects = demoProjects.filter(p => p.status === 'in-progress').length;
  const completedProjects = demoProjects.filter(p => p.status === 'completed').length;
  
  const postsByType = {
    improvement: demoPosts.filter(p => p.type === 'improvement').length,
    community: demoPosts.filter(p => p.type === 'community').length,
    report: demoPosts.filter(p => p.type === 'report').length,
  };
  
  const totalROI = demoROICalculations.reduce((sum, calc) => sum + calc.roi, 0) / demoROICalculations.length;
  const totalInvestment = demoROICalculations.reduce((sum, calc) => sum + calc.totalInvestment, 0);
  const totalBenefit = demoROICalculations.reduce((sum, calc) => sum + calc.totalBenefit, 0);
  
  const usersByLevel = demoUsers.reduce((acc, user) => {
    acc[user.permissionLevel] = (acc[user.permissionLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  // Calculate hierarchical statistics
  const usersByAccountType = demoUsers.reduce((acc, user) => {
    acc[user.accountType] = (acc[user.accountType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const usersByFacility = demoUsers.reduce((acc, user) => {
    if (user.facility_id) {
      acc[user.facility_id] = (acc[user.facility_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const usersWithDirectReports = demoUsers.filter(u => u.children_ids && u.children_ids.length > 0).length;
  const averageDirectReports = demoUsers
    .filter(u => u.directReports)
    .reduce((sum, u) => sum + (u.directReports || 0), 0) / usersWithDirectReports;

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      detail: `${usersByLevel[8]} executives, ${usersByLevel[7]} directors`
    },
    {
      label: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      detail: `${postsByType.improvement} improvements, ${postsByType.community} community`
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      detail: `${totalProjects} total, ${completedProjects} completed`
    },
    {
      label: 'Average ROI',
      value: `${Math.round(totalROI)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      detail: 'Across all projects'
    },
  ];

  const financialStats = [
    {
      label: 'Total Investment',
      value: `¥${(totalInvestment / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Total Benefits',
      value: `¥${(totalBenefit / 1000000).toFixed(1)}M`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Net Benefit',
      value: `¥${((totalBenefit - totalInvestment) / 1000000).toFixed(1)}M`,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Avg Payback',
      value: '10.4 months',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const projectsByStatus = [
    { status: 'Draft', count: demoProjects.filter(p => p.status === 'draft').length, color: 'bg-gray-500' },
    { status: 'Submitted', count: demoProjects.filter(p => p.status === 'submitted').length, color: 'bg-blue-500' },
    { status: 'Reviewing', count: demoProjects.filter(p => p.status === 'reviewing').length, color: 'bg-yellow-500' },
    { status: 'Approved', count: demoProjects.filter(p => p.status === 'approved').length, color: 'bg-green-500' },
    { status: 'In Progress', count: demoProjects.filter(p => p.status === 'in-progress').length, color: 'bg-purple-500' },
    { status: 'Completed', count: demoProjects.filter(p => p.status === 'completed').length, color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat?.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    {Icon && <Icon className={`w-5 h-5 ${stat.color}`} />}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                {stat.detail && (
                  <div className="text-xs text-gray-500 mt-1">{stat.detail}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Impact</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {financialStats.map((stat) => {
            const Icon = stat?.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    {Icon && <Icon className={`w-5 h-5 ${stat.color}`} />}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Status Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="space-y-3">
            {projectsByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600">{item.status}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / totalProjects) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Permission Levels</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(usersByLevel).map(([level, count]) => (
              <div key={level} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">Level {level}</div>
                <div className="text-xs text-gray-400">{ACCOUNT_TYPE_MAPPING[parseInt(level)]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hierarchical Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizational Hierarchy</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Account Types */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Account Types
            </h4>
            <div className="space-y-2">
              {Object.entries(usersByAccountType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{AccountHierarchyService.getAccountTypeLabel(type as any)}</span>
                  <span className="text-sm font-medium text-gray-900">{count} 名</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Facilities */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Facility Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(usersByFacility).map(([facilityId, count]) => {
                const facility = FACILITIES[facilityId as keyof typeof FACILITIES];
                return (
                  <div key={facilityId} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{facility?.name || facilityId}</span>
                    <span className="text-sm font-medium text-gray-900">{count} 名</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Hierarchy Metrics */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">管理職</div>
            <div className="text-xl font-bold text-gray-900">{usersWithDirectReports}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">平均部下数</div>
            <div className="text-xl font-bold text-gray-900">{averageDirectReports.toFixed(1)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">施設数</div>
            <div className="text-xl font-bold text-gray-900">{Object.keys(usersByFacility).length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">階層深度</div>
            <div className="text-xl font-bold text-gray-900">4</div>
          </div>
        </div>
      </div>
    </div>
  );
};