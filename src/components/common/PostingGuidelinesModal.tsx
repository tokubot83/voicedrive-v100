import React, { useState } from 'react';
import {
  POSTING_GUIDELINES,
  VIOLATION_POLICIES,
  EMERGENCY_DELETION_CRITERIA,
  APPEALS_PROCESS,
  GuidelineSection
} from '../../config/postingGuidelines';

interface PostingGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  showEmergencyDeletionInfo?: boolean;
  showAppealsInfo?: boolean;
}

const PostingGuidelinesModal: React.FC<PostingGuidelinesModalProps> = ({
  isOpen,
  onClose,
  showEmergencyDeletionInfo = false,
  showAppealsInfo = false
}) => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'violations' | 'deletion' | 'appeals'>('guidelines');

  if (!isOpen) return null;

  const renderGuidelines = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
        <h3 className="text-blue-300 font-bold mb-2">📋 VoiceDrive投稿ガイドライン</h3>
        <p className="text-blue-200 text-sm">
          建設的で安全な職場コミュニケーションを実現するための基本原則です。
          すべてのユーザーが快適に利用できる環境づくりにご協力ください。
        </p>
      </div>

      {POSTING_GUIDELINES.map((guideline) => (
        <div
          key={guideline.id}
          className={`rounded-lg p-4 border ${
            guideline.severity === 'danger' ? 'bg-red-900/20 border-red-500/50' :
            guideline.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50' :
            'bg-blue-900/20 border-blue-500/50'
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{guideline.icon}</span>
            <div className="flex-1">
              <h4 className={`font-bold mb-2 ${
                guideline.severity === 'danger' ? 'text-red-300' :
                guideline.severity === 'warning' ? 'text-yellow-300' :
                'text-blue-300'
              }`}>
                {guideline.title}
              </h4>
              <p className={`text-sm mb-3 ${
                guideline.severity === 'danger' ? 'text-red-200' :
                guideline.severity === 'warning' ? 'text-yellow-200' :
                'text-blue-200'
              }`}>
                {guideline.description}
              </p>
            </div>
          </div>

          {guideline.examples && (
            <div className="bg-gray-800/50 rounded p-3">
              <h5 className="text-white font-medium mb-2">例:</h5>
              <ul className="space-y-1">
                {guideline.examples.map((example, index) => (
                  <li
                    key={index}
                    className={`text-sm ${
                      example.startsWith('✅') ? 'text-green-300' :
                      example.startsWith('❌') ? 'text-red-300' :
                      'text-gray-300'
                    }`}
                  >
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderViolationPolicies = () => (
    <div className="space-y-6">
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
        <h3 className="text-red-300 font-bold mb-2">⚖️ 違反時の対応ポリシー</h3>
        <p className="text-red-200 text-sm">
          ガイドライン違反時の段階的な対応措置です。
          違反の種類と重大性に応じて適切な措置が取られます。
        </p>
      </div>

      {VIOLATION_POLICIES.map((policy, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            {policy.violationType === 'personal_attack' && '個人攻撃'}
            {policy.violationType === 'harassment' && 'ハラスメント'}
            {policy.violationType === 'privacy_violation' && '個人情報漏洩'}
            {policy.violationType === 'confidentiality_breach' && '機密情報漏洩'}
            {policy.violationType === 'misinformation' && '誤情報拡散'}
            {policy.violationType === 'inappropriate_language' && '不適切な表現'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-yellow-300 font-medium mb-2">📝 段階的対応</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">1回目:</span>
                  <p className="text-white">{policy.firstOffense}</p>
                </div>
                <div>
                  <span className="text-gray-400">2回目:</span>
                  <p className="text-white">{policy.secondOffense}</p>
                </div>
                <div>
                  <span className="text-gray-400">3回目:</span>
                  <p className="text-white">{policy.thirdOffense}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-red-300 font-medium mb-2">🚨 緊急対応</h5>
              <p className="text-red-200 text-sm">{policy.emergencyAction}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmergencyDeletion = () => (
    <div className="space-y-6">
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
        <h3 className="text-red-300 font-bold mb-2">🚨 緊急削除について</h3>
        <p className="text-red-200 text-sm">
          重大な問題を含む投稿は即座に削除される場合があります。
          削除権限と基準について説明します。
        </p>
      </div>

      {/* 削除基準 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">📋 削除基準</h4>
        
        <div className="space-y-4">
          <div>
            <h5 className="text-red-300 font-medium mb-2">🔴 即座削除（緊急性：最高）</h5>
            <ul className="text-red-200 text-sm space-y-1">
              {EMERGENCY_DELETION_CRITERIA.immediate.map((criteria, index) => (
                <li key={index}>• {criteria}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-orange-300 font-medium mb-2">🟡 迅速削除（緊急性：高）</h5>
            <ul className="text-orange-200 text-sm space-y-1">
              {EMERGENCY_DELETION_CRITERIA.expedited.map((criteria, index) => (
                <li key={index}>• {criteria}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-blue-300 font-medium mb-2">🔵 通常削除（緊急性：中）</h5>
            <ul className="text-blue-200 text-sm space-y-1">
              {EMERGENCY_DELETION_CRITERIA.standard.map((criteria, index) => (
                <li key={index}>• {criteria}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 削除権限 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">🔑 削除権限レベル</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">LEVEL 2-3:</span>
            <span className="text-white">チーム・部門内投稿</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">LEVEL 4-6:</span>
            <span className="text-white">施設内投稿</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">LEVEL 7以上:</span>
            <span className="text-white">全投稿（組織レベル）</span>
          </div>
        </div>
      </div>

      {/* 自動処理 */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
        <h4 className="text-blue-300 font-bold mb-3">🤖 削除時の自動処理</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• 削除ログの自動記録</li>
          <li>• 重大違反時のコンプライアンス窓口への自動通報</li>
          <li>• 関係者への即座通知</li>
          <li>• 48時間以内の詳細報告義務</li>
          <li>• EmergencyAuthorityServiceでの監査</li>
        </ul>
      </div>
    </div>
  );

  const renderAppealsProcess = () => (
    <div className="space-y-6">
      <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
        <h3 className="text-green-300 font-bold mb-2">⚖️ 異議申し立て制度</h3>
        <p className="text-green-200 text-sm">
          削除処理に対する公正な異議申し立て制度です。
          適正手続きを保障し、公平性を確保します。
        </p>
      </div>

      {/* 申し立て資格 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">👥 申し立て資格者</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          {APPEALS_PROCESS.eligibility.map((eligible, index) => (
            <li key={index}>• {eligible}</li>
          ))}
        </ul>
      </div>

      {/* 手続き */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">📋 申し立て手続き</h4>
        <div className="space-y-2">
          {APPEALS_PROCESS.procedure.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-gray-300 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 審査基準 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">🔍 審査基準</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          {APPEALS_PROCESS.review_criteria.map((criteria, index) => (
            <li key={index}>• {criteria}</li>
          ))}
        </ul>
      </div>

      {/* 審査結果 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-bold mb-3">📊 可能な審査結果</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {APPEALS_PROCESS.possible_outcomes.map((outcome, index) => (
            <div key={index} className="bg-gray-700/50 rounded p-2">
              <span className="text-gray-300 text-sm">{outcome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
        <h4 className="text-yellow-300 font-bold mb-2">⚠️ 重要な注意事項</h4>
        <ul className="text-yellow-200 text-sm space-y-1">
          <li>• 異議申し立ては削除から48時間以内に限られます</li>
          <li>• 虚偽の申し立ては処分の対象となる場合があります</li>
          <li>• 審査中も削除状態は継続されます</li>
          <li>• 審査結果は最終的なものです</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">📖 投稿ガイドライン</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-700 bg-gray-700/50">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'guidelines'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-600/50'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📋 ガイドライン
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'violations'
                ? 'text-red-400 border-b-2 border-red-400 bg-gray-600/50'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ⚖️ 違反時対応
          </button>
          <button
            onClick={() => setActiveTab('deletion')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'deletion'
                ? 'text-red-400 border-b-2 border-red-400 bg-gray-600/50'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🚨 緊急削除
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'appeals'
                ? 'text-green-400 border-b-2 border-green-400 bg-gray-600/50'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ⚖️ 異議申し立て
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'guidelines' && renderGuidelines()}
          {activeTab === 'violations' && renderViolationPolicies()}
          {activeTab === 'deletion' && renderEmergencyDeletion()}
          {activeTab === 'appeals' && renderAppealsProcess()}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              最終更新: 2024年12月 | バージョン: 1.0
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingGuidelinesModal;