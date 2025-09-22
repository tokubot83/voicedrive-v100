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

  console.log('📅 ProposalSelectionModal:', { isOpen, proposalsCount: proposals.length });

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
      reason: rescheduleReason
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
    { value: 'time_preference', label: '希望時間帯と異なる', icon: '⏰' },
    { value: 'location_preference', label: '希望場所と異なる', icon: '📍' },
    { value: 'other', label: 'その他', icon: '📝' }
  ];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative z-[9999] bg-white rounded-lg md:rounded-2xl shadow-2xl w-[98%] sm:w-[95%] max-w-7xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden m-auto">
          {/* ヘッダー */}
          <div className="bg-white border-b border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-lg md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">面談日程の提案</h2>
                <p className="hidden sm:block text-gray-600 text-xs">
                  {employeeName}様のご希望に基づいて、医療チームが最適な日程を3つ提案しました
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-2 sm:p-3 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
            {!showRescheduleForm ? (
              <>
                {/* 提案カード - モバイルは縦並び、デスクトップは横並び */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      onClick={() => handleSelectProposal(proposal.id)}
                      className={`relative cursor-pointer transition-all ${
                        selectedProposalId === proposal.id
                          ? 'ring-2 ring-indigo-500 shadow-md'
                          : 'hover:shadow-sm'
                      }`}
                    >
                      {/* おすすめマーク */}
                      {proposal.isRecommended && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow-lg">
                            <Star className="w-3 h-3 mr-0.5" />
                            おすすめ
                          </div>
                        </div>
                      )}

                      {/* カード本体 */}
                      <div className={`rounded-lg sm:rounded-xl border sm:border-2 overflow-hidden ${
                        selectedProposalId === proposal.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                        {/* カードヘッダー */}
                        <div className={`px-2 py-1 sm:px-3 sm:py-2 ${
                          proposal.isRecommended
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                            : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-gray-500">
                              第{proposal.proposalNumber}候補
                            </div>
                            {/* マッチング度バッジ */}
                            {proposal.matchingScore && (
                              <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                proposal.matchingScore >= 90
                                  ? 'bg-green-100 text-green-700'
                                  : proposal.matchingScore >= 80
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {proposal.matchingScore}%
                              </div>
                            )}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-gray-800">
                            {formatDate(proposal.date)}
                          </div>
                        </div>

                        {/* カード内容 */}
                        <div className="px-2 py-1.5 sm:px-3 sm:py-2 space-y-1 sm:space-y-1.5">
                          {/* 時間 */}
                          <div className="flex items-center text-xs sm:text-sm text-gray-700">
                            <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                            <span className="font-semibold">
                              {proposal.startTime} - {proposal.endTime}
                            </span>
                          </div>

                          {/* 担当者 */}
                          <div className="flex items-start text-xs sm:text-sm text-gray-700">
                            <User className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-semibold text-xs sm:text-sm">{proposal.interviewer.name}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">{proposal.interviewer.title}</div>
                            </div>
                          </div>

                          {/* 場所 */}
                          <div className="flex items-center text-xs sm:text-sm text-gray-700">
                            <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                            <span className="text-xs sm:text-sm">{getLocationDisplay(proposal.location)}</span>
                          </div>

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
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-3 sm:mt-4">
                  <button
                    onClick={handleConfirmSelection}
                    disabled={!selectedProposalId}
                    className={`px-6 py-4 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-base transition-all flex items-center justify-center ${
                      selectedProposalId
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    この日程で予約を確定
                    <ChevronRight className="w-5 sm:w-5 h-5 sm:h-5 ml-2" />
                  </button>

                  <button
                    onClick={() => setShowRescheduleForm(true)}
                    className="px-6 py-4 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-base bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 sm:w-5 h-5 sm:h-5 mr-2" />
                    再調整を依頼
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
                        <span className={`font-medium ${
                          rescheduleReason === option.value ? 'text-indigo-900' : 'text-gray-900'
                        }`}>{option.label}</span>
                      </div>
                    </button>
                  ))}
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
  );
};

export default ProposalSelectionModal;