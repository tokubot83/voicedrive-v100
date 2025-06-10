import React from 'react';
import { Post } from '../../types';
import { ApprovalStep, ApprovalProcessDetailsProps } from '../../types/approval';
import ApprovalStepCard from './ApprovalStepCard';
import { getApprovalSteps, getOverallProgress, getEstimatedCompletion } from '../../utils/approvalCalculations';

const ApprovalProcessModal = ({ post, isOpen, onClose }: ApprovalProcessDetailsProps) => {
  const approvalSteps = getApprovalSteps(post);
  const currentStep = approvalSteps.find(step => step.status === 'in_progress');
  const overallProgress = getOverallProgress(approvalSteps);
  const estimatedCompletion = getEstimatedCompletion(approvalSteps);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl">
          {/* ヘッダー */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🔄 承認プロセス詳細
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {post.content.substring(0, 50)}...
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* スクロール可能なコンテンツエリア */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* 進捗概要 */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">全体進捗</span>
                  <span className="text-white font-bold">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>承認済み: {approvalSteps.filter(s => s.status === 'approved').length}/{approvalSteps.length}</span>
                  <span>完了予定: {estimatedCompletion.toLocaleDateString('ja-JP')}</span>
                </div>
              </div>

              {/* 承認ステップ一覧 */}
              <div className="space-y-4">
                {approvalSteps.map((step, index) => (
                  <ApprovalStepCard 
                    key={step.id} 
                    step={step} 
                    isActive={step.status === 'in_progress'}
                    stepNumber={index + 1}
                  />
                ))}
              </div>

              {/* 現在のアクション */}
              {currentStep && (
                <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                  <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                    <span>💡</span> 現在のアクション
                  </h3>
                  <p className="text-gray-300 mb-3">{currentStep.description}</p>
                  
                  {/* 権限がある場合のみアクションボタンを表示 */}
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                      <span>✅</span> 承認する
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                      <span>↩️</span> 差し戻し
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2">
                      <span>📝</span> 追加情報要求
                    </button>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                      <span>⬆️</span> エスカレーション
                    </button>
                  </div>
                </div>
              )}

              {/* 承認フロー情報 */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-gray-300 font-bold mb-3">📋 承認フロー情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">提案タイプ:</span>
                    <p className="text-white font-medium">{post.proposalType || '改善提案'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">優先度:</span>
                    <p className="text-white font-medium">
                      {post.priority === 'urgent' ? '🔥 緊急' : 
                       post.priority === 'high' ? '⚡ 高' : 
                       post.priority === 'medium' ? '🔄 中' : '📊 低'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">承認レベル:</span>
                    <p className="text-white font-medium">
                      {post.enhancedProjectStatus?.approvalLevel || 'LEVEL_2'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalProcessModal;