import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Star, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';
import { ProposalPattern, RescheduleRequest } from '../../types/interview';

interface ProposalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: ProposalPattern[];
  onSelectProposal: (proposalId: string) => void;
  onRequestReschedule: (request: RescheduleRequest) => void;
  employeeName?: string;
  bookingId?: string;
}

const ProposalSelectionModal: React.FC<ProposalSelectionModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onSelectProposal,
  onRequestReschedule,
  employeeName = '職員'
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState<RescheduleRequest['reason']>('other');
  const [rescheduleDetail, setRescheduleDetail] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');

  if (!isOpen) return null;

  const handleSelectProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
  };

  const handleConfirmSelection = () => {
    if (selectedProposalId) {
      onSelectProposal(selectedProposalId);
    }
  };

  const handleRequestReschedule = () => {
    const request: RescheduleRequest = {
      reason: rescheduleReason,
      reasonDetail: rescheduleDetail || undefined,
      additionalRequests: additionalRequests || undefined
    };
    onRequestReschedule(request);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}月${d.getDate()}日(${weekdays[d.getDay()]})`;
  };

  const getLocationDisplay = (location: ProposalPattern['location']) => {
    if (location.type === 'online') {
      return 'オンライン面談';
    }
    return location.place || '施設内';
  };

  const reasonOptions = [
    { value: 'shift_conflict', label: '勤務シフトと重なる', icon: '🏥' },
    { value: 'other_appointment', label: '他の予定が入っている', icon: '📅' },
    { value: 'health', label: '体調不良', icon: '🏥' },
    { value: 'time_preference', label: '希望時間帯と異なる', icon: '⏰' },
    { value: 'other', label: 'その他', icon: '📝' }
  ];

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">面談日程の提案</h2>
                <p className="text-gray-600 mt-1">
                  {employeeName}様のご希望に基づいて、医療チームが最適な日程を3つ提案しました
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            {!showRescheduleForm ? (
              <>
                {/* 提案カード */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      onClick={() => handleSelectProposal(proposal.id)}
                      className={`relative cursor-pointer transition-all transform hover:scale-105 ${
                        selectedProposalId === proposal.id
                          ? 'ring-4 ring-indigo-500 shadow-xl'
                          : 'hover:shadow-lg'
                      }`}
                    >
                      {/* おすすめマーク */}
                      {proposal.isRecommended && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                            <Star className="w-4 h-4 mr-1" />
                            おすすめ
                          </div>
                        </div>
                      )}

                      {/* カード本体 */}
                      <div className={`rounded-xl border-2 overflow-hidden ${
                        selectedProposalId === proposal.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                        {/* カードヘッダー */}
                        <div className={`p-4 ${
                          proposal.isRecommended
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                            : 'bg-gray-50'
                        }`}>
                          <div className="text-sm font-semibold text-gray-500 mb-1">
                            第{proposal.proposalNumber}候補
                          </div>
                          <div className="text-xl font-bold text-gray-800">
                            {formatDate(proposal.date)}
                          </div>
                        </div>

                        {/* カード内容 */}
                        <div className="p-4 space-y-3">
                          {/* 時間 */}
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-5 h-5 mr-3 text-gray-400" />
                            <span className="font-semibold">
                              {proposal.startTime} - {proposal.endTime}
                            </span>
                          </div>

                          {/* 担当者 */}
                          <div className="flex items-start text-gray-700">
                            <User className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-semibold">{proposal.interviewer.name}</div>
                              <div className="text-sm text-gray-500">{proposal.interviewer.title}</div>
                            </div>
                          </div>

                          {/* 場所 */}
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{getLocationDisplay(proposal.location)}</span>
                          </div>

                          {/* マッチング度 */}
                          {proposal.matchingScore && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">マッチング度</span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                      style={{ width: `${proposal.matchingScore}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {proposal.matchingScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 選択状態 */}
                        {selectedProposalId === proposal.id && (
                          <div className="bg-indigo-600 text-white p-3 text-center font-semibold">
                            ✓ 選択中
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* アクションボタン */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={handleConfirmSelection}
                    disabled={!selectedProposalId}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center ${
                      selectedProposalId
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    この日程で予約を確定
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>

                  <button
                    onClick={() => setShowRescheduleForm(true)}
                    className="px-8 py-4 rounded-xl font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    どれも合わない・再調整を依頼
                  </button>
                </div>
              </>
            ) : (
              /* 再調整依頼フォーム */
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2 text-orange-500" />
                    再調整を依頼
                  </h3>
                  <p className="text-gray-600">
                    提案された日程が合わない理由をお聞かせください
                  </p>
                </div>

                {/* 理由選択 */}
                <div className="space-y-3 mb-6">
                  <label className="text-sm font-semibold text-gray-700">
                    理由を選択してください
                  </label>
                  {reasonOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRescheduleReason(option.value as RescheduleRequest['reason'])}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        rescheduleReason === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* 詳細入力 */}
                {rescheduleReason === 'other' && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      詳細をご記入ください
                    </label>
                    <textarea
                      value={rescheduleDetail}
                      onChange={(e) => setRescheduleDetail(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                      rows={3}
                      placeholder="具体的な理由をお書きください..."
                    />
                  </div>
                )}

                {/* 追加の要望 */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    追加の希望事項（任意）
                  </label>
                  <textarea
                    value={additionalRequests}
                    onChange={(e) => setAdditionalRequests(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="例：午後の時間帯を希望、〇月〇日以降で調整希望など..."
                  />
                </div>

                {/* ボタン */}
                <div className="flex gap-4">
                  <button
                    onClick={handleRequestReschedule}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    再調整を依頼する
                  </button>
                  <button
                    onClick={() => setShowRescheduleForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    戻る
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalSelectionModal;