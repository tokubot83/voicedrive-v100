import React, { useState } from 'react';
import { Post, Comment } from '../../types';
import { ProjectPermission } from '../../services/ProjectPermissionService';
import { MessageSquare, Send } from 'lucide-react';

interface ProjectCommentSectionProps {
  post: Post;
  permission: ProjectPermission;
}

const ProjectCommentSection: React.FC<ProjectCommentSectionProps> = ({
  post,
  permission
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = post.comments || [];

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: 実際のAPI呼び出し
      console.log('コメント投稿:', newComment);
      setNewComment('');
    } catch (error) {
      console.error('コメント投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-green-400" />
        <h4 className="text-lg font-bold text-white">
          コメント ({comments.length}件)
        </h4>
      </div>

      {/* コメント入力（権限がある場合のみ） */}
      {permission.canComment && (
        <div className="bg-gray-700/30 rounded-lg p-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              permission.role === 'supervisor'
                ? 'プロジェクトへアドバイスを送る...'
                : '意見やアドバイスを入力...'
            }
            className="w-full bg-gray-700/50 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className={`
                px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors
                ${newComment.trim() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-4 h-4" />
              {permission.role === 'supervisor' ? 'アドバイスを送る' : 'コメントする'}
            </button>
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">まだコメントがありません</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-700/30 rounded-lg p-3"
            >
              {/* コメントヘッダー */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {comment.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {comment.author.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {comment.author.department}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimestamp(comment.timestamp)}
                </div>
              </div>

              {/* コメント本文 */}
              <p className="text-white text-sm leading-relaxed">
                {comment.content}
              </p>

              {/* コメントタイプバッジ */}
              {comment.commentType && (
                <div className="mt-2">
                  <span className={`
                    inline-block px-2 py-0.5 rounded-full text-xs font-medium
                    ${comment.commentType === 'proposal' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${comment.commentType === 'support' ? 'bg-green-500/20 text-green-400' : ''}
                    ${comment.commentType === 'concern' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${comment.commentType === 'question' ? 'bg-purple-500/20 text-purple-400' : ''}
                  `}>
                    {comment.commentType === 'proposal' && '💡 提案'}
                    {comment.commentType === 'support' && '👍 賛成'}
                    {comment.commentType === 'concern' && '⚠️ 懸念'}
                    {comment.commentType === 'question' && '❓ 質問'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectCommentSection;
