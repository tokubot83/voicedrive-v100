// Authority Management Dashboard Component

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Scale, Clock, Users, FileText, Sparkles } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { AuthorityManagementService } from '../../services/AuthorityManagementService';
import { WeightAdjustmentService } from '../../services/WeightAdjustmentService';
import { ApprovalFlowService } from '../../services/ApprovalFlowService';
import { EmergencyAuthorityService } from '../../services/EmergencyAuthorityService';
import { AuditService } from '../../services/AuditService';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import WeightAdjustmentPanel from './WeightAdjustmentPanel';
import ApprovalFlowPanel from './ApprovalFlowPanel';
import EmergencyAuthorityPanel from './EmergencyAuthorityPanel';
import AuditLogPanel from './AuditLogPanel';
import GrievancePanel from './GrievancePanel';
import { useDemoMode } from '../demo/DemoModeController';

interface AuthorityMetrics {
  pendingApprovals: number;
  activeEmergencies: number;
  pendingReviews: number;
  recentAudits: number;
  pendingGrievances: number;
}

const AuthorityDashboard: React.FC = () => {
  const { currentUser, hasPermission } = usePermissions();
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metrics, setMetrics] = useState<AuthorityMetrics>({
    pendingApprovals: 0,
    activeEmergencies: 0,
    pendingReviews: 0,
    recentAudits: 0,
    pendingGrievances: 0
  });
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);

  // Services
  const authorityService = AuthorityManagementService.getInstance();
  const weightService = WeightAdjustmentService.getInstance();
  const approvalService = ApprovalFlowService.getInstance();
  const emergencyService = EmergencyAuthorityService.getInstance();
  const auditService = AuditService.getInstance();

  useEffect(() => {
    if (currentUser) {
      loadMetrics();
    }
  }, [currentUser]);

  const loadMetrics = () => {
    if (!currentUser) return;

    const pendingApprovals = approvalService.getPendingApprovals(currentUser.id).length;
    const activeEmergencies = emergencyService.getEmergencyActions({ pendingReports: true }).length;
    const pendingReviews = weightService.getPendingReviews(currentUser.id).length;
    const recentAudits = auditService.getAuditLogs({ limit: 100 }).length;
    const pendingGrievances = auditService.getGrievances({ status: 'under_review' }).length;

    setMetrics({
      pendingApprovals,
      activeEmergencies,
      pendingReviews,
      recentAudits,
      pendingGrievances
    });
  };

  // Check if user has authority management access
  if (!currentUser || currentUser.permissionLevel < PermissionLevel.LEVEL_3) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Authority management requires manager level access or higher.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'weights', label: 'Weight Adjustments', icon: Scale, minLevel: PermissionLevel.LEVEL_3 },
    { id: 'approvals', label: 'Approval Flow', icon: Clock, minLevel: PermissionLevel.LEVEL_2 },
    { id: 'emergency', label: 'Emergency Authority', icon: AlertTriangle, minLevel: PermissionLevel.LEVEL_4 },
    { id: 'audit', label: 'Audit Logs', icon: FileText, minLevel: PermissionLevel.LEVEL_5 },
    { id: 'grievance', label: 'Grievances', icon: Users, minLevel: PermissionLevel.LEVEL_6 }
  ];

  const visibleTabs = tabs.filter(tab => 
    !tab.minLevel || currentUser.permissionLevel >= tab.minLevel
  );

  const loadDemoData = async () => {
    if (!isDemoMode || demoDataLoaded) return;
    
    // Load demo data
    const { demoAuthorityMetrics } = await import('../../data/demo/authority');
    
    setMetrics({
      pendingApprovals: demoAuthorityMetrics.approvals.pending,
      activeEmergencies: demoAuthorityMetrics.emergencies.pendingReports,
      pendingReviews: demoAuthorityMetrics.weightAdjustments.pending,
      recentAudits: demoAuthorityMetrics.audit.totalLogs,
      pendingGrievances: demoAuthorityMetrics.grievances.pending
    });
    
    setDemoDataLoaded(true);
  };

  return (
    <div className="bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-400" />
              Authority Management
            </h2>
            <p className="text-gray-400 mt-1">
              Manage permissions, approvals, and organizational authority
            </p>
          </div>
          {isDemoMode && !demoDataLoaded && (
            <button
              onClick={loadDemoData}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load Demo Data
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-6 px-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 border-b-2 transition-colors flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Metrics Cards */}
            <MetricCard
              title="Pending Approvals"
              value={metrics.pendingApprovals}
              icon={Clock}
              color="blue"
              onClick={() => setActiveTab('approvals')}
            />
            <MetricCard
              title="Active Emergencies"
              value={metrics.activeEmergencies}
              icon={AlertTriangle}
              color="red"
              onClick={() => setActiveTab('emergency')}
            />
            <MetricCard
              title="Pending Reviews"
              value={metrics.pendingReviews}
              icon={Scale}
              color="yellow"
              onClick={() => setActiveTab('weights')}
            />
            <MetricCard
              title="Recent Audits"
              value={metrics.recentAudits}
              icon={FileText}
              color="green"
              onClick={() => setActiveTab('audit')}
            />
            <MetricCard
              title="Open Grievances"
              value={metrics.pendingGrievances}
              icon={Users}
              color="purple"
              onClick={() => setActiveTab('grievance')}
            />

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {currentUser.permissionLevel >= PermissionLevel.LEVEL_4 && (
                  <button
                    onClick={() => setActiveTab('emergency')}
                    className="w-full text-left px-3 py-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/30 transition-colors text-sm"
                  >
                    Declare Emergency
                  </button>
                )}
                {currentUser.permissionLevel >= PermissionLevel.LEVEL_3 && (
                  <button
                    onClick={() => setActiveTab('weights')}
                    className="w-full text-left px-3 py-2 bg-blue-900/20 text-blue-400 rounded hover:bg-blue-900/30 transition-colors text-sm"
                  >
                    Adjust Weights
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('audit')}
                  className="w-full text-left px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  View Audit Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weights' && <WeightAdjustmentPanel />}
        {activeTab === 'approvals' && <ApprovalFlowPanel />}
        {activeTab === 'emergency' && <EmergencyAuthorityPanel />}
        {activeTab === 'audit' && <AuditLogPanel />}
        {activeTab === 'grievance' && <GrievancePanel />}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.FC<any>;
  color: 'blue' | 'red' | 'yellow' | 'green' | 'purple';
  onClick?: () => void;
}> = ({ title, value, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-900/20 text-blue-400 border-blue-800',
    red: 'bg-red-900/20 text-red-400 border-red-800',
    yellow: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
    green: 'bg-green-900/20 text-green-400 border-green-800',
    purple: 'bg-purple-900/20 text-purple-400 border-purple-800'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    purple: 'text-purple-500'
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${colorClasses[color]} border rounded-lg p-4 cursor-pointer
        hover:opacity-80 transition-opacity
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default AuthorityDashboard;