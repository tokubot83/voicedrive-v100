import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import ProtectedRoute from '../components/routing/ProtectedRoute';

// Layout
import Layout from '../components/layout/Layout';

// Main pages
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import ProjectListPage from '../pages/ProjectListPage';
import EnhancedProjectListPage from '../pages/EnhancedProjectListPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import TeamManagementPage from '../pages/TeamManagementPage';
import DepartmentOverviewPage from '../pages/DepartmentOverviewPage';
import BudgetPage from '../pages/BudgetPage';
import HRDashboardPage from '../pages/HRDashboardPage';
import PolicyManagementPage from '../pages/PolicyManagementPage';
import TalentAnalyticsPage from '../pages/TalentAnalyticsPage';
import StrategicPlanningPage from '../pages/StrategicPlanningPage';
import OrgDevelopmentPage from '../pages/OrgDevelopmentPage';
import PerformanceAnalyticsPage from '../pages/PerformanceAnalyticsPage';
import FacilityManagementPage from '../pages/FacilityManagementPage';
import StrategicOverviewPage from '../pages/StrategicOverviewPage';
import BudgetPlanningPage from '../pages/BudgetPlanningPage';
import ExecutiveReportsPage from '../pages/ExecutiveReportsPage';
import ExecutiveOverviewPage from '../pages/ExecutiveOverviewPage';
import StrategicInitiativesPage from '../pages/StrategicInitiativesPage';
import OrganizationAnalyticsPage from '../pages/OrganizationAnalyticsPage';
import BoardReportsPage from '../pages/BoardReportsPage';
import GovernancePage from '../pages/GovernancePage';

// Dashboard pages
import PersonalDashboardPage from '../pages/PersonalDashboardPage';
import TeamLeaderDashboardPage from '../pages/TeamLeaderDashboardPage';
import DepartmentDashboardPage from '../pages/DepartmentDashboardPage';
import FacilityDashboardPage from '../pages/FacilityDashboardPage';
import HRManagementDashboardPage from '../pages/HRManagementDashboardPage';
import StrategicDashboardPage from '../pages/StrategicDashboardPage';
import CorporateDashboardPage from '../pages/CorporateDashboardPage';
import ExecutiveDashboardPage from '../pages/ExecutiveDashboardPage';
import IntegratedCorporateDashboardPage from '../pages/IntegratedCorporateDashboardPage';

// Staff Dashboard pages
import DepartmentStaffDashboardPage from '../pages/DepartmentStaffDashboardPage';
import FacilityStaffDashboardPage from '../pages/FacilityStaffDashboardPage';
import CorporateStaffDashboardPage from '../pages/CorporateStaffDashboardPage';

// Error Boundary
import ErrorBoundary from '../components/common/ErrorBoundary';

// Authority & Settings
import AuthorityDashboard from '../components/authority/AuthorityDashboard';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';

// Demo pages
import TimeAxisDemo from '../components/TimeAxisDemo';
import { HierarchyDemo } from '../components/demo/HierarchyDemo';
import ProgressiveVisibilityDemo from '../components/demo/ProgressiveVisibilityDemo';

// Analytics
import ExecutiveDashboard from '../components/analytics/ExecutiveDashboard';

// Whistleblowing
import WhistleblowingPage from '../pages/WhistleblowingPage';

// Compose
import ComposePage from '../pages/ComposePage';

// Interview Booking
import InterviewBookingPage from '../pages/InterviewBookingPage';
import InterviewManagementPage from '../pages/InterviewManagementPage';

// Approvals & Notifications
import { ApprovalsPage } from '../pages/ApprovalsPage';

// Retirement Processing
import RetirementProcessingPage from '../pages/RetirementProcessingPage';
import Step1AccountDeactivation from '../components/retirement/Step1AccountDeactivation';
import Step2PermissionRevocation from '../components/retirement/Step2PermissionRevocation';
import Step4CompletionNotification from '../components/retirement/Step4CompletionNotification';

