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
import { PersonalStationPage } from '../pages/PersonalStationPage';
import { DepartmentStationPage } from '../pages/DepartmentStationPage';
import BudgetPage from '../pages/BudgetPage';
import FacilityManagementPage from '../pages/FacilityManagementPage';
import StrategicOverviewPage from '../pages/StrategicOverviewPage';
import BudgetPlanningPage from '../pages/BudgetPlanningPage';
import ExecutiveReportsPage from '../pages/ExecutiveReportsPage';
import StrategicInitiativesPage from '../pages/StrategicInitiativesPage';
import OrganizationAnalyticsPage from '../pages/OrganizationAnalyticsPage';
import { StrategicHRPage } from '../pages/StrategicHRPage';
import VotingSystemGuide from '../pages/VotingSystemGuide';
import StaffVotingGuide from '../pages/StaffVotingGuide';
import IdeaVoiceGuide from '../pages/IdeaVoiceGuide';
import FreeVoiceGuide from '../pages/FreeVoiceGuide';
import ComplianceGuide from '../pages/ComplianceGuide';
import InterviewGuide from '../pages/InterviewGuide';
import UserGuide from '../pages/UserGuide';
import ProposalManagementGuide from '../pages/ProposalManagementGuide';
import { ProposalGeneratorPage } from '../pages/ProposalGeneratorPage';

// Role-based Guides
import GuidesHub from '../pages/GuidesHub';
import StaffBasicGuide from '../pages/role-guides/StaffBasicGuide';
import ManagerGuide from '../pages/role-guides/ManagerGuide';
import HRGuide from '../pages/role-guides/HRGuide';
import SystemAdminGuide from '../pages/role-guides/SystemAdminGuide';

// Test pages
import MedicalAPITestPanel from '../components/test/MedicalAPITestPanel';
import TestSummaryReceiver from '../pages/TestSummaryReceiver';

// Dashboard pages
import ExecutiveDashboardPage from '../pages/ExecutiveDashboardPage';

// Error Boundary
import ErrorBoundary from '../components/common/ErrorBoundary';

// Authority & Settings
import AuthorityDashboard from '../components/authority/AuthorityDashboard';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';

// Demo pages
import TimeAxisDemo from '../components/TimeAxisDemo';
import { HierarchyDemo } from '../components/demo/HierarchyDemo';
import ProgressiveVisibilityDemo from '../components/demo/ProgressiveVisibilityDemo';

// Analytics
import ExecutiveDashboard from '../components/analytics/ExecutiveDashboard';

// Whistleblowing
import WhistleblowingPage from '../pages/WhistleblowingPage';
import MyReportsPage from '../pages/MyReportsPage';
import MyReportDetailPage from '../pages/MyReportDetailPage';

// Compose
import ComposePage from '../pages/ComposePage';

// Interview Booking
import InterviewStation from '../pages/InterviewStation';
import InterviewBookingPage from '../pages/InterviewBookingPage';

// HR Announcements
import HRAnnouncementsPage from '../components/hr-announcements/HRAnnouncementsPage';
import StressCheckDemoPage from '../pages/StressCheckDemoPage';

// Approvals & Notifications
import { ApprovalsPage } from '../pages/ApprovalsPage';

// Committee & Governance
import CommitteeManagementPage from '../pages/CommitteeManagementPage';
import ManagementCommitteePage from '../pages/ManagementCommitteePage';
import FacilityGovernancePage from '../pages/FacilityGovernancePage';
import DecisionMeetingPage from '../pages/DecisionMeetingPage';

// Retirement Processing
import RetirementProcessingPage from '../pages/RetirementProcessingPage';
import Step1AccountDeactivation from '../components/retirement/Step1AccountDeactivation';
import Step2PermissionRevocation from '../components/retirement/Step2PermissionRevocation';
import Step4CompletionNotification from '../components/retirement/Step4CompletionNotification';

// Emergency Account Deactivation
import EmergencyAccountDeactivation from '../pages/EmergencyAccountDeactivation';

// Voice Analytics
import VoiceAnalyticsPage from '../pages/VoiceAnalyticsPage';

// Culture Development
import CultureDevelopmentPage from '../pages/CultureDevelopmentPage';

