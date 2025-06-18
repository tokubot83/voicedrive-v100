import React, { useState } from 'react';
import { Comment, CommentType, User, AnonymityLevel } from '../../types';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface ThreadedCommentSystemProps {
  postId: string;
  comments: Comment[];
  currentUser?: User;
  onComment: (postId: string, comment: Partial<Comment>) => void;
}

// コメントタイプの設定
const commentTypes = [
  { type: 'proposal' as CommentType, label: '提案・改善案', icon: '💡', color: 'text-blue-400' },
  { type: 'question' as CommentType, label: '質問・確認', icon: '❓', color: 'text-purple-400' },
  { type: 'support' as CommentType, label: '賛成意見', icon: '👍', color: 'text-green-400' },
  { type: 'concern' as CommentType, label: '懸念・課題指摘', icon: '⚠️', color: 'text-orange-400' }
];

const ThreadedCommentSystem: React.FC<ThreadedCommentSystemProps> = ({
  postId,
  comments,
  currentUser,
  onComment
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [selectedCommentType, setSelectedCommentType] = useState<CommentType>('proposal');
  const [anonymityLevel, setAnonymityLevel] = useState<AnonymityLevel>('partial');

  // トップレベルのコメントのみ取得
  const topLevelComments = comments.filter(comment => !comment.parentId);

  const handleSubmitComment = (parentId?: string) => {
    if (!commentContent.trim() || !currentUser) return;

    const newComment: Partial<Comment> = {
      postId,
      parentId,
      content: commentContent,
      commentType: selectedCommentType,
      anonymityLevel,
      author: currentUser,
      timestamp: new Date()
    };

    onComment(postId, newComment);
    setCommentContent('');
    setShowCommentForm(false);
    setReplyingTo(null);
  };

  const getAuthorDisplay = (comment: Comment) => {
    if (comment.anonymityLevel === 'anonymous') {
      return '匿名ユーザー';
    } else if (comment.anonymityLevel === 'partial') {
      return `${comment.visibleInfo?.position || '職員'} (${comment.visibleInfo?.experienceYears || '?'}年目)`;
    } else if (comment.anonymityLevel === 'selective') {
      return `${comment.author.name} (${comment.visibleInfo?.facility || '所属非公開'})`;
    }
    return `${comment.author.name} (${comment.author.position})`;
  };

  const CommentItem: React.FC<{ comment: Comment; depth: number }> = ({ comment, depth }) => {
    const commentType = commentTypes.find(ct => ct.type === comment.commentType);
    
    return (
      <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''} mb-4`}>
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
          {/* コメントヘッダー */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{commentType?.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${commentType?.color} font-medium`}>
                    {commentType?.label}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    {getAuthorDisplay(comment)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* コメント内容 */}
          <p className="text-gray-200 mb-3">{comment.content}</p>

          {/* アクションボタン */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>返信</span>
            </button>
          </div>

          {/* 返信フォーム */}
          {replyingTo === comment.id && (
            <div className="mt-4 pl-4 border-l-2 border-blue-500">
              <CommentForm
                onSubmit={() => handleSubmitComment(comment.id)}
                onCancel={() => setReplyingTo(null)}
                isReply={true}
              />
            </div>
          )}
        </div>

        {/* ネストされた返信 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const CommentForm: React.FC<{ 
    onSubmit: () => void; 
    onCancel?: () => void;
    isReply?: boolean;
  }> = ({ onSubmit, onCancel, isReply = false }) => {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4">
        {/* コメントタイプ選択 */}
        <div className="flex gap-2 mb-3">
          {commentTypes.map(ct => (
            <button
              key={ct.type}
              onClick={() => setSelectedCommentType(ct.type)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                selectedCommentType === ct.type
                  ? 'bg-gray-700 ring-2 ring-blue-500'
                  : 'bg-gray-800/50 hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{ct.icon}</span>
              {ct.label}
            </button>
          ))}
        </div>

        {/* テキストエリア */}
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder={`${isReply ? '返信' : 'コメント'}を入力...`}
          className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-3 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        {/* 匿名性設定 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-gray-400">公開範囲:</span>
          <select
            value={anonymityLevel}
            onChange={(e) => setAnonymityLevel(e.target.value as AnonymityLevel)}
            className="bg-gray-800 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="anonymous">完全匿名</option>
            <option value="partial">職種・経験年数のみ</option>
            <option value="selective">施設まで公開</option>
            <option value="full">完全公開</option>
          </select>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={!commentContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isReply ? '返信する' : 'コメントする'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* コメント投稿ボタン */}
      {!showCommentForm && (
        <button
          onClick={() => setShowCommentForm(true)}
          className="w-full py-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>ディスカッションに参加する</span>
        </button>
      )}

      {/* メインコメントフォーム */}
      {showCommentForm && (
        <CommentForm
          onSubmit={() => handleSubmitComment()}
          onCancel={() => setShowCommentForm(false)}
        />
      )}

      {/* コメントリスト */}
      <div className="space-y-2">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>まだコメントがありません</p>
            <p className="text-sm">最初のコメントを投稿してみましょう</p>
          </div>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadedCommentSystem;