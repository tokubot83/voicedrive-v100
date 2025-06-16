import React, { useState } from 'react';
import { ReportCategory, ReportSubmissionForm } from '../../types/whistleblowing';

interface WhistleblowingReportFormProps {
  onSubmit: (report: ReportSubmissionForm) => void;
  onCancel: () => void;
}

const WhistleblowingReportForm: React.FC<WhistleblowingReportFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<ReportSubmissionForm>({
    category: 'other',
    title: '',
    content: '',
    isAnonymous: true,
    contactMethod: 'none'
  });

  const categoryOptions = [
    { value: 'harassment', label: 'ハラスメント', icon: '⚠️', description: 'パワハラ、セクハラ、いじめなど' },
    { value: 'safety', label: '安全管理', icon: '🛡️', description: '医療安全、労働安全、事故リスクなど' },
    { value: 'financial', label: '財務・会計', icon: '💰', description: '不正経理、横領、架空請求など' },
    { value: 'compliance', label: 'コンプライアンス', icon: '📋', description: '法令違反、規則違反など' },
    { value: 'discrimination', label: '差別・不公正', icon: '⚖️', description: '性別、年齢、障害等による差別' },
    { value: 'other', label: 'その他', icon: '📝', description: '上記に該当しない重要な問題' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと内容を入力してください。');
      return;
    }
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ReportSubmissionForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50">
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <span className="text-4xl">🚨</span>
          公益通報
        </h2>
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-red-300 font-bold mb-2">⚠️ 重要な注意事項</h3>
          <ul className="text-red-200 text-sm space-y-1">
            <li>• この通報は専門調査チームが厳重に取り扱います</li>
            <li>• 匿名性は最高レベルで保護されます</li>
            <li>• 虚偽の通報は処分の対象となる場合があります</li>
            <li>• 緊急の場合は直接関係部署または外部機関にもご連絡ください</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* カテゴリ選択 */}
        <div>
          <label className="block text-white font-medium mb-3">
            問題のカテゴリ <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.category === option.value
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={option.value}
                  checked={formData.category === option.value}
                  onChange={(e) => handleInputChange('category', e.target.value as ReportCategory)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{option?.icon || '📋'}</span>
                    <span className="text-white font-medium">{option.label}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* タイトル */}
        <div>
          <label className="block text-white font-medium mb-2">
            件名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="問題の概要を簡潔に入力してください"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            required
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-white font-medium mb-2">
            詳細内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="問題の詳細を具体的に記述してください。いつ、どこで、何が起こったかを明確に記載することで、適切な対応が可能になります。"
            rows={8}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-vertical"
            required
          />
        </div>

        {/* 匿名性選択 */}
        <div>
          <label className="block text-white font-medium mb-3">匿名性の設定</label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-600 bg-gray-700/30 cursor-pointer">
              <input
                type="radio"
                name="anonymity"
                checked={formData.isAnonymous === true}
                onChange={() => handleInputChange('isAnonymous', true)}
                className="mt-1"
              />
              <div>
                <div className="text-white font-medium">匿名で通報（推奨）</div>
                <p className="text-gray-400 text-sm">身元を完全に秘匿します。調査チームとの連絡は匿名IDを使用します。</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-600 bg-gray-700/30 cursor-pointer">
              <input
                type="radio"
                name="anonymity"
                checked={formData.isAnonymous === false}
                onChange={() => handleInputChange('isAnonymous', false)}
                className="mt-1"
              />
              <div>
                <div className="text-white font-medium">記名で通報</div>
                <p className="text-gray-400 text-sm">調査に協力いただく場合があります。身元は厳重に保護されます。</p>
              </div>
            </label>
          </div>
        </div>

        {/* 連絡方法（記名の場合のみ） */}
        {!formData.isAnonymous && (
          <div>
            <label className="block text-white font-medium mb-2">連絡方法</label>
            <select
              value={formData.contactMethod}
              onChange={(e) => handleInputChange('contactMethod', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="email">メール</option>
              <option value="phone">電話</option>
              <option value="none">連絡不要</option>
            </select>
            
            {formData.contactMethod !== 'none' && (
              <input
                type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                value={formData.contactInfo || ''}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder={formData.contactMethod === 'email' ? 'メールアドレス' : '電話番号'}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 mt-2"
              />
            )}
          </div>
        )}

        {/* 証拠について */}
        <div>
          <label className="block text-white font-medium mb-2">証拠について（任意）</label>
          <textarea
            value={formData.evidenceDescription || ''}
            onChange={(e) => handleInputChange('evidenceDescription', e.target.value)}
            placeholder="関連する証拠がある場合は、その内容を記載してください（文書、録音、写真等）。実際のファイルは後日安全な方法で提供いただく場合があります。"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-vertical"
          />
        </div>

        {/* 期待する結果 */}
        <div>
          <label className="block text-white font-medium mb-2">期待する対応・結果（任意）</label>
          <textarea
            value={formData.expectedOutcome || ''}
            onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
            placeholder="この問題に対してどのような対応や改善を期待されるかを記載してください。"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-vertical"
          />
        </div>

        {/* 最終確認 */}
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
          <h4 className="text-yellow-300 font-bold mb-2">📋 提出前の確認</h4>
          <ul className="text-yellow-200 text-sm space-y-1">
            <li>• 内容に虚偽がないことを確認しました</li>
            <li>• 個人的な感情ではなく、客観的事実に基づいています</li>
            <li>• 組織の改善に資する建設的な通報です</li>
            <li>• この通報が専門チームによって適切に処理されることを理解しています</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-end pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            通報を提出
          </button>
        </div>
      </form>
    </div>
  );
};

export default WhistleblowingReportForm;