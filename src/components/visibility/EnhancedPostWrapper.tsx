// 段階的公開機能を統合した投稿ラッパーコンポーネント
import React from 'react';
import { Post, User } from '../../types';
import { PostVisibilityStatus } from './PostVisibilityStatus';
import { usePostVisibility } from '../../hooks/visibility/usePostVisibility';
import VotingSection from '../VotingSection';
import CommentForm from '../CommentForm';
import CommentList from '../CommentList';
import { ProjectScope } from '../../permissions/types/PermissionTypes';

interface EnhancedPostWrapperProps {
  post: Post;
  currentUser: User;
  organizationSize?: number;
  children?: React.ReactNode;
}

export const EnhancedPostWrapper: React.FC<EnhancedPostWrapperProps> = ({
  post,
  currentUser,
  organizationSize = 400,
  children
}) => {
  const {
    displayConfig,
    upgradeStatus,
    isLoading,
    canVote,
    canComment,
    hasEmergencyOverride,
    executeEmergencyEscalation,
    getVisibilityInfo
  } = usePostVisibility(post, currentUser, { organizationSize });

  const handleEmergencyEscalation = async (targetScope: ProjectScope, justification?: string) => {
    try {
      const result = await executeEmergencyEscalation(targetScope, justification);
      if (result?.success) {
        // 成功時の処理（通知など）
        console.log('Emergency escalation successful:', result);
      }
    } catch (error) {
      console.error('Emergency escalation failed:', error);
      // エラー処理
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!displayConfig) {
    return null;
  }

  const visibilityInfo = getVisibilityInfo();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* メインコンテンツ */}
      <div className="p-6">
        {children}
        
        {/* 公開範囲・アクセス状況 */}
        <div className="mt-4">
          <PostVisibilityStatus
            post={post}
            currentUser={currentUser}
            displayConfig={displayConfig}
          />
        </div>
      </div>

      {/* 投票セクション */}
      {canVote && (
        <div className="border-t px-6 py-4">
          <VotingSection 
            post={post} 
            currentUser={currentUser}
            onVote={(postId: string, option: any) => {
              // 投票処理の実装
              console.log('Vote submitted:', postId, option);
            }}
          />
        </div>
      )}

      {/* コメントセクション */}
      <div className="border-t px-6 py-4">
        <CommentList 
          comments={post.comments} 
          currentUser={currentUser}
        />
        
        {canComment && (
          <div className="mt-4">
            <CommentForm 
              postId={post.id}
              currentUser={currentUser}
              onSubmit={(comment) => {
                // コメント送信処理の実装
                console.log('Comment submitted:', comment);
              }}
              onCancel={() => {
                // キャンセル処理の実装
                console.log('Comment cancelled');
              }}
            />
          </div>
        )}
        
        {!canComment && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            <p>現在のアクセスレベルではコメントできません</p>
            <p className="text-xs mt-1">
              {visibilityInfo.userScopeLabel}の職員として閲覧中
            </p>
          </div>
        )}
      </div>

      {/* 緊急昇格パネル（権限がある場合のみ） */}
      {hasEmergencyOverride && displayConfig.emergencyOverrideOptions && (
        <div className="border-t bg-red-50 px-6 py-4">
          <div className="text-sm font-medium text-red-800 mb-2">
            緊急昇格オプション
          </div>
          <div className="flex flex-wrap gap-2">
            {displayConfig.emergencyOverrideOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  const justification = option.requiresJustification 
                    ? prompt('緊急昇格の理由を入力してください:')
                    : undefined;
                  
                  if (!option.requiresJustification || justification) {
                    handleEmergencyEscalation(option.targetLevel, justification);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 昇格通知 */}
      {upgradeStatus?.shouldUpgrade && (
        <div className="border-t bg-blue-50 px-6 py-3">
          <div className="text-sm text-blue-800">
            🎉 このプロジェクトは自動昇格の条件を満たしています！
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPostWrapper;