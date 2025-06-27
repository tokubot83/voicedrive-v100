import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApprovalFlowService } from '../services/ApprovalFlowService';
import { NotificationService } from '../services/NotificationService';
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

interface ProjectDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  createdAt: Date;
  author: {
    name: string;
    department: string;
    avatar?: string;
  };
  consensusLevel: number;
  upvotes: number;
  downvotes: number;
  approvalFlow: {
    currentStep: number;
    totalSteps: number;
    steps: Array<{
      id: string;
      title: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      approvedAt?: Date;
      comments?: string;
    }>;
  };
  selectedMembers: Array<{
    id: string;
    name: string;
    department: string;
    role: string;
    status: 'invited' | 'accepted' | 'declined';
  }>;
  timeline: {
    votingDeadline: Date;
    projectStart?: Date;
    projectEnd?: Date;
  };
}

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
        // In a real app, this would be an API call
        // For now, we'll simulate with demo data
        const demoProject: ProjectDetail = {
          id: projectId,
          title: '新しい医療記録管理システムの導入',
          content: '現在の紙ベースの医療記録管理を完全デジタル化し、業務効率を大幅に改善する提案です。',
          category: 'システム改善',
          status: 'pending',
          createdAt: new Date('2024-01-15'),
          author: {
            name: '山田太郎',
            department: '情報システム部',
          },
          consensusLevel: 78,
          upvotes: 45,
          downvotes: 12,
          approvalFlow: {
            currentStep: 2,
            totalSteps: 4,
            steps: [
              {
                id: '1',
                title: '部門長承認',
                approver: '佐藤部長',
                status: 'approved',
                approvedAt: new Date('2024-01-16'),
                comments: '良い提案です。進めてください。'
              },
              {
                id: '2',
                title: '施設責任者承認',
                approver: '田中施設長',
                status: 'pending'
              },
              {
                id: '3',
                title: '経営陣承認',
                approver: '鈴木専務',
                status: 'pending'
              },
              {
                id: '4',
                title: '最終承認',
                approver: '高橋社長',
                status: 'pending'
              }
            ]
          },
          selectedMembers: [
            {
              id: '1',
              name: '田中花子',
              department: '看護部',
              role: 'プロジェクトリーダー',
              status: 'accepted'
            },
            {
              id: '2',
              name: '鈴木一郎',
              department: 'IT部',
              role: 'システムエンジニア',
              status: 'invited'
            },
            {
              id: '3',
              name: '佐藤美咲',
              department: '経理部',
              role: '予算管理',
              status: 'accepted'
            }
          ],
          timeline: {
            votingDeadline: new Date('2024-01-25'),
            projectStart: new Date('2024-02-01'),
            projectEnd: new Date('2024-06-30')
          }
        };
        
        setProject(demoProject);
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
    
    setActionLoading(true);
    try {
      await ApprovalFlowService.approveStep(project.id, user.id);
      await NotificationService.sendNotification({
        type: 'approval_update',
        recipientId: project.author.name,
        message: `${user.name}があなたのプロジェクトを承認しました`,
        projectId: project.id
      });
      
      // Reload project details
      window.location.reload();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle member participation
  const handleJoinProject = async () => {
    if (!project || !user) return;
    
    setActionLoading(true);
    try {
      // Update member status
      await NotificationService.sendNotification({
        type: 'member_joined',
        recipientId: project.author.name,
        message: `${user.name}がプロジェクトに参加しました`,
        projectId: project.id
      });
      
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
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? '処理中...' : '承認する'}
              </Button>
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