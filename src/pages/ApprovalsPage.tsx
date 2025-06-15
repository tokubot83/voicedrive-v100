import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { NotificationService, ActionableNotification, NotificationType } from '../services/NotificationService';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Clock, AlertTriangle, CheckCircle, XCircle, Users, ClipboardCheck, Vote } from 'lucide-react';
// Simple date formatter (replacing date-fns)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import { useNavigate } from 'react-router-dom';

export const ApprovalsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ActionableNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'ALL'>('ALL');
  const [showCommentDialog, setShowCommentDialog] = useState<{
    notification: ActionableNotification;
    action: string;
  } | null>(null);
  const [comment, setComment] = useState('');
  const notificationService = NotificationService.getInstance();

  // 権限チェック
  const hasApprovalPermissions = hasAnyPermission([
    'APPROVAL_MANAGEMENT',
    'EMERGENCY_AUTHORITY',
    'WEIGHT_ADJUSTMENT',
    'PROJECT_MANAGEMENT',
    'MEMBER_SELECTION'
  ]);

  useEffect(() => {
    if (!currentUser || !hasApprovalPermissions) {
      navigate('/unauthorized');
      return;
    }

    loadNotifications();

    const unsubscribe = notificationService.subscribeToNotifications((userId) => {
      if (userId === currentUser.id) {
        loadNotifications();
      }
    });

    return () => unsubscribe();
  }, [currentUser, activeFilter, hasApprovalPermissions]);

  const loadNotifications = () => {
    if (!currentUser) return;

    const filter = activeFilter === 'ALL' ? undefined : { type: activeFilter };
    const userNotifications = notificationService.getUserNotifications(
      currentUser.id,
      { ...filter, pendingOnly: true }
    );
    
    setNotifications(userNotifications);
  };

  const handleAction = async (notification: ActionableNotification, actionId: string) => {
    if (!currentUser) return;

    const action = notification.actions?.find(a => a.id === actionId);
    if (action?.requiresComment) {
      setShowCommentDialog({ notification, action: actionId });
      return;
    }

    const result = await notificationService.executeNotificationAction(
      currentUser.id,
      notification.id,
      actionId
    );

    if (result.success) {
      loadNotifications();
    }
  };

  const submitActionWithComment = async () => {
    if (!currentUser || !showCommentDialog) return;

    const result = await notificationService.executeNotificationAction(
      currentUser.id,
      showCommentDialog.notification.id,
      showCommentDialog.action,
      comment
    );

    if (result.success) {
      setShowCommentDialog(null);
      setComment('');
      loadNotifications();
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPROVAL_REQUIRED':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'MEMBER_SELECTION':
        return <Users className="w-5 h-5" />;
      case 'VOTE_REQUIRED':
        return <Vote className="w-5 h-5" />;
      case 'EMERGENCY_ACTION':
      case 'ESCALATION':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'APPROVAL_REQUIRED':
        return '承認待ち';
      case 'MEMBER_SELECTION':
        return 'メンバー選定';
      case 'VOTE_REQUIRED':
        return '投票依頼';
      case 'EMERGENCY_ACTION':
        return '緊急対応';
      case 'ESCALATION':
        return 'エスカレーション';
      case 'PROJECT_UPDATE':
        return 'プロジェクト更新';
      case 'DEADLINE_REMINDER':
        return '期限リマインダー';
      default:
        return 'その他';
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'すべて', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'APPROVAL_REQUIRED', label: '承認待ち', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'MEMBER_SELECTION', label: 'メンバー選定', icon: <Users className="w-4 h-4" /> },
    { id: 'VOTE_REQUIRED', label: '投票依頼', icon: <Vote className="w-4 h-4" /> },
    { id: 'EMERGENCY_ACTION', label: '緊急対応', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
    return groups;
  }, {} as Record<NotificationType, ActionableNotification[]>);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">承認・対応管理</h1>
          <p className="text-gray-600">
            あなたの対応が必要な案件を一元管理します
          </p>
        </div>

        {/* フィルタータブ */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as NotificationType | 'ALL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="ml-1 text-sm">
                  ({activeFilter === 'ALL' 
                    ? notifications.length 
                    : notifications.filter(n => n.type === tab.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 通知リスト */}
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">対応待ちの案件はありません</h3>
            <p className="text-gray-600">
              すべての案件が処理されています
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Object.entries(groupedNotifications).map(([type, typeNotifications]) => (
              <div key={type} className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  {getTypeIcon(type as NotificationType)}
                  {getTypeLabel(type as NotificationType)}
                  <span className="text-sm text-gray-500">({typeNotifications.length}件)</span>
                </h2>
                
                {typeNotifications.map(notification => (
                  <Card key={notification.id} className={`p-6 ${
                    notification.type === 'EMERGENCY_ACTION' || notification.type === 'ESCALATION'
                      ? 'border-red-500 bg-red-50'
                      : notification.dueDate && notification.dueDate < new Date()
                      ? 'border-orange-500 bg-orange-50'
                      : ''
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {notification.title}
                        </h3>
                        
                        <p className="text-gray-700 mb-4">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          {notification.dueDate && (
                            <span className={`flex items-center gap-1 ${
                              notification.dueDate < new Date() ? 'text-red-600 font-semibold' : ''
                            }`}>
                              <AlertTriangle className="w-4 h-4" />
                              期限: {formatDate(notification.dueDate)}
                            </span>
                          )}
                        </div>
                        
                        {notification.metadata && (
                          <div className="bg-gray-100 rounded-lg p-3 mb-4 text-sm">
                            {notification.metadata.projectId && (
                              <div>プロジェクトID: {notification.metadata.projectId}</div>
                            )}
                            {notification.metadata.postId && (
                              <div>投稿ID: {notification.metadata.postId}</div>
                            )}
                            {notification.metadata.workflowStage && (
                              <div>ワークフローステージ: {notification.metadata.workflowStage}</div>
                            )}
                          </div>
                        )}
                        
                        {notification.actions && (
                          <div className="flex gap-3">
                            {notification.actions.map(action => (
                              <button
                                key={action.id}
                                onClick={() => handleAction(notification, action.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  action.type === 'primary'
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : action.type === 'danger'
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* コメントダイアログ */}
        {showCommentDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                コメントを入力してください
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg resize-none"
                placeholder="理由やコメントを入力..."
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitActionWithComment}
                  disabled={!comment.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  送信
                </button>
                <button
                  onClick={() => {
                    setShowCommentDialog(null);
                    setComment('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};