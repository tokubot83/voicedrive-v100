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
import { PersonalStationPage } from '../pages/PersonalStationPage';
import { LeaderStationPage } from '../pages/LeaderStationPage';
import { DepartmentStationPage } from '../pages/DepartmentStationPage';
import { SectionStationPage } from '../pages/SectionStationPage';
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
import { StrategicHRPage } from '../pages/StrategicHRPage';
import BoardReportsPage from '../pages/BoardReportsPage';
import GovernancePage from '../pages/GovernancePage';
import VotingSystemGuide from '../pages/VotingSystemGuide';
import StaffVotingGuide from '../pages/StaffVotingGuide';
import IdeaVoiceGuide from '../pages/IdeaVoiceGuide';
import FreeVoiceGuide from '../pages/FreeVoiceGuide';
import ComplianceGuide from '../pages/ComplianceGuide';
import InterviewGuide from '../pages/InterviewGuide';
import UserGuide from '../pages/UserGuide';
import ProposalManagementGuide from '../pages/ProposalManagementGuide';
import { ProposalGeneratorPage } from '../pages/ProposalGeneratorPage';

// Test pages
import MedicalAPITestPanel from '../components/test/MedicalAPITestPanel';
import TestSummaryReceiver from '../pages/TestSummaryReceiver';

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
import PrivacyPolicy from '../pages/PrivacyPolicy';

// Demo pages
import TimeAxisDemo from '../components/TimeAxisDemo';
import { HierarchyDemo } from '../components/demo/HierarchyDemo';
import ProgressiveVisibilityDemo from '../components/demo/ProgressiveVisibilityDemo';

// Analytics
import ExecutiveDashboard from '../components/analytics/ExecutiveDashboard';

// HR Functions
import HRFunctionsPage from '../pages/HRFunctionsPage';

// Whistleblowing
import WhistleblowingPage from '../pages/WhistleblowingPage';
import MyReportsPage from '../pages/MyReportsPage';
import MyReportDetailPage from '../pages/MyReportDetailPage';

// Compose
import ComposePage from '../pages/ComposePage';

// Interview Booking
import InterviewStation from '../pages/InterviewStation';
import InterviewManagementPage from '../pages/InterviewManagementPage';

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
import AutoProjectizationPage from '../pages/AutoProjectizationPage';
import FacilityProjectManagementPage from '../pages/FacilityProjectManagementPage';

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

// Board Preparation
import { BoardPreparationPage } from '../pages/BoardPreparationPage';

// Generational Analysis
import GenerationalAnalysisPage from '../pages/GenerationalAnalysisPage';
import DepartmentGenerationalAnalysisPage from '../pages/DepartmentGenerationalAnalysisPage';

// Hierarchical Analysis
import HierarchicalAnalysisPage from '../pages/HierarchicalAnalysisPage';

// User Analysis
import UserAnalysisPage from '../pages/UserAnalysisPage';

// Professional Analysis
import ProfessionalAnalysisPage from '../pages/ProfessionalAnalysisPage';

// Admin pages
import { SystemSettingsPage } from '../pages/SystemSettingsPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { ModeSwitcherPage } from '../pages/admin/ModeSwitcherPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { SystemMonitorPage } from '../pages/admin/SystemMonitorPage';

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
            <ProtectedRoute requiredLevel={12}>
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
        
        {/* HR Dashboard (Level 5+) */}
        <Route path="hr-dashboard" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
            <HRDashboardPage />
          </ProtectedRoute>
        } />
        
        {/* HR Functions (Level 8+) */}
        <Route path="interview-management" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <HRFunctionsPage />
          </ProtectedRoute>
        } />
        <Route path="policy-management" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <HRFunctionsPage />
          </ProtectedRoute>
        } />
        <Route path="talent-analytics" element={
          <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_8}>
            <HRFunctionsPage />
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
      <Route path="project-tracking" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_1}>
          {React.createElement(React.lazy(() => import('../pages/ProjectTracking')))}
        </ProtectedRoute>
      } />

      <Route path="project-approval" element={
        <ProtectedRoute requiredLevel={3.5}>
          {React.createElement(React.lazy(() => import('../pages/ProjectApprovalPage')))}
        </ProtectedRoute>
      } />

      {/* Auto Projectization (Level 3.5+) */}
      <Route path="auto-projectization" element={
        <ProtectedRoute requiredLevel={3.5}>
          <AutoProjectizationPage />
        </ProtectedRoute>
      } />

      {/* Facility Project Management (Level 10+) */}
      <Route path="facility-project-management" element={
        <ProtectedRoute requiredLevel={10}>
          <FacilityProjectManagementPage />
        </ProtectedRoute>
      } />

      <Route path="free-voice-guide" element={<FreeVoiceGuide />} />
      <Route path="compliance-guide" element={<ComplianceGuide />} />
      <Route path="interview-guide" element={<InterviewGuide />} />
      <Route path="user-guide" element={<UserGuide />} />
      <Route path="proposal-management-guide" element={<ProposalManagementGuide />} />
      <Route path="leader-station" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_2}>
          <LeaderStationPage />
        </ProtectedRoute>
      } />
      <Route path="department-station" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
          <DepartmentStationPage />
        </ProtectedRoute>
      } />
      <Route path="section-station" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_4}>
          <SectionStationPage />
        </ProtectedRoute>
      } />
      
      {/* Interview and Project Management - Full width */}
      <Route path="interview-booking" element={<InterviewStation />} />
      <Route path="interview-management" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <InterviewManagementPage />
        </ProtectedRoute>
      } />
      <Route path="projects" element={<EnhancedProjectListPage />} />
      <Route path="my-projects" element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary>
            {React.createElement(React.lazy(() => import('../pages/MyProjectsPage')))}
          </ErrorBoundary>
        </React.Suspense>
      } />
      
      {/* Analysis Pages - Full width without sidebar */}
      <Route path="generational-analysis" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_7}>
          <GenerationalAnalysisPage />
        </ProtectedRoute>
      } />
      <Route path="department-generational-analysis" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
          <DepartmentGenerationalAnalysisPage />
        </ProtectedRoute>
      } />
      <Route path="hierarchical-analysis" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <HierarchicalAnalysisPage />
        </ProtectedRoute>
      } />
      <Route path="user-analysis" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
          <UserAnalysisPage />
        </ProtectedRoute>
      } />
      <Route path="professional-analysis" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <ProfessionalAnalysisPage />
        </ProtectedRoute>
      } />
      
      {/* Admin Pages - Full width without sidebar */}
      <Route path="admin/users" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="admin/system-settings" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_6}>
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
          <SystemMonitorPage />
        </ProtectedRoute>
      } />
      <Route path="admin/audit-logs" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <AuditLogPage />
        </ProtectedRoute>
      } />
      
      {/* Policy Management - Full width without sidebar */}
      <Route path="policy" element={
        <ProtectedRoute requiredLevel={PermissionLevel.LEVEL_5}>
          <PolicyManagementPage />
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