// Error pages
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Main navigation routes */}
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects-legacy" element={<ProjectListPage />} />
        <Route path="project/:projectId" element={<ProjectDetailPage />} />
        <Route path="my-projects" element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary>
              {React.createElement(React.lazy(() => import('../pages/MyProjectsPage')))}
            </ErrorBoundary>
          </React.Suspense>
        } />
        
        {/* Role-based dashboard routes with exact level protection */}
        <Route path="dashboard">
          <Route path="personal" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1} exactLevel>
              <PersonalDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="team-leader" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_2} exactLevel>
              <TeamLeaderDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="department" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3} exactLevel>
              <DepartmentDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="facility" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4} exactLevel>
              <FacilityDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="hr-management" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5} exactLevel>
              <HRManagementDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="strategic" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6} exactLevel>
              <StrategicDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="corporate" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7} exactLevel>
              <CorporateDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="executive" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8} exactLevel>
              <ExecutiveDashboardPage />
            </ProtectedRoute>
          } />
          {/* 統合ダッシュボード（レベル5以上） */}
          <Route path="integrated-corporate" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
              <IntegratedCorporateDashboardPage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Staff Dashboard routes */}
        <Route path="staff-dashboard">
          <Route path="department" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
              <DepartmentStaffDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="facility" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4}>
              <FacilityStaffDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="corporate" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
              <ErrorBoundary fallback={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-4">法人職員ダッシュボードでエラーが発生しました</h2>
                    <p className="text-gray-400 mb-4">データの読み込みに問題があります。しばらく後に再試行してください。</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
                    >
                      再読み込み
                    </button>
                  </div>
                </div>
              }>
                <CorporateStaffDashboardPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Team management (Level 2+) */}
        <Route path="team-management" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_2}>
            <TeamManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Department overview (Level 3+) */}
        <Route path="department-overview" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
            <DepartmentOverviewPage />
          </ProtectedRoute>
        } />
        
        {/* Budget control (Level 4+) */}
        <Route path="budget" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4}>
            <BudgetPage />
          </ProtectedRoute>
        } />
        
        {/* Authority management (Level 3+) */}
        <Route path="authority" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
            <AuthorityDashboard />
          </ProtectedRoute>
        } />
        
        {/* HR Dashboard (Level 5+) */}
        <Route path="hr-dashboard" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
            <HRDashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Policy Management (Level 5+) */}
        <Route path="policy" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
            <PolicyManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Talent Analytics (Level 5+) */}
        <Route path="talent" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
            <TalentAnalyticsPage />
          </ProtectedRoute>
        } />
        
        {/* Strategic Planning (Level 6+) */}
        <Route path="strategic-planning" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
            <StrategicPlanningPage />
          </ProtectedRoute>
        } />
        
        {/* Organization Development (Level 6+) */}
        <Route path="org-development" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
            <OrgDevelopmentPage />
          </ProtectedRoute>
        } />
        
        {/* Performance Analytics (Level 6+) */}
        <Route path="performance" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
            <PerformanceAnalyticsPage />
          </ProtectedRoute>
        } />
        
        {/* Retirement Processing (Level 6+) */}
        <Route path="retirement-processing">
          <Route index element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
              <RetirementProcessingPage />
            </ProtectedRoute>
          } />
          <Route path="step1/:processId" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
              <Step1AccountDeactivation 
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
          <Route path="step2/:processId" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
              <Step2PermissionRevocation 
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
          <Route path="step4/:processId" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
              <Step4CompletionNotification 
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Facility Management (Level 7+) */}
        <Route path="facility-management" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <FacilityManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Strategic Overview (Level 7+) */}
        <Route path="strategic-overview" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <StrategicOverviewPage />
          </ProtectedRoute>
        } />
        
        {/* Budget Planning (Level 7+) */}
        <Route path="budget-planning" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <BudgetPlanningPage />
          </ProtectedRoute>
        } />
        
        {/* Executive Reports (Level 7+) */}
        <Route path="executive-reports" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <ExecutiveReportsPage />
          </ProtectedRoute>
        } />
        
        {/* Executive Overview (Level 8) */}
        <Route path="executive-overview" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <ExecutiveOverviewPage />
          </ProtectedRoute>
        } />
        
        {/* Strategic Initiatives (Level 8) */}
        <Route path="strategic-initiatives" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <StrategicInitiativesPage />
          </ProtectedRoute>
        } />
        
        {/* Organization Analytics (Level 8) */}
        <Route path="organization-analytics" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <OrganizationAnalyticsPage />
          </ProtectedRoute>
        } />
        
        {/* Board Reports (Level 8) */}
        <Route path="board-reports" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <BoardReportsPage />
          </ProtectedRoute>
        } />
        
        {/* Governance (Level 8) */}
        <Route path="governance" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <GovernancePage />
          </ProtectedRoute>
        } />
        
        {/* Analytics (Level 7+) */}
        <Route path="analytics" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <ExecutiveDashboard />
          </ProtectedRoute>
        } />
        
        {/* Whistleblowing System - All users can access (internal permission handling) */}
        <Route path="whistleblowing" element={<WhistleblowingPage />} />
        
        {/* Approvals & Notifications - Permission-based access */}
        <Route path="approvals" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
            <ApprovalsPage />
          </ProtectedRoute>
        } />
        

        {/* Common pages */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Demo pages */}
        <Route path="demo">
          <Route path="time-axis" element={<TimeAxisDemo />} />
          <Route path="hierarchy" element={<HierarchyDemo />} />
          <Route path="progressive-visibility" element={<ProgressiveVisibilityDemo />} />
        </Route>
        
        {/* Error pages */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
      
      {/* Full-width pages without sidebar */}
      <Route path="compose/:type" element={<ComposePage />} />
      
      {/* Interview and Project Management - Full width */}
      <Route path="interview-booking" element={<InterviewBookingPage />} />
      <Route path="interview-management" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <InterviewManagementPage />
        </ProtectedRoute>
      } />
      <Route path="projects" element={<EnhancedProjectListPage />} />
    </Routes>
  );
};

export default AppRouter;