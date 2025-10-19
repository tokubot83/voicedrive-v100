/**
 * AgendaDecisionButtons
 *
 * 各レベルの管理画面用の判断ボタンコンポーネント
 */

import React, { useState } from 'react';
import { AgendaDecisionModal } from './AgendaDecisionModal';
import { AgendaDecisionType } from '@/services/AgendaDecisionService';

interface AgendaDecisionButtonsProps {
  postId: string;
  postTitle: string;
  userLevel: number;
  agendaScore: number;
  agendaStatus: string;
  onDecision: (decisionType: AgendaDecisionType, reason: string, committeeId?: string) => Promise<void>;
}

export const AgendaDecisionButtons: React.FC<AgendaDecisionButtonsProps> = ({
  postId,
  postTitle,
  userLevel,
  agendaScore,
  agendaStatus,
  onDecision,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<AgendaDecisionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = (decisionType: AgendaDecisionType) => {
    setSelectedDecision(decisionType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDecision(null);
  };

  const handleSubmitDecision = async (reason: string, committeeId?: string) => {
    if (!selectedDecision) return;

    try {
      setIsLoading(true);
      await onDecision(selectedDecision, reason, committeeId);
      handleCloseModal();
    } catch (error) {
      console.error('判断処理エラー:', error);
      alert('判断処理に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Level 3.5 (主任) のボタン
  if (userLevel === 3.5 && agendaScore >= 50 && agendaStatus === 'pending') {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-3">主任の判断が必要です</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleOpenModal('recommend_to_manager')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ 師長に推薦
          </button>
          <button
            onClick={() => handleOpenModal('reject_by_supervisor')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ❌ 却下
          </button>
        </div>

        {selectedDecision && (
          <AgendaDecisionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitDecision}
            decisionType={selectedDecision}
            postTitle={postTitle}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  // Level 7 (師長) のボタン
  if (userLevel === 7) {
    // 主任推薦後の判断
    if (agendaStatus === 'recommended_to_manager') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-3">師長の判断が必要です</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleOpenModal('approve_as_dept_agenda')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 部署議題承認
            </button>
            <button
              onClick={() => handleOpenModal('escalate_to_facility')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ⬆️ 施設議題に昇格
            </button>
            <button
              onClick={() => handleOpenModal('reject_by_manager')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ❌ 却下
            </button>
          </div>

          {selectedDecision && (
            <AgendaDecisionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitDecision}
              decisionType={selectedDecision}
              postTitle={postTitle}
              isLoading={isLoading}
            />
          )}
        </div>
      );
    }

    // 救済フロー（副看護部長却下後）
    if (agendaStatus === 'pending_rescue_by_manager') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-orange-700 mb-3">
            🆘 救済判断が必要です（副看護部長が却下）
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleOpenModal('rescue_as_dept_agenda')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 部署議題承認
            </button>
            <button
              onClick={() => handleOpenModal('complete_rejection')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ❌ 完全却下
            </button>
          </div>

          {selectedDecision && (
            <AgendaDecisionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitDecision}
              decisionType={selectedDecision}
              postTitle={postTitle}
              isLoading={isLoading}
            />
          )}
        </div>
      );
    }
  }

  // Level 8 (副看護部長/看護部長) のボタン
  if (userLevel === 8 && agendaScore >= 100 && agendaStatus === 'pending_deputy_director_review') {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-3">副看護部長の判断が必要です</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleOpenModal('approve_for_committee')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ 委員会提出承認
          </button>
          <button
            onClick={() => handleOpenModal('escalate_to_corp_review')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⬆️ 法人検討に昇格
          </button>
          <button
            onClick={() => handleOpenModal('reject_by_deputy_director')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ❌ 却下
          </button>
        </div>

        {selectedDecision && (
          <AgendaDecisionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitDecision}
            decisionType={selectedDecision}
            postTitle={postTitle}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  // Level 11 (事務長) のボタン
  if (userLevel === 11) {
    // 300点到達時の判断
    if (agendaScore >= 300 && agendaStatus === 'pending_general_affairs_review') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-3">事務長の判断が必要です</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleOpenModal('approve_as_corp_agenda')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 法人議題承認
            </button>
            <button
              onClick={() => handleOpenModal('escalate_to_corp_agenda')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ⬆️ 法人議題に昇格(600点目標)
            </button>
            <button
              onClick={() => handleOpenModal('reject_by_general_affairs')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ❌ 却下
            </button>
          </div>

          {selectedDecision && (
            <AgendaDecisionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitDecision}
              decisionType={selectedDecision}
              postTitle={postTitle}
              isLoading={isLoading}
            />
          )}
        </div>
      );
    }

    // 救済フロー（法人統括事務局長却下後）
    if (agendaStatus === 'pending_rescue_by_deputy_director') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-orange-700 mb-3">
            🆘 救済判断が必要です（法人統括事務局長が却下）
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleOpenModal('rescue_as_facility_agenda')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 施設議題承認
            </button>
            <button
              onClick={() => handleOpenModal('complete_rejection')}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ❌ 完全却下
            </button>
          </div>

          {selectedDecision && (
            <AgendaDecisionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitDecision}
              decisionType={selectedDecision}
              postTitle={postTitle}
              isLoading={isLoading}
            />
          )}
        </div>
      );
    }
  }

  // Level 18 (法人統括事務局長) のボタン
  if (userLevel === 18 && agendaScore >= 600 && agendaStatus === 'pending_general_affairs_director_review') {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-3">法人統括事務局長の判断が必要です</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleOpenModal('approve_for_corp_meeting')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ 法人運営会議提出承認
          </button>
          <button
            onClick={() => handleOpenModal('reject_by_general_affairs_director')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ❌ 却下
          </button>
        </div>

        {selectedDecision && (
          <AgendaDecisionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitDecision}
            decisionType={selectedDecision}
            postTitle={postTitle}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  // 判断が不要な場合
  return null;
};