// Agenda Mode - Expired Escalation History
import ExpiredEscalationHistoryPage from '../components/agenda-mode/ExpiredEscalationHistoryPage';
import { ExpiredEscalationProposalsPage } from '../pages/ExpiredEscalationProposalsPage';

// Board Preparation
import { BoardPreparationPage } from '../pages/BoardPreparationPage';

// Level 18 Pages
import { CorporateAgendaDashboardPage } from '../pages/CorporateAgendaDashboardPage';
import { CrossFacilityAnalysisPage } from '../pages/CrossFacilityAnalysisPage';
import { BoardAgendaReviewPage } from '../pages/BoardAgendaReviewPage';
import { BoardDecisionFollowPage } from '../pages/BoardDecisionFollowPage';

// Analysis pages removed - integrated into VoiceAnalyticsPage (Phase 18.5)

// Admin pages
import { SystemSettingsPage } from '../pages/SystemSettingsPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { ModeSwitcherPage } from '../pages/admin/ModeSwitcherPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { SystemMonitorPageEnhanced } from '../pages/admin/SystemMonitorPageEnhanced';
import VotingSettingsPage from '../pages/admin/VotingSettingsPage';
import { AgendaModeSettingsPage } from '../pages/admin/AgendaModeSettingsPage';
import { ProjectModeSettingsPage } from '../pages/admin/ProjectModeSettingsPage';
import { VotingHistoryPage } from '../pages/admin/VotingHistoryPage';
import { SystemOperationsPage } from '../pages/admin/SystemOperationsPage';
import { SidebarMenuManagementPage } from '../pages/admin/SidebarMenuManagementPage';
import { InterviewSettingsPage } from '../pages/admin/InterviewSettingsPage';
import { CommitteeSettingsPage } from '../pages/admin/CommitteeSettingsPage';
import { NotificationCategoryPage } from '../pages/admin/NotificationCategoryPage';

// Appeal pages
import AppealV3Page from '../pages/AppealV3Page';
import EvaluationNotificationPage from '../pages/EvaluationNotificationPage';
import EvaluationStation from '../pages/EvaluationStation';

// Health Station
import HealthStation from '../pages/HealthStation';

// Career Selection Station
import { CareerSelectionStationPage } from '../pages/career-selection-station/CareerSelectionStationPage';
import { ChangeRequestPage } from '../pages/career-selection-station/ChangeRequestPage';
import { MyRequestsPage } from '../pages/career-selection-station/MyRequestsPage';

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

        {/* HR Announcements - accessible to all users */}
        <Route path="hr-announcements" element={<HRAnnouncementsPage />} />
        <Route path="stress-check-demo" element={<StressCheckDemoPage />} />
        
        {/* Role-based dashboard routes with exact level protection */}
        <Route path="dashboard">
          <Route path="executive" element={
            <ProtectedRoute requiredLevel={12}>
              <ExecutiveDashboardPage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Budget control (Level 4+) */}
        <Route path="budget" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4}>
            <BudgetPage />
          </ProtectedRoute>
        } />
        
        {/* Medical API Test Panel (開発環境のみ) */}
        {import.meta.env.DEV && (
          <>
            <Route path="api-test" element={<MedicalAPITestPanel />} />
            <Route path="test-summary-receiver" element={<TestSummaryReceiver />} />
          </>
        )}

        {/* Authority management (Level 3+) */}
        <Route path="authority" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
            <AuthorityDashboard />
          </ProtectedRoute>
        } />

        {/* Retirement Processing (Level 14+) - Emergency Use Only */}
        <Route path="retirement-processing">
          <Route index element={
            <ProtectedRoute requiredLevel={14}>
              <RetirementProcessingPage />
            </ProtectedRoute>
          } />
          <Route path="step1/:processId" element={
            <ProtectedRoute requiredLevel={14}>
              <Step1AccountDeactivation
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
          <Route path="step2/:processId" element={
            <ProtectedRoute requiredLevel={14}>
              <Step2PermissionRevocation
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
          <Route path="step4/:processId" element={
            <ProtectedRoute requiredLevel={14}>
              <Step4CompletionNotification
                onStepComplete={() => Promise.resolve()}
                onStepError={() => {}}
                onNavigateBack={() => {}}
              />
            </ProtectedRoute>
          } />
        </Route>

        {/* Emergency Account Deactivation (Level 14-17) */}
        <Route path="emergency/account-deactivation" element={
          <ProtectedRoute requiredLevel={14}>
            <EmergencyAccountDeactivation />
          </ProtectedRoute>
        } />

        {/* Voice Analytics (Level 14+) */}
        <Route path="voice-analytics" element={
          <ProtectedRoute requiredLevel={14}>
            <VoiceAnalyticsPage />
          </ProtectedRoute>
        } />

        {/* Culture Development (Level 14+) */}
        <Route path="culture-development" element={
          <ProtectedRoute requiredLevel={14}>
            <CultureDevelopmentPage />
          </ProtectedRoute>
        } />

        {/* Expired Escalation History (Level 1+) */}
        <Route path="expired-escalation-history" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1}>
            <ExpiredEscalationHistoryPage />
          </ProtectedRoute>
        } />

        {/* Expired Escalation Proposals (Level 7+) */}
        <Route path="expired-escalation-proposals" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
            <ExpiredEscalationProposalsPage />
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
        
        {/* Strategic HR Plan (Level 16+) */}
        <Route path="strategic-hr-plan" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_16}>
            <StrategicHRPage />
          </ProtectedRoute>
        } />

        {/* Executive Reports (Level 16+) */}
        <Route path="executive-reports" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_16}>
            <ExecutiveReportsPage />
          </ProtectedRoute>
        } />

        {/* Board Preparation (Level 17) */}
        <Route path="board-preparation" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_17}>
            <BoardPreparationPage />
          </ProtectedRoute>
        } />

        {/* Corporate Agenda Dashboard (Level 18) */}
        <Route path="corporate-agenda-dashboard" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_18}>
            <CorporateAgendaDashboardPage />
          </ProtectedRoute>
        } />

        {/* Cross Facility Analysis (Level 18) */}
        <Route path="cross-facility-analysis" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_18}>
            <CrossFacilityAnalysisPage />
          </ProtectedRoute>
        } />

        {/* Board Agenda Review (Level 18) */}
        <Route path="board-agenda-review" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_18}>
            <BoardAgendaReviewPage />
          </ProtectedRoute>
        } />

        {/* Board Decision Follow (Level 18) */}
        <Route path="board-decision-follow" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_18}>
            <BoardDecisionFollowPage />
          </ProtectedRoute>
        } />

        {/* Strategic Initiatives (Level 13 - Project Mode) */}
        <Route path="strategic-initiatives" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_13}>
            <StrategicInitiativesPage />
          </ProtectedRoute>
        } />

        {/* Organization Analytics (Level 14+ - Both Modes) */}
        <Route path="organization-analytics" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_14}>
            <OrganizationAnalyticsPage />
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
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

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
      <Route path="project/:projectId" element={<ProjectDetailPage />} />
      <Route path="personal-station" element={<PersonalStationPage />} />
      <Route path="interview-station" element={<InterviewStation />} />
      <Route path="evaluation-station" element={<EvaluationStation />} />
      <Route path="health-station" element={<HealthStation />} />

      {/* Compliance Reports - Full width without sidebar */}
      <Route path="my-reports" element={<MyReportsPage />} />
      <Route path="my-reports/:id" element={<MyReportDetailPage />} />
      <Route path="career-selection-station">
        <Route index element={<CareerSelectionStationPage />} />
        <Route path="change-request" element={<ChangeRequestPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
      </Route>
      <Route path="staff-voting-guide" element={<StaffVotingGuide />} />
      <Route path="voting-system-guide" element={<VotingSystemGuide />} />
      <Route path="idea-voice-guide" element={<IdeaVoiceGuide />} />

      {/* Idea Voice Hub Routes */}
      <Route path="idea-voice">
        <Route path="progress" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1}>
            {React.createElement(React.lazy(() => import('../pages/IdeaVoiceTracking')))}
          </ProtectedRoute>
        } />
        <Route path="proposal" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
            <ProposalGeneratorPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Proposal Management Routes */}
      <Route path="proposal-management" element={
        <ProtectedRoute requiredLevel={3.5}>
          {React.createElement(React.lazy(() => import('../pages/ProposalManagementPage')))}
        </ProtectedRoute>
      } />

      {/* Proposal Review Page (Level 5+: 主任以上) */}
      <Route path="proposal-management/review/:postId" element={
        <ProtectedRoute requiredLevel={5}>
          {React.createElement(React.lazy(() => import('../pages/ProposalReviewPage')))}
        </ProtectedRoute>
      } />

      {/* Facility Proposal Review Page (Level 8+: 副看護部長以上) */}
      <Route path="facility-proposal-review/:postId" element={
        <ProtectedRoute requiredLevel={8}>
          {React.createElement(React.lazy(() => import('../pages/FacilityProposalReviewPage')))}
        </ProtectedRoute>
      } />

      {/* Proposal Document Editor */}
      <Route path="proposal-document/:documentId" element={
        <ProtectedRoute requiredLevel={3.5}>
          {React.createElement(React.lazy(() => import('../pages/ProposalDocumentEditor')))}
        </ProtectedRoute>
      } />

      {/* Committee Management (Level 7+) */}
      <Route path="committee-management" element={
        <ProtectedRoute requiredLevel={7}>
          <CommitteeManagementPage />
        </ProtectedRoute>
      } />

      {/* Committee Submission Approval (Level 8+) - Legacy */}
      <Route path="committee-submission-approval" element={
        <ProtectedRoute requiredLevel={8}>
          {React.createElement(React.lazy(() => import('../pages/CommitteeSubmissionApprovalPage')))}
        </ProtectedRoute>
      } />

      {/* Management Committee (Level 10+) */}
      <Route path="management-committee" element={
        <ProtectedRoute requiredLevel={10}>
          <ManagementCommitteePage />
        </ProtectedRoute>
      } />

      {/* Facility Governance (Level 10+) */}
      <Route path="facility-governance" element={
        <ProtectedRoute requiredLevel={10}>
          <FacilityGovernancePage />
        </ProtectedRoute>
      } />

      {/* Decision Meeting (Level 13) */}
      <Route path="decision-meeting" element={
        <ProtectedRoute requiredLevel={13}>
          <DecisionMeetingPage />
        </ProtectedRoute>
      } />

      {/* Project Mode Routes */}
      <Route path="idea-tracking" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1}>
          {React.createElement(React.lazy(() => import('../pages/IdeaVoiceTrackingPage')))}
        </ProtectedRoute>
      } />

      <Route path="project-tracking" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1}>
          {React.createElement(React.lazy(() => import('../pages/ProjectTracking')))}
        </ProtectedRoute>
      } />

      <Route path="project-approval" element={
        <ProtectedRoute requiredLevel={6}>
          {React.createElement(React.lazy(() => import('../pages/ProjectApprovalPage')))}
        </ProtectedRoute>
      } />

      <Route path="progress-dashboard" element={
        <ProtectedRoute requiredLevel={10}>
          {React.createElement(React.lazy(() => import('../pages/ProgressDashboardPage')))}
        </ProtectedRoute>
      } />

      {/* HR Department Project Mode Routes */}
      <Route path="project-talent-analytics" element={
        <ProtectedRoute requiredLevel={14}>
          {React.createElement(React.lazy(() => import('../pages/ProjectTalentAnalyticsPage')))}
        </ProtectedRoute>
      } />

      <Route path="project-participation-recommendation" element={
        <ProtectedRoute requiredLevel={15}>
          {React.createElement(React.lazy(() => import('../pages/ProjectParticipationRecommendationPage')))}
        </ProtectedRoute>
      } />

      <Route path="project-org-development" element={
        <ProtectedRoute requiredLevel={16}>
          {React.createElement(React.lazy(() => import('../pages/ProjectOrgDevelopmentPage')))}
        </ProtectedRoute>
      } />

      {/* Board Level Project Mode Routes */}
      <Route path="project-portfolio-management" element={
        <ProtectedRoute requiredLevel={18}>
          {React.createElement(React.lazy(() => import('../pages/ProjectPortfolioManagementPage')))}
        </ProtectedRoute>
      } />

      <Route path="free-voice-guide" element={<FreeVoiceGuide />} />
      <Route path="compliance-guide" element={<ComplianceGuide />} />
      <Route path="interview-guide" element={<InterviewGuide />} />
      <Route path="user-guide" element={<UserGuide />} />
      <Route path="proposal-management-guide" element={<ProposalManagementGuide />} />

      {/* Guides Hub - Central navigation for all guides */}
      <Route path="guides-hub" element={<GuidesHub />} />

      {/* Role-based Guides */}
      <Route path="role-guides/staff-basic" element={<StaffBasicGuide />} />
      <Route path="role-guides/manager" element={<ManagerGuide />} />
      <Route path="role-guides/hr" element={<HRGuide />} />
      <Route path="role-guides/system-admin" element={<SystemAdminGuide />} />
      <Route path="department-station" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
          <DepartmentStationPage />
        </ProtectedRoute>
      } />
      
      {/* Interview and Project Management - Full width */}
      <Route path="interview-booking" element={<InterviewBookingPage />} />
      <Route path="projects" element={<EnhancedProjectListPage />} />
      <Route path="my-projects" element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary>
            {React.createElement(React.lazy(() => import('../pages/MyProjectsPage')))}
          </ErrorBoundary>
        </React.Suspense>
      } />
      
      {/* Analysis Pages - Removed (integrated into VoiceAnalyticsPage Phase 18.5) */}
      
      {/* Admin Pages - Full width without sidebar */}
      {/* システム運用ページ（Level 99専用） */}
      <Route path="admin/system-operations" element={
        <ProtectedRoute requiredLevel={99}>
          <SystemOperationsPage />
        </ProtectedRoute>
      } />

      {/* 個別管理ページ（システム運用ページからアクセス） */}
      <Route path="admin/system-settings" element={
        <ProtectedRoute requiredLevel={99}>
          <SystemSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="admin/mode-switcher" element={
        <ProtectedRoute requiredLevel={99}>
          <ModeSwitcherPage />
        </ProtectedRoute>
      } />
      <Route path="admin/user-management" element={
        <ProtectedRoute requiredLevel={99}>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="admin/system-monitor" element={
        <ProtectedRoute requiredLevel={99}>
          <SystemMonitorPageEnhanced />
        </ProtectedRoute>
      } />
      <Route path="admin/voting-settings" element={
        <ProtectedRoute requiredLevel={99}>
          <VotingSettingsPage />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<AgendaModeSettingsPage />} />
        <Route path="project" element={<ProjectModeSettingsPage />} />
        <Route path="history" element={<VotingHistoryPage />} />
      </Route>
      <Route path="admin/sidebar-menu-management" element={
        <ProtectedRoute requiredLevel={99}>
          <SidebarMenuManagementPage />
        </ProtectedRoute>
      } />
      <Route path="admin/interview-settings" element={
        <ProtectedRoute requiredLevel={99}>
          <InterviewSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="admin/committee-settings" element={
        <ProtectedRoute requiredLevel={99}>
          <CommitteeSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="admin/notification-category" element={
        <ProtectedRoute requiredLevel={99}>
          <NotificationCategoryPage />
        </ProtectedRoute>
      } />

      {/* その他管理ページ */}
      <Route path="admin/users" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="admin/audit-logs" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <AuditLogPage />
        </ProtectedRoute>
      } />
      
      
      {/* V3 Appeal Page - Accessible to all authenticated users */}
      <Route path="appeal-v3" element={<AppealV3Page />} />
      
      {/* Evaluation Notifications - Accessible to all authenticated users */}
      <Route path="evaluation/notifications" element={<EvaluationNotificationPage />} />
      
      {/* Evaluation Station - Level 1-3 only (evaluation targets) */}
      <Route path="evaluation-station/*" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1} maxLevel={PermissionLevel.LEVEL_3}>
          <Routes>
            <Route index element={<EvaluationStation />} />
            <Route path="notifications" element={<EvaluationNotificationPage />} />
            <Route path="notifications/:id" element={<div>評価通知詳細（未実装）</div>} />
            <Route path="history" element={<div>評価履歴（未実装）</div>} />
            <Route path="appeals" element={<AppealV3Page />} />
            <Route path="appeals/new" element={<AppealV3Page />} />
            <Route path="interviews" element={<InterviewStation />} />
            <Route path="interviews/new" element={<InterviewStation />} />
          </Routes>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRouter;