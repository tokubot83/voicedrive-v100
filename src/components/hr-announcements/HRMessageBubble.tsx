import React, { useState } from 'react';
import { HRAnnouncement, CategoryConfig } from '../../types/hr-announcements';
import { convertToMedicalTeamPriority, getMedicalPriorityIcon, getMedicalPriorityLabel, getMedicalPriorityColor } from '../../utils/priorityMapping';
import { getSurveySubCategoryLabel, getSurveySubCategoryIcon } from '../../utils/categoryMapping';

interface HRMessageBubbleProps {
  announcement: HRAnnouncement;
  categoryConfig: CategoryConfig;
  onResponse?: (announcementId: string, responseType: string) => void;
}

const HRMessageBubble: React.FC<HRMessageBubbleProps> = ({
  announcement,
  categoryConfig,
  onResponse
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleActionClick = async () => {
    if (!announcement.actionButton) return;

    setIsActionLoading(true);

    // アクションボタンクリック時に自動で応答記録
    if (onResponse && announcement.responseType) {
      await onResponse(announcement.id, announcement.responseType);
    }

    try {
      if (announcement.actionButton.type === 'internal') {
        // 内部ルーティング（React Router）
        window.location.href = announcement.actionButton.url;
      } else if (announcement.actionButton.type === 'medical_system') {
        // 医療システムへのリダイレクト（新しいタブ）
        window.open(announcement.actionButton.url, '_blank', 'noopener,noreferrer');
      } else {
        // 外部リンク
        window.open(announcement.actionButton.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setTimeout(() => setIsActionLoading(false), 1000);
    }
  };

  const getIconClass = () => {
    switch (announcement.priority) {
      case 'URGENT':
        return 'hr-icon-urgent';
      case 'HIGH':
        return 'hr-icon-warning';
      default:
        return announcement.category === 'MEETING' ? 'hr-icon-info' : 'hr-icon-normal';
    }
  };

  const getBubbleClass = () => {
    const baseClass = 'hr-message-bubble';
    switch (announcement.category) {
      case 'ANNOUNCEMENT':
        return announcement.priority === 'URGENT' ? `${baseClass} hr-bubble-urgent` : baseClass;
      case 'MEETING':
        return `${baseClass} hr-bubble-meeting`;
      case 'TRAINING':
        return `${baseClass} hr-bubble-training`;
      case 'SURVEY':
        return `${baseClass} hr-bubble-survey`;
      default:
        return baseClass;
    }
  };

  const getTagClass = () => {
    switch (announcement.category) {
      case 'ANNOUNCEMENT':
        return announcement.priority === 'URGENT' ? 'hr-tag-urgent' : 'hr-tag-announcement';
      case 'MEETING':
        return 'hr-tag-meeting';
      case 'TRAINING':
        return 'hr-tag-training';
      case 'SURVEY':
        return 'hr-tag-survey';
      default:
        return 'hr-tag-other';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getActionButtonClass = () => {
    const baseClass = 'hr-action-button';
    switch (announcement.category) {
      case 'MEETING':
        return `${baseClass} meeting`;
      case 'HEALTH':
        return `${baseClass} health`;
      case 'SURVEY':
        // アンケートカテゴリの場合、サブカテゴリも考慮
        let surveyClass = `${baseClass} survey`;
        if (announcement.surveySubCategory) {
          switch (announcement.surveySubCategory) {
            case 'satisfaction':
              surveyClass += ' survey-satisfaction';
              break;
            case 'training':
              surveyClass += ' survey-training';
              break;
            case 'workplace':
              surveyClass += ' survey-workplace';
              break;
            case 'health':
              surveyClass += ' survey-health';
              break;
            case 'feedback':
              surveyClass += ' survey-feedback';
              break;
            default:
              break;
          }
        }
        return surveyClass;
      default:
        return baseClass;
    }
  };

  return (
    <div className="hr-message" data-category={announcement.category}>
      <div className={`hr-message-icon ${getIconClass()}`}>
        {announcement.priority === 'URGENT' ? '!' : categoryConfig.icon}
      </div>

      <div className="hr-message-content">
        <div className={getBubbleClass()}>
          {/* メッセージヘッダー */}
          <div className="hr-message-header">
            <div className="flex items-center gap-2">
              <span className={`hr-category-tag ${getTagClass()}`}>
                {categoryConfig.icon} {categoryConfig.label}
              </span>
              {/* アンケートサブカテゴリバッジ */}
              {announcement.category === 'SURVEY' && announcement.surveySubCategory && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                  {getSurveySubCategoryIcon(announcement.surveySubCategory)}
                  {getSurveySubCategoryLabel(announcement.surveySubCategory)}
                </span>
              )}
              {/* 優先度バッジ */}
              {announcement.priority !== 'NORMAL' && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                  style={{
                    backgroundColor: getMedicalPriorityColor(
                      convertToMedicalTeamPriority(announcement.priority)
                    )
                  }}
                >
                  {getMedicalPriorityIcon(convertToMedicalTeamPriority(announcement.priority))}
                  優先度{getMedicalPriorityLabel(convertToMedicalTeamPriority(announcement.priority))}
                </span>
              )}
            </div>
            <span className="hr-time-label">
              {formatTime(announcement.publishAt)}
            </span>
          </div>

          {/* メッセージタイトル */}
          <div className="hr-message-title">
            {announcement.title}
          </div>

          {/* メッセージ本文 */}
          <div className="hr-message-text">
            {announcement.content}
          </div>

          {/* 特別な表示要素（研修の場合の参加案内など） */}
          {announcement.category === 'TRAINING' && announcement.targetAudience.roles && (
            <div className="hr-message-info">
              <span>ℹ️</span>
              <div>
                参加申込みは1月15日（水）までにマイページより行ってください。
              </div>
            </div>
          )}

          {/* アクションボタン（面談予約、ストレスチェックなど） */}
          {announcement.actionButton && (
            <button
              className={getActionButtonClass()}
              onClick={handleActionClick}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  処理中...
                </>
              ) : (
                announcement.actionButton.text
              )}
            </button>
          )}

          {/* フッター */}
          <div className="hr-message-footer">
            <span className="hr-author">
              👤 {announcement.authorDepartment} {announcement.authorName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRMessageBubble;