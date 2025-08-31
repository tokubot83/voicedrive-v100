import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ExternalLink, Calendar } from 'lucide-react';
import { EvaluationNotificationListItem } from '../../types/evaluation-notification';
import { V3GradeUtils } from '../../types/appeal-v3';
import { evaluationNotificationService } from '../../services/evaluationNotificationService';

interface EvaluationNotificationCardProps {
  notification: EvaluationNotificationListItem;
  onAppealClick?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

const EvaluationNotificationCard: React.FC<EvaluationNotificationCardProps> = ({
  notification,
  onAppealClick,
  onMarkAsRead
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAppealClick = async () => {
    if (onAppealClick) {
      setIsLoading(true);
      try {
        await evaluationNotificationService.trackAppealLinkClick(notification.id);
        onAppealClick(notification.id);
      } catch (error) {
        console.error('異議申立リンククリックエラー:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMarkAsRead = async () => {
    if (onMarkAsRead && notification.notificationStatus !== 'read') {
      try {
        await evaluationNotificationService.markAsRead(notification.id);
        onMarkAsRead(notification.id);
      } catch (error) {
        console.error('既読マークエラー:', error);
      }
    }
  };

  const getGradeColorClass = (grade: string): string => {
    const color = V3GradeUtils.getGradeColor(grade);
    return color;
  };

  const getUrgencyIndicator = () => {
    if (notification.isUrgent) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          <span>緊急</span>
        </div>
      );
    }
    return null;
  };

  const getAppealStatusBadge = () => {
    switch (notification.appealStatus) {
      case 'submitted':
        return (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            申立済み
          </div>
        );
      case 'in_review':
        return (
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            審査中
          </div>
        );
      case 'resolved':
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            完了
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`
        bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200
        ${notification.notificationStatus === 'read' ? 'opacity-75' : ''}
        ${notification.isUrgent ? 'border-l-4 border-l-red-500' : 'border-gray-200'}
      `}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: getGradeColorClass(notification.grade) }}
          >
            {notification.grade}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {notification.evaluationPeriod} 評価結果
            </h3>
            <p className="text-gray-600 text-sm">
              {notification.employeeName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getUrgencyIndicator()}
          {getAppealStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm text-gray-600">評価スコア</span>
          <div className="font-bold text-xl text-gray-900">
            {notification.score}点
          </div>
          <div className="text-sm text-gray-500">
            {V3GradeUtils.getGradeDescription(notification.grade)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm text-gray-600">異議申立締切</span>
          <div className="font-semibold text-gray-900">
            {formatDate(notification.appealDeadline)}
          </div>
          <div className={`text-sm ${notification.daysUntilDeadline <= 3 ? 'text-red-600' : 'text-gray-500'}`}>
            {notification.daysUntilDeadline > 0 
              ? `あと${notification.daysUntilDeadline}日`
              : notification.daysUntilDeadline === 0
              ? '本日締切'
              : '締切済み'
            }
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          開示日: {formatDate(notification.disclosureDate)}
        </div>
        
        {notification.appealStatus === 'none' && notification.daysUntilDeadline > 0 && (
          <button
            onClick={handleAppealClick}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors duration-200 text-sm font-medium
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                異議申立をする
              </>
            )}
          </button>
        )}

        {notification.appealStatus !== 'none' && (
          <button
            onClick={() => {/* 申立状況確認画面へ */}}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            申立状況を確認
          </button>
        )}
      </div>

      {notification.notificationStatus !== 'read' && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default EvaluationNotificationCard;