/**
 * 施設議題承認ページ（副看護部長/看護部長用）
 * 100点到達時の施設議題を承認/却下する画面
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  CheckCircle,
  XCircle,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
  Building2
} from 'lucide-react';

interface FacilityProposalReviewPageProps {}

export const FacilityProposalReviewPage: React.FC<FacilityProposalReviewPageProps> = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('投稿の取得に失敗しました');
      }

      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('投稿の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 権限チェック（副看護部長・看護部長: LEVEL_8+）
  useEffect(() => {
    if (user && post) {
      if (!user.permissionLevel || Number(user.permissionLevel) < 8) {
        alert('この画面にアクセスする権限がありません');
        navigate('/unauthorized');
      }
    }
  }, [user, post, navigate]);

  const handleSubmit = async () => {
    if (!selectedAction || !reason.trim()) {
      alert('判断と理由を入力してください');
      return;
    }

    if (reason.trim().length < 10) {
      alert('判断理由は10文字以上入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/facility-proposal-review/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: selectedAction,
          reason: reason.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('判断を送信しました');
        navigate('/proposal-management');
      } else {
        alert(result.error || '判断の送信に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">投稿が見つかりません</p>
      </div>
    );
  }

  const voteData = post.pollResult || {};
  const approveVotes = voteData.results?.find((r: any) => r.option.text === '賛成')?.votes || 0;
  const neutralVotes = voteData.results?.find((r: any) => r.option.text === '中立')?.votes || 0;
  const opposeVotes = voteData.results?.find((r: any) => r.option.text === '反対')?.votes || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">施設議題 承認/却下</h1>
          </div>

          {/* 警告バナー */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">最終判断が必要です</p>
                <p className="text-sm text-purple-700 mt-1">
                  この提案は100点に到達し、施設議題になりました。委員会に提出するか、却下するかを判断してください。
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
              <p className="font-semibold text-gray-900">{post.author?.name || '不明'}</p>
              <p className="text-sm text-gray-600">{post.department || '不明'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">現在スコア</p>
              <p className="text-3xl font-bold text-purple-600">{post.agendaScore || 0}点</p>
            </div>
          </div>

          {/* 投票状況 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              施設内投票状況
            </h3>
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

          {/* 議題昇格履歴 */}
          {post.agendaDecisionReason && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">施設議題昇格理由:</p>
              <p className="text-sm text-blue-800">{post.agendaDecisionReason}</p>
              {post.agendaDecisionBy && (
                <p className="text-xs text-blue-600 mt-2">
                  昇格者: {post.decider?.name || '不明'} ({new Date(post.agendaDecisionAt).toLocaleString('ja-JP')})
                </p>
              )}
            </div>
          )}
        </div>

        {/* 判断選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">最終判断を選択</h2>

          <div className="space-y-3">
            {/* 委員会提出承認 */}
            <button
              onClick={() => setSelectedAction('approve_for_committee')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAction === 'approve_for_committee'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-6 h-6 ${
                  selectedAction === 'approve_for_committee' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">委員会提出を承認</p>
                  <p className="text-sm text-gray-600">
                    施設の正式議題として委員会に提出する
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
                    この提案を採用しない（委員会に提出しない）
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 理由入力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block font-semibold text-gray-900 mb-2">
              判断理由 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="判断理由を10文字以上入力してください（必須）"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={5}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">{reason.length} / 1000文字</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction || !reason.trim() || reason.trim().length < 10 || isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '送信中...' : '判断を送信'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityProposalReviewPage;
