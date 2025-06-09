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
import PersonalDashboard from '../components/dashboards/PersonalDashboard';
import TeamLeaderDashboard from '../components/dashboards/TeamLeaderDashboard';
import DepartmentDashboard from '../components/dashboards/DepartmentDashboard';
import FacilityDashboard from '../components/dashboards/FacilityDashboard';
import HRManagementDashboard from '../components/dashboards/HRManagementDashboard';
import StrategicDashboard from '../components/dashboards/StrategicDashboard';
import CorporateDashboard from '../components/dashboards/CorporateDashboard';
import ExecutiveLevelDashboard from '../components/dashboards/ExecutiveLevelDashboard';

// Authority & Settings
import AuthorityDashboard from '../components/authority/AuthorityDashboard';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';

// Demo pages
import TimeAxisDemo from '../components/TimeAxisDemo';
import { HierarchyDemo } from '../components/demo/HierarchyDemo';

// Analytics
import ExecutiveDashboard from '../components/analytics/ExecutiveDashboard';

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
        <Route path="projects" element={<ProjectListPage />} />
        
        {/* Role-based dashboard routes with exact level protection */}
        <Route path="dashboard">
          <Route path="personal" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1} exactLevel>
              <PersonalDashboard />
            </ProtectedRoute>
          } />
          <Route path="team-leader" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_2} exactLevel>
              <TeamLeaderDashboard />
            </ProtectedRoute>
          } />
          <Route path="department" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3} exactLevel>
              <DepartmentDashboard />
            </ProtectedRoute>
          } />
          <Route path="facility" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4} exactLevel>
              <FacilityDashboard />
            </ProtectedRoute>
          } />
          <Route path="hr-management" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5} exactLevel>
              <HRManagementDashboard />
            </ProtectedRoute>
          } />
          <Route path="strategic" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6} exactLevel>
              <StrategicDashboard />
            </ProtectedRoute>
          } />
          <Route path="corporate" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7} exactLevel>
              <CorporateDashboard />
            </ProtectedRoute>
          } />
          <Route path="executive" element={
            <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8} exactLevel>
              <ExecutiveLevelDashboard />
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
        
        {/* Common pages */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Demo pages */}
        <Route path="demo">
          <Route path="time-axis" element={<TimeAxisDemo />} />
          <Route path="hierarchy" element={<HierarchyDemo />} />
        </Route>
        
        {/* Error pages */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;