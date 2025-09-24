/**
 * コンプライアンス通報フォーム（拡張版）
 * 5ステップの段階的な通報プロセス
 * @version 1.0.0
 * @date 2025-09-24
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ComplianceReport,
  AnonymityLevel,
  ReportMainCategory,
  PartialComplianceReport
} from '../../types/compliance-enhanced';
import { complianceTransferService } from '../../services/ComplianceTransferService';

// ==================== サブコンポーネント ====================

/**
 * 進捗インジケーター
 */
const ProgressIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const steps = [
    '通報方法',
    'カテゴリ',
    '詳細情報',
    '証拠',
    '確認'
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex items-center">
          <div className="flex flex-col items-center w-full">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                ${index + 1 <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-center">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-1 mx-2 -mt-5
                ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Step 1: 匿名性レベルの選択
 */
const AnonymitySelector: React.FC<{
  value: AnonymityLevel;
  onChange: (level: AnonymityLevel) => void;
}> = ({ value, onChange }) => {
  const options = [
    {
      value: 'full_anonymous' as AnonymityLevel,
      label: '完全匿名',
      description: 'あなたの身元は最後まで保護されます。ただし、詳細な調査が制限される場合があります。',
      icon: '🔒'
    },
    {
      value: 'conditional' as AnonymityLevel,
      label: '条件付き開示',
      description: '通常は匿名ですが、調査に必要な場合のみ、あなたの同意を得て開示される可能性があります。',
      icon: '🔓'
    },
    {
      value: 'disclosed' as AnonymityLevel,
      label: '実名通報',
      description: '最初から実名で通報します。迅速な対応が期待できますが、身元は保護されません。',
      icon: '👤'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        通報方法を選択してください
      </h3>

      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              block p-4 border-2 rounded-lg cursor-pointer transition-all
              ${value === option.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="radio"
              name="anonymity"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as AnonymityLevel)}
              className="sr-only"
            />
            <div className="flex items-start">
              <span className="text-2xl mr-3">{option.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>重要：</strong>
          公益通報者保護法により、どの方法を選んでも、通報したことを理由とした不利益な取り扱いは禁止されています。
        </p>
      </div>
    </div>
  );
};

/**
 * Step 2: カテゴリ選択
 */
const CategorySelector: React.FC<{
  value: ReportMainCategory | null;
  onChange: (category: ReportMainCategory) => void;
}> = ({ value, onChange }) => {
  const categories = [
    {
      value: 'harassment' as ReportMainCategory,
      label: 'ハラスメント',
      description: 'パワハラ、セクハラ、マタハラなど',
      icon: '⚠️',
      color: 'red'
    },
    {
      value: 'medical_law' as ReportMainCategory,
      label: '医療法令違反',
      description: '医療法、診療報酬不正請求など',
      icon: '⚖️',
      color: 'purple'
    },
    {
      value: 'safety' as ReportMainCategory,
      label: '安全管理',
      description: '患者安全、労働安全に関する問題',
      icon: '🛡️',
      color: 'orange'
    },
    {
      value: 'financial' as ReportMainCategory,
      label: '財務・会計',
      description: '横領、背任、不正経理など',
      icon: '💰',
      color: 'green'
    },
    {
      value: 'information_leak' as ReportMainCategory,
      label: '情報漏洩',
      description: '個人情報、機密情報の不適切な取り扱い',
      icon: '🔐',
      color: 'blue'
    },
    {
      value: 'discrimination' as ReportMainCategory,
      label: '差別・不公正',
      description: '不当な差別、不公正な取り扱い',
      icon: '⚖️',
      color: 'yellow'
    },
    {
      value: 'research_fraud' as ReportMainCategory,
      label: '研究不正',
      description: 'データ捏造、改ざん、盗用など',
      icon: '🔬',
      color: 'indigo'
    },
    {
      value: 'other' as ReportMainCategory,
      label: 'その他',
      description: '上記に該当しない問題',
      icon: '📝',
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, string> = {
      red: isSelected ? 'border-red-600 bg-red-50' : 'hover:border-red-300',
      purple: isSelected ? 'border-purple-600 bg-purple-50' : 'hover:border-purple-300',
      orange: isSelected ? 'border-orange-600 bg-orange-50' : 'hover:border-orange-300',
      green: isSelected ? 'border-green-600 bg-green-50' : 'hover:border-green-300',
      blue: isSelected ? 'border-blue-600 bg-blue-50' : 'hover:border-blue-300',
      yellow: isSelected ? 'border-yellow-600 bg-yellow-50' : 'hover:border-yellow-300',
      indigo: isSelected ? 'border-indigo-600 bg-indigo-50' : 'hover:border-indigo-300',
      gray: isSelected ? 'border-gray-600 bg-gray-50' : 'hover:border-gray-300'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        通報内容のカテゴリを選択してください
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`
              p-4 border-2 rounded-lg text-left transition-all
              ${getColorClasses(category.color, value === category.value)}
              ${value === category.value ? '' : 'border-gray-200 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{category.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{category.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Step 3: 詳細情報入力
 */
const DetailsInput: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        詳細情報を入力してください
      </h3>

      {/* 発生時期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          いつ発生しましたか？ <span className="text-red-500">*</span>
        </label>
        <select
          value={data.timeline || ''}
          onChange={(e) => onChange({ ...data, timeline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">選択してください</option>
          <option value="today">本日</option>
          <option value="week">1週間以内</option>
          <option value="month">1ヶ月以内</option>
          <option value="3months">3ヶ月以内</option>
          <option value="6months">6ヶ月以内</option>
          <option value="year">1年以上前</option>
          <option value="ongoing">継続中</option>
        </select>
      </div>

      {/* 発生場所 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          どこで発生しましたか？
        </label>
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例：病棟内、会議室、休憩室など（部署名は任意）"
        />
      </div>

      {/* 関係者 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          相手との関係性
        </label>
        <select
          value={data.relationship || ''}
          onChange={(e) => onChange({ ...data, relationship: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          <option value="supervisor">上司</option>
          <option value="colleague">同僚</option>
          <option value="subordinate">部下</option>
          <option value="external">外部関係者</option>
          <option value="patient">患者・家族</option>
          <option value="unknown">不明</option>
        </select>
      </div>

      {/* 詳細な説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          詳細な説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
          placeholder="できるだけ具体的に記載してください。&#10;・誰が関わっているか（役職のみでも可）&#10;・どのような行為があったか&#10;・頻度や期間&#10;・目撃者の有無"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          最低50文字以上入力してください（現在: {data.description?.length || 0}文字）
        </p>
      </div>

      {/* 目撃者 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          目撃者はいますか？
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="witness"
              value="yes"
              checked={data.hasWitness === true}
              onChange={() => onChange({ ...data, hasWitness: true })}
              className="mr-2"
            />
            <span>はい（複数名）</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="witness"
              value="few"
              checked={data.hasWitness === 'few'}
              onChange={() => onChange({ ...data, hasWitness: 'few' })}
              className="mr-2"
            />
            <span>はい（1-2名）</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="witness"
              value="no"
              checked={data.hasWitness === false}
              onChange={() => onChange({ ...data, hasWitness: false })}
              className="mr-2"
            />
            <span>いいえ</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="witness"
              value="unknown"
              checked={data.hasWitness === 'unknown'}
              onChange={() => onChange({ ...data, hasWitness: 'unknown' })}
              className="mr-2"
            />
            <span>わからない</span>
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Step 4: 証拠アップロード
 */
const EvidenceUploader: React.FC<{
  files: File[];
  onChange: (files: File[]) => void;
}> = ({ files, onChange }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onChange([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        証拠となる資料があれば添付してください（任意）
      </h3>

      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <label className="mt-4 block">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer inline-block hover:bg-blue-700">
              ファイルを選択
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.mp3,.mp4,.doc,.docx,.txt,.eml"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            PDF、画像、音声、動画、文書ファイル（最大10MB）
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            選択されたファイル（{files.length}件）
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>注意：</strong>
          アップロードされたファイルは暗号化され、安全に保管されます。
          調査担当者のみがアクセス可能です。
        </p>
      </div>
    </div>
  );
};

/**
 * Step 5: 確認画面
 */
const ConfirmationStep: React.FC<{
  data: any;
  onEdit: (step: number) => void;
}> = ({ data, onEdit }) => {
  const getAnonymityLabel = (level: AnonymityLevel) => {
    const labels = {
      full_anonymous: '完全匿名',
      conditional: '条件付き開示',
      disclosed: '実名通報'
    };
    return labels[level] || level;
  };

  const getCategoryLabel = (category: ReportMainCategory) => {
    const labels = {
      harassment: 'ハラスメント',
      medical_law: '医療法令違反',
      safety: '安全管理',
      financial: '財務・会計',
      information_leak: '情報漏洩',
      discrimination: '差別・不公正',
      research_fraud: '研究不正',
      other: 'その他'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        送信内容の確認
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        {/* 通報方法 */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">通報方法</p>
              <p className="font-medium">{getAnonymityLabel(data.anonymityLevel)}</p>
            </div>
            <button
              onClick={() => onEdit(1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
          </div>
        </div>

        {/* カテゴリ */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">カテゴリ</p>
              <p className="font-medium">{getCategoryLabel(data.category)}</p>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
          </div>
        </div>

        {/* 発生時期 */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">発生時期</p>
              <p className="font-medium">{data.details?.timeline || '未入力'}</p>
            </div>
            <button
              onClick={() => onEdit(3)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
          </div>
        </div>

        {/* 詳細 */}
        <div>
          <p className="text-sm text-gray-600">詳細説明</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {data.details?.description?.substring(0, 200)}
            {data.details?.description?.length > 200 && '...'}
          </p>
        </div>

        {/* 証拠ファイル */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">証拠ファイル</p>
              <p className="font-medium">{data.files?.length || 0}件</p>
            </div>
            <button
              onClick={() => onEdit(4)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>送信前の確認事項：</strong>
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-yellow-800">
          <li>虚偽の通報は処分の対象となります</li>
          <li>調査には時間がかかる場合があります</li>
          <li>追加の情報提供をお願いする場合があります</li>
        </ul>
      </div>

      <div>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={data.agreement || false}
            onChange={(e) => data.setAgreement(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            上記内容を確認し、記載内容が真実であることを誓約します。
            また、公益通報者保護法および小原病院のハラスメント防止規定を理解した上で通報します。
          </span>
        </label>
      </div>
    </div>
  );
};

// ==================== メインコンポーネント ====================

export const EnhancedReportForm: React.FC = () => {
  // フォーム状態管理
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreement, setAgreement] = useState(false);

  // フォームデータ
  const [anonymityLevel, setAnonymityLevel] = useState<AnonymityLevel>('full_anonymous');
  const [category, setCategory] = useState<ReportMainCategory | null>(null);
  const [details, setDetails] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);

  // バリデーション
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return true; // 匿名性レベルは常に選択されている
      case 2:
        return category !== null;
      case 3:
        return details.description?.length >= 50 && details.timeline;
      case 4:
        return true; // ファイルは任意
      case 5:
        return agreement;
      default:
        return false;
    }
  }, [category, details, agreement]);

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStepValid(5)) {
      alert('必要な情報が入力されていません');
      return;
    }

    setIsSubmitting(true);

    try {
      // 通報データの構築
      const reportData: PartialComplianceReport = {
        reporter: {
          isAnonymous: anonymityLevel !== 'disclosed',
          disclosureLevel: anonymityLevel,
          consentToDisclose: anonymityLevel === 'conditional' ? {
            granted: false,
            conditions: ['調査に必要な場合のみ']
          } : undefined
        },
        category: {
          main: category!,
          sub: undefined,
          specificType: undefined
        },
        incident: {
          description: details.description,
          timeline: {
            isOngoing: details.timeline === 'ongoing',
            frequency: details.frequency
          },
          location: {
            general: details.location || '不明'
          },
          accused: details.relationship ? {
            count: 1,
            relationship: details.relationship
          } : undefined
        },
        evidence: {
          hasEvidence: files.length > 0,
          types: files.length > 0 ? ['document'] : [],
          files: [],
          witnesses: details.hasWitness ? {
            count: details.hasWitness === true ? 3 : 1,
            willingToTestify: 0,
            contacted: false
          } : undefined
        }
      };

      // TODO: 実際の送信処理
      console.log('Submitting report:', reportData);

      // モック応答
      const anonymousId = `ANON-${Date.now().toString(36).toUpperCase()}`;

      // 成功メッセージ
      alert(`
通報が正常に送信されました。

追跡ID: ${anonymousId}

このIDは進捗確認に必要です。
スクリーンショットを撮るか、メモに保存してください。
      `);

      // フォームリセット
      setCurrentStep(1);
      setAnonymityLevel('full_anonymous');
      setCategory(null);
      setDetails({});
      setFiles([]);
      setAgreement(false);

    } catch (error) {
      console.error('Submission failed:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ステップ変更
  const goToStep = (step: number) => {
    if (step < currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              コンプライアンス窓口
            </h1>
            <p className="text-gray-600 mt-2">
              安全で匿名性を保護した相談窓口
            </p>
          </div>

          {/* 進捗インジケーター */}
          <ProgressIndicator currentStep={currentStep} totalSteps={5} />

          {/* フォーム */}
          <form onSubmit={handleSubmit}>
            {/* 各ステップの表示 */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <AnonymitySelector
                  value={anonymityLevel}
                  onChange={setAnonymityLevel}
                />
              )}

              {currentStep === 2 && (
                <CategorySelector
                  value={category}
                  onChange={setCategory}
                />
              )}

              {currentStep === 3 && (
                <DetailsInput
                  data={details}
                  onChange={setDetails}
                />
              )}

              {currentStep === 4 && (
                <EvidenceUploader
                  files={files}
                  onChange={setFiles}
                />
              )}

              {currentStep === 5 && (
                <ConfirmationStep
                  data={{
                    anonymityLevel,
                    category,
                    details,
                    files,
                    agreement,
                    setAgreement
                  }}
                  onEdit={goToStep}
                />
              )}
            </div>

            {/* ナビゲーションボタン */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  戻る
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isStepValid(currentStep)}
                >
                  次へ
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!agreement || isSubmitting}
                >
                  {isSubmitting ? '送信中...' : '通報する'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ヘルプ情報 */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>お困りの場合は、下記の外部相談窓口もご利用いただけます：</p>
          <p className="mt-2">
            <span className="font-medium">外部弁護士窓口：</span>
            compliance-external@example.com
          </p>
          <p>
            <span className="font-medium">労働基準監督署：</span>
            最寄りの労働基準監督署
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReportForm;