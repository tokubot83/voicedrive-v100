// 投稿公開範囲・アクセス状況表示コンポーネント
import React from 'react';
import { Eye, Vote, MessageCircle, ArrowUp, AlertTriangle, Zap } from 'lucide-react';
import { PostDisplayConfig, StakeholderGroup, ProjectLevel } from '../../types/visibility';
import { Post, User } from '../../types';
import { PostVisibilityEngine } from '../../services/PostVisibilityEngine';

interface PostVisibilityStatusProps {
  post: Post;
  currentUser: User;
  displayConfig: PostDisplayConfig;
}

export const PostVisibilityStatus: React.FC<PostVisibilityStatusProps> = ({
  post,
  currentUser,
  displayConfig
}) => {
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'text-green-600 bg-green-50';
      case 'limited': return 'text-yellow-600 bg-yellow-50';
      case 'view_only': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'full': return <Vote className="w-4 h-4" />;
      case 'limited': return <MessageCircle className="w-4 h-4" />;
      case 'view_only': return <Eye className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getAccessLevelText = (level: string) => {
    switch (level) {
      case 'full': return '投票・コメント可能';
      case 'limited': return 'コメントのみ可能';
      case 'view_only': return '閲覧のみ';
      default: return '閲覧のみ';
    }
  };

  const getScopeIcon = (scope: StakeholderGroup) => {
    switch (scope) {
      case StakeholderGroup.SAME_TEAM: return '👥';
      case StakeholderGroup.SAME_DEPARTMENT: return '🏢';
      case StakeholderGroup.SAME_FACILITY: return '🏥';
      case StakeholderGroup.SAME_ORGANIZATION: return '🌐';
      default: return '👁️';
    }
  };

  const getScopeText = (scope: StakeholderGroup) => {
    switch (scope) {
      case StakeholderGroup.SAME_TEAM: return 'チーム内';
      case StakeholderGroup.SAME_DEPARTMENT: return '部署内';
      case StakeholderGroup.SAME_FACILITY: return '施設内';
      case StakeholderGroup.SAME_ORGANIZATION: return '法人内';
      default: return '全職員';
    }
  };

  const getCurrentScope = (): StakeholderGroup => {
    const engine = new PostVisibilityEngine();
    return engine.getUserScope(post, currentUser);
  };

  const getProjectLevel = (): ProjectLevel => {
    const engine = new PostVisibilityEngine();
    return engine.getPostCurrentLevel(post);
  };

  const currentScope = getCurrentScope();
  const projectLevel = getProjectLevel();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* アクセス状況表示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getAccessLevelColor(displayConfig.accessLevel)}`}>
            {getAccessLevelIcon(displayConfig.accessLevel)}
            {getAccessLevelText(displayConfig.accessLevel)}
          </div>
        </div>
        
        {/* 現在の公開範囲 */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span>{getScopeIcon(currentScope)}</span>
          <span>{getScopeText(currentScope)}で公開中</span>
        </div>
      </div>

      {/* 昇格通知 */}
      {displayConfig.upgradeNotification && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <ArrowUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            {displayConfig.upgradeNotification}
          </div>
        </div>
      )}

      {/* 緊急昇格オプション */}
      {displayConfig.showEmergencyOverride && displayConfig.emergencyOverrideOptions && (
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">緊急昇格オプション</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayConfig.emergencyOverrideOptions.map((option, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                onClick={() => {
                  // 緊急昇格実行のハンドラ（実装時に追加）
                  console.log('Emergency override:', option);
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* プロジェクト進捗情報 */}
      {displayConfig.showProjectStatus && post.projectStatus && typeof post.projectStatus === 'object' && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">プロジェクト化進捗</span>
            <span className="font-medium">
              {post.projectStatus.score}pt / {post.projectStatus.threshold}pt
            </span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(post.projectStatus.progress, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            次のレベルまで {post.projectStatus.threshold - post.projectStatus.score}pt
          </div>
        </div>
      )}

      {/* アクセス権限の説明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <Vote className="w-3 h-3" />
          <span>投票権限: {displayConfig.showVoteButtons ? '有り' : '無し'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-3 h-3" />
          <span>コメント権限: {displayConfig.showCommentForm ? '有り' : '無し'}</span>
        </div>
      </div>
    </div>
  );
};

export default PostVisibilityStatus;