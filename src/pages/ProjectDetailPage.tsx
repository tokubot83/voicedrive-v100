import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProjectDetailService, ProjectDetail } from '../services/ProjectDetailService';
import { ProjectTeamService } from '../services/ProjectTeamService';
import { ProjectApprovalActionService } from '../services/ProjectApprovalActionService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calendar, Users, CheckCircle, Clock, FolderOpen, ArrowLeft } from 'lucide-react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

// 日付フォーマット関数（date-fnsの代替）
const formatDate = (date: Date, formatStr: string, options?: { locale?: any }): string => {
  const d = new Date(date);
  
  if (formatStr === 'yyyy年MM月dd日') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }
  
  if (formatStr === 'MM/dd HH:mm') {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  }
  
  // デフォルトフォーマット
  return d.toLocaleDateString('ja-JP');
};

// ProjectDetail型はProjectDetailServiceからインポート

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // マイプロジェクトページのパスを生成
  const getMyProjectsPath = () => {
    // 通常は /my-projects に遷移
    return '/my-projects';
  };

  // Load project details
  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!projectId) return;

      setLoading(true);
      try {
        const projectDetail = await ProjectDetailService.getProjectDetail(projectId);
        setProject(projectDetail);
      } catch (error) {
        console.error('Failed to load project details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [projectId]);

  // Handle approval action
  const handleApprove = async () => {
    if (!project || !user) return;

    const comments = window.prompt('承認コメントを入力してください（任意）:');
    if (comments === null) return; // User cancelled

    setActionLoading(true);
    try {
      await ProjectApprovalActionService.approveProject(
        project.id,
        user.id,
        comments || undefined
      );

      alert('プロジェクトを承認しました');
      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('承認処理に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle rejection action
  const handleReject = async () => {
    if (!project || !user) return;

    const reason = window.prompt('却下理由を入力してください:');
    if (!reason) {
      alert('却下理由は必須です');
      return;
    }

    setActionLoading(true);
    try {
      await ProjectApprovalActionService.rejectProject(
        project.id,
        user.id,
        reason
      );

      alert('プロジェクトを却下しました');
      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('却下処理に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle member participation
  const handleJoinProject = async () => {
    if (!project || !user) return;

    setActionLoading(true);
    try {
      await ProjectTeamService.joinProject(project.id, user.id);

      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to join project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <p className="text-gray-400">プロジェクトが見つかりません</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  const canApprove = () => {
    if (!user) return false;
    const currentStep = project.approvalFlow.steps[project.approvalFlow.currentStep - 1];
    return currentStep && currentStep.approver === user.name && currentStep.status === 'pending';
  };

  const canJoin = () => {
    if (!user) return false;
    const invitation = project.selectedMembers.find(m => m.name === user.name);
    return invitation && invitation.status === 'invited';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">戻る</span>
            </button>
            <Link
              to={getMyProjectsPath()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm">マイプロジェクト</span>
            </Link>
          </div>
          <Badge color={getStatusColor(project.status)}>
            {project.status === 'pending' && '承認待ち'}
            {project.status === 'approved' && '承認済み'}
            {project.status === 'rejected' && '却下'}
            {project.status === 'in_progress' && '進行中'}
            {project.status === 'completed' && '完了'}
          </Badge>
        </div>
      </header>

      <div className="p-6 space-y-6">

        {/* Project Overview */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2 text-white">{project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>{project.category}</span>
            <span>•</span>
            <span>{project.author.name} ({project.author.department})</span>
            <span>•</span>
            <span>{formatDate(project.createdAt, 'yyyy年MM月dd日')}</span>
          </div>
          <p className="text-gray-300 mb-6">{project.content}</p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canApprove() && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? '処理中...' : '承認する'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading ? '処理中...' : '却下する'}
                </Button>
              </>
            )}
            {canJoin() && (
              <Button
                onClick={handleJoinProject}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? '処理中...' : 'プロジェクトに参加'}
              </Button>
            )}
          </div>
        </div>
      </Card>

        {/* Consensus Status */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <CheckCircle className="h-5 w-5 text-green-400" />
            合意形成状況
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">合意レベル</span>
                <span className="font-semibold text-white">{project.consensusLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${project.consensusLevel}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">賛成: {project.upvotes}票</span>
              <span className="text-red-600">反対: {project.downvotes}票</span>
            </div>
          </div>
        </div>
      </Card>

        {/* Approval Flow */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">承認プロセス</h2>
          <div className="space-y-3">
            {project.approvalFlow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  step.status === 'approved' ? 'bg-green-500' :
                  step.status === 'rejected' ? 'bg-red-500' :
                  index < project.approvalFlow.currentStep - 1 ? 'bg-gray-400' :
                  'bg-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{step.title}</p>
                      <p className="text-sm text-gray-400">{step.approver}</p>
                    </div>
                    <div className="text-right">
                      <Badge color={getStatusColor(step.status)} size="sm">
                        {step.status === 'approved' && '承認済み'}
                        {step.status === 'rejected' && '却下'}
                        {step.status === 'pending' && '承認待ち'}
                      </Badge>
                      {step.approvedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(step.approvedAt, 'MM/dd HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                  {step.comments && (
                    <p className="text-sm text-gray-400 mt-1">{step.comments}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

        {/* Selected Members */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-blue-400" />
            選定メンバー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.selectedMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-900/50">
                <div>
                  <p className="font-medium text-white">{member.name}</p>
                  <p className="text-sm text-gray-400">{member.department} - {member.role}</p>
                </div>
                <Badge 
                  color={
                    member.status === 'accepted' ? 'green' :
                    member.status === 'declined' ? 'red' :
                    'yellow'
                  }
                  size="sm"
                >
                  {member.status === 'accepted' && '参加済み'}
                  {member.status === 'declined' && '辞退'}
                  {member.status === 'invited' && '招待中'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

        {/* Timeline */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-purple-400" />
            タイムライン
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">投票締切</span>
              </div>
              <span className="font-medium text-white">
                {formatDate(project.timeline.votingDeadline, 'yyyy年MM月dd日')}
              </span>
            </div>
            {project.timeline.projectStart && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">プロジェクト開始</span>
                </div>
                <span className="font-medium text-white">
                  {formatDate(project.timeline.projectStart, 'yyyy年MM月dd日')}
                </span>
              </div>
            )}
            {project.timeline.projectEnd && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">プロジェクト完了予定</span>
                </div>
                <span className="font-medium text-white">
                  {formatDate(project.timeline.projectEnd, 'yyyy年MM月dd日')}
                </span>
              </div>
            )}
          </div>
        </div>
        </Card>
      </div>
      
      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};