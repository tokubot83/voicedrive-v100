/**
 * 提案レビューページ（主任・師長用）
 * 部署議題モード - 50点到達時の承認/却下画面
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  CheckCircle,
  TrendingUp,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ProposalReviewPageProps {}

export const ProposalReviewPage: React.FC<ProposalReviewPageProps> = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('提案の取得に失敗しました');
      }

      const data = await response.json();

      // API response has { success: true, post: {...} } structure
      if (data.success && data.post) {
        setPost(data.post);
      } else {
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('提案の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 権限チェック
  useEffect(() => {
    if (user && post) {
      // 主任（LEVEL_5-6）または師長以上（LEVEL_7+）のみアクセス可能
      if (!user.permissionLevel || Number(user.permissionLevel) < 5) {
        navigate('/unauthorized');
      }
    }
  }, [user, post, navigate]);

  const handleSubmit = async () => {
    if (!selectedAction || !reason.trim()) {
      setError('判断と理由を入力してください');
      return;
    }

    if (reason.trim().length < 10) {
      setError('判断理由は10文字以上入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/proposal-review/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: selectedAction,
          reason: reason.trim(),
          comment: comment.trim(),
          reviewerId: user!.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || '判断の送信に失敗しました');
      }

      const result = await response.json();
      alert(result.message || '判断を送信しました');
      navigate('/proposal-management');
    } catch (err: any) {
      setError(err.message || '判断の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">投稿が見つかりません</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const voteCount = post.voteCount || { approve: 0, neutral: 0, oppose: 0 };
  const approveVotes = voteCount.approve;
  const neutralVotes = voteCount.neutral;
  const opposeVotes = voteCount.oppose;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">部署議題 承認/却下</h1>
          </div>

          {/* 警告バナー */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">判断が必要です</p>
                <p className="text-sm text-yellow-700 mt-1">
                  この提案は50点に到達しました。部署議題として承認するか、施設議題に昇格するか、却下するかを判断してください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 投稿内容 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{post.content}</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">投稿者</p>
              <p className="font-semibold text-gray-900">{post.author?.name || '匿名'}</p>
              <p className="text-sm text-gray-600">{post.author?.department || '不明'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">現在スコア</p>
              <p className="text-3xl font-bold text-blue-600">{post.agendaScore || 0}点</p>
            </div>
          </div>

          {/* 投票状況 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">投票状況</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{approveVotes}</p>
                <p className="text-sm text-gray-600">賛成</p>
              </div>
              <div className="text-center">
                <Minus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-600">{neutralVotes}</p>
                <p className="text-sm text-gray-600">中立</p>
              </div>
              <div className="text-center">
                <ThumbsDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{opposeVotes}</p>
                <p className="text-sm text-gray-600">反対</p>
              </div>
            </div>
          </div>
        </div>

        {/* 判断選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">判断を選択</h2>

          <div className="space-y-3">
            {/* 部署議題として承認 */}
            <button
              onClick={() => setSelectedAction('approve_as_dept_agenda')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAction === 'approve_as_dept_agenda'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-6 h-6 ${
                  selectedAction === 'approve_as_dept_agenda' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">部署議題として承認</p>
                  <p className="text-sm text-gray-600">
                    部署の正式議題として承認し、部署ミーティングで議論する
                  </p>
                </div>
              </div>
            </button>

            {/* 施設議題に昇格 */}
            <button
              onClick={() => setSelectedAction('escalate_to_facility')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAction === 'escalate_to_facility'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-6 h-6 ${
                  selectedAction === 'escalate_to_facility' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">施設議題に昇格</p>
                  <p className="text-sm text-gray-600">
                    施設全体で検討すべき重要な提案として昇格する
                  </p>
                </div>
              </div>
            </button>

            {/* 却下 */}
            <button
              onClick={() => setSelectedAction('reject')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAction === 'reject'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <XCircle className={`w-6 h-6 ${
                  selectedAction === 'reject' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">却下</p>
                  <p className="text-sm text-gray-600">
                    この提案を採用しない
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 理由・コメント入力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block font-semibold text-gray-900 mb-2">
              判断理由 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="判断理由を入力してください（必須・10文字以上）"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">{reason.length} / 500文字</p>
          </div>

          {selectedAction === 'approve_as_dept_agenda' && (
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                承認コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="職員に向けたメッセージを入力してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={300}
              />
              <p className="text-sm text-gray-500 mt-1">{comment.length} / 300文字</p>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction || !reason.trim() || reason.trim().length < 10 || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '判断を送信'}
          </button>
        </div>
      </div>
    </div>
  );
};
