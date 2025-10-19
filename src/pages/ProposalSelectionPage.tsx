import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, User, Star, MapPin, Edit, Phone, RefreshCw } from 'lucide-react';
import { fetchProposalsWithCache, InterviewProposal, ProposalResponse } from '../api/proposalAPI';
import { submitChoice, requestScheduleAdjustment } from '../api/medicalSystemAPI';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProposalSelectionPage: React.FC = () => {
  const { voicedriveRequestId } = useParams<{ voicedriveRequestId: string }>();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<ProposalResponse | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 提案データ取得
  useEffect(() => {
    const loadProposals = async () => {
      if (!voicedriveRequestId) {
        setError('リクエストIDが見つかりません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchProposalsWithCache(voicedriveRequestId);
        setProposals(data);

        // 期限切れチェック
        const expiresAt = new Date(data.expiresAt).getTime();
        if (expiresAt <= Date.now()) {
          setIsExpired(true);
        }
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('提案データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [voicedriveRequestId]);

  // 期限カウントダウン管理
  useEffect(() => {
    if (!proposals) return;

    const expiresAt = new Date(proposals.expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      const remainingHours = remaining / (1000 * 60 * 60);

      setTimeRemaining(remaining);

      // 6時間前で警告
      if (remainingHours <= 6 && remainingHours > 1) {
        setShowWarning(true);
      }

      // 1時間前で最終警告
      if (remainingHours <= 1 && remaining > 0) {
        setShowWarning(true);
      }

      // 期限切れ
      if (remaining === 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [proposals]);

  // 時間フォーマット
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}日${remainingHours}時間`;
    } else if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else {
      return `${minutes}分`;
    }
  };

  // 提案選択処理
  const handleSelectProposal = async () => {
    if (!selectedProposal || !voicedriveRequestId) return;

    try {
      setSubmitting(true);
      await submitChoice({
        voicedriveRequestId,
        selectedProposalId: selectedProposal,
        feedback: feedback.trim() || undefined
      });

      // 確定ページに遷移
      navigate(`/interview/confirmation/${voicedriveRequestId}`);
    } catch (err) {
      console.error('Failed to submit choice:', err);
      setError('選択の送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // 条件変更依頼
  const handleRequestAdjustment = async () => {
    if (!voicedriveRequestId) return;

    try {
      await requestScheduleAdjustment({
        voicedriveRequestId,
        reason: '提案された時間では都合がつかないため',
        adjustmentType: 'schedule_change'
      });

      // 調整依頼完了ページに遷移
      navigate(`/interview/adjustment-requested/${voicedriveRequestId}`);
    } catch (err) {
      console.error('Failed to request adjustment:', err);
      setError('調整依頼の送信に失敗しました。');
    }
  };

  // 提案カードレンダリング
  const renderProposalCard = (proposal: InterviewProposal) => {
    const isSelected = selectedProposal === proposal.id;
    const rankColors = {
      1: 'border-green-400 bg-green-50',
      2: 'border-orange-400 bg-orange-50',
      3: 'border-blue-400 bg-blue-50'
    };
    const rankLabels = {
      1: '最適',
      2: '代替',
      3: 'その他'
    };
    const rankIcons = {
      1: '🎯',
      2: '🔄',
      3: '📋'
    };

    return (
      <div
        key={proposal.id}
        className={`
          relative border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer
          ${isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-lg transform scale-105'
            : `${rankColors[proposal.rank]} hover:shadow-md hover:scale-102`
          }
        `}
        onClick={() => setSelectedProposal(proposal.id)}
      >
        {/* ランクバッジ */}
        <div className="absolute -top-3 -right-3 flex items-center space-x-2">
          <div className={`
            px-3 py-1 rounded-full text-sm font-bold text-white shadow-md
            ${proposal.rank === 1 ? 'bg-green-500' : proposal.rank === 2 ? 'bg-orange-500' : 'bg-blue-500'}
          `}>
            {rankIcons[proposal.rank]} {rankLabels[proposal.rank]}
          </div>
        </div>

        {/* 適合度スコア */}
        <div className="absolute top-4 right-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{proposal.confidence}%</div>
            <div className="text-xs text-gray-600">適合度</div>
          </div>
        </div>

        {/* 担当者情報 */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {proposal.interviewer.photo ? (
              <img
                src={proposal.interviewer.photo}
                alt={proposal.interviewer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {proposal.interviewer.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {proposal.interviewer.title} | {proposal.interviewer.department}
            </p>
            <p className="text-gray-500 text-sm mb-3">
              {proposal.interviewer.experience}
            </p>
            <div className="flex flex-wrap gap-1">
              {proposal.interviewer.specialties?.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* スケジュール情報 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-800">{proposal.schedule.date}</div>
                <div className="text-sm text-gray-600">
                  {proposal.schedule.time} ({proposal.schedule.duration}分)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-800">{proposal.schedule.location}</div>
                <div className="text-sm text-gray-600">
                  {proposal.schedule.format === 'face_to_face' ? '対面' :
                   proposal.schedule.format === 'online' ? 'オンライン' : '電話'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI推薦理由 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-2" />
            {proposal.staffFriendlyDisplay.title}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {proposal.staffFriendlyDisplay.summary}
          </p>
          <ul className="space-y-1">
            {proposal.staffFriendlyDisplay.highlights.map((highlight, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
          <p className="text-sm text-indigo-600 font-medium mt-3">
            {proposal.rankingReason}
          </p>
        </div>

        {/* 選択ボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProposal(proposal.id);
          }}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            ${isSelected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : proposal.rank === 1
              ? 'bg-green-600 text-white hover:bg-green-700'
              : proposal.rank === 2
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-blue-600 text-white hover:blue-700'
            }
          `}
        >
          {isSelected ? '選択済み ✓' : 'この提案で予約する'}
        </button>
      </div>
    );
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">提案データを取得中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>再読み込み</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 期限切れ表示
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">選択期限切れ</h2>
          <p className="text-gray-600 mb-6">
            申し訳ございません。提案の選択期限が過ぎました。
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRequestAdjustment}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              新しい提案を依頼
            </button>
            <p className="text-sm text-gray-500">
              お急ぎの場合: <a href={`tel:${proposals?.contactInfo.urgentPhone}`} className="text-blue-600">{proposals?.contactInfo.urgentPhone}</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposals) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                🤖 AI最適化結果
              </h1>
              <p className="text-gray-600">あなたに最適な面談候補を3つ提案します</p>
            </div>

            {/* 期限表示 */}
            <div className={`
              px-4 py-2 rounded-lg text-center
              ${showWarning
                ? timeRemaining <= 3600000 // 1時間以下
                  ? 'bg-red-100 border border-red-300'
                  : 'bg-yellow-100 border border-yellow-300'
                : 'bg-blue-100 border border-blue-300'
              }
            `}>
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${showWarning ? 'text-red-600' : 'text-blue-600'}`} />
                <div>
                  <div className={`font-medium ${showWarning ? 'text-red-800' : 'text-blue-800'}`}>
                    選択期限まで
                  </div>
                  <div className={`text-lg font-bold ${showWarning ? 'text-red-700' : 'text-blue-700'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 警告表示 */}
          {showWarning && (
            <div className={`
              rounded-lg p-4 mb-6
              ${timeRemaining <= 3600000
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
              }
            `}>
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`w-5 h-5 ${timeRemaining <= 3600000 ? 'text-red-600' : 'text-yellow-600'}`} />
                <div>
                  <h4 className={`font-medium ${timeRemaining <= 3600000 ? 'text-red-800' : 'text-yellow-800'}`}>
                    {timeRemaining <= 3600000 ? '⚠️ 最終警告' : '⏰ 期限警告'}
                  </h4>
                  <p className={`text-sm ${timeRemaining <= 3600000 ? 'text-red-700' : 'text-yellow-700'}`}>
                    {timeRemaining <= 3600000
                      ? '選択期限まで1時間を切りました。お早めにお選びください。'
                      : '選択期限まで残り6時間です。お忘れなくお選びください。'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 提案カード */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {proposals.proposals.map(proposal => renderProposalCard(proposal))}
        </div>

        {/* どれも合わない場合 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            😅 どの提案も都合がつかない場合
          </h3>
          <p className="text-gray-600 mb-4">
            ご希望に合う提案がない場合は、条件を変更して再提案を依頼できます。
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleRequestAdjustment}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>条件を変更して再提案を依頼</span>
            </button>
            <a
              href={`tel:${proposals.contactInfo.urgentPhone}`}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>人事部直接相談 ({proposals.contactInfo.urgentPhone})</span>
            </a>
          </div>
        </div>

        {/* 選択確認エリア */}
        {selectedProposal && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">選択確認</h3>
            <p className="text-gray-600 mb-4">
              選択理由やご感想があればお聞かせください（任意）
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="例：時間がちょうど良く、専門性も高そうで安心しました"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                選択し直す
              </button>
              <button
                onClick={handleSelectProposal}
                disabled={submitting}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{submitting ? '送信中...' : 'この内容で予約確定'}</span>
              </button>
            </div>
          </div>
        )}

        {/* メタデータ表示（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && proposals.metadata && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-medium mb-2">デバッグ情報</h4>
            <p>Request ID: {proposals.requestId}</p>
            <p>処理モデル: {proposals.metadata.processingModel}</p>
            <p>候補総数: {proposals.metadata.totalCandidates}</p>
            <p>期限: {new Date(proposals.expiresAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalSelectionPage;