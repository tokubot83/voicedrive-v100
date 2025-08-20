import React, { useState, useEffect } from 'react';
import { 
  AppealCategory,
  APPEAL_CATEGORY_LABELS
} from '../../types/appeal';
import { 
  V3AppealFormData,
  V3AppealRequest,
  V3EvaluationPeriod,
  V3GradeUtils,
  V3_APPEAL_VALIDATION_RULES
} from '../../types/appeal-v3';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

interface AppealFormV3Props {
  onSuccess?: (appealId: string) => void;
  onCancel?: () => void;
  evaluationData?: {
    period: string;
    score: number;
  };
}

const AppealFormV3: React.FC<AppealFormV3Props> = ({ 
  onSuccess, 
  onCancel,
  evaluationData 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<V3AppealFormData>({
    employeeId: user?.employeeId || '',
    employeeName: user?.name || '',
    evaluationPeriod: evaluationData?.period || '',
    appealCategory: AppealCategory.OTHER,
    appealReason: '',
    originalScore: evaluationData?.score || 0,
    requestedScore: 0,
    originalGrade: evaluationData?.score ? V3GradeUtils.getGradeFromScore(evaluationData.score) : '',
    requestedGrade: '',
    evidenceDocuments: [],
    step: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [evaluationPeriods, setEvaluationPeriods] = useState<V3EvaluationPeriod[]>([]);
  const [reasonLength, setReasonLength] = useState(0);

  useEffect(() => {
    loadV3EvaluationPeriods();
  }, []);

  useEffect(() => {
    // スコア変更時にグレードを自動更新
    if (formData.originalScore >= 0) {
      const originalGrade = V3GradeUtils.getGradeFromScore(formData.originalScore);
      setFormData(prev => ({ ...prev, originalGrade }));
    }
    
    if (formData.requestedScore >= 0) {
      const requestedGrade = V3GradeUtils.getGradeFromScore(formData.requestedScore);
      const previewData = {
        currentGradeInfo: V3GradeUtils.getGradeDescription(formData.originalGrade || ''),
        requestedGradeInfo: V3GradeUtils.getGradeDescription(requestedGrade),
        scoreDifference: V3GradeUtils.calculateScoreDifference(formData.originalScore, formData.requestedScore),
        estimatedPriority: V3GradeUtils.determineV3Priority(formData as V3AppealRequest)
      };
      
      setFormData(prev => ({ 
        ...prev, 
        requestedGrade,
        previewData 
      }));
    }
  }, [formData.originalScore, formData.requestedScore, formData.appealCategory]);

  const loadV3EvaluationPeriods = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v3/evaluation/periods');
      const data = await response.json();
      
      if (data.success && data.version === 'v3.0.0') {
        const activePeriods = data.periods.filter((p: V3EvaluationPeriod) => 
          new Date(p.appealDeadline) > new Date()
        );
        setEvaluationPeriods(activePeriods);
      }
    } catch (error) {
      console.error('V3評価期間の取得に失敗:', error);
      toast.error('V3評価期間の取得に失敗しました');
    }
  };

  const handleInputChange = (field: keyof V3AppealFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'appealReason') {
      setReasonLength(value.length);
    }
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必須フィールドチェック
    if (!formData.employeeId) newErrors.employeeId = '職員IDは必須です';
    if (!formData.employeeName) newErrors.employeeName = '職員名は必須です';
    if (!formData.evaluationPeriod) newErrors.evaluationPeriod = '評価期間を選択してください';
    if (!formData.appealReason) newErrors.appealReason = '申し立て理由は必須です';

    // V3スコア検証
    if (!V3GradeUtils.validateV3Score(formData.originalScore)) {
      newErrors.originalScore = '現在のスコアは0-100の整数で入力してください';
    }
    
    if (!V3GradeUtils.validateV3Score(formData.requestedScore)) {
      newErrors.requestedScore = '希望スコアは0-100の整数で入力してください';
    }

    // 申し立て理由の文字数チェック
    if (formData.appealReason) {
      if (formData.appealReason.length < V3_APPEAL_VALIDATION_RULES.appealReason.minLength) {
        newErrors.appealReason = `申し立て理由は${V3_APPEAL_VALIDATION_RULES.appealReason.minLength}文字以上入力してください`;
      }
      if (formData.appealReason.length > V3_APPEAL_VALIDATION_RULES.appealReason.maxLength) {
        newErrors.appealReason = `申し立て理由は${V3_APPEAL_VALIDATION_RULES.appealReason.maxLength}文字以内で入力してください`;
      }
    }

    // スコア差チェック
    if (formData.originalScore === formData.requestedScore) {
      newErrors.requestedScore = '希望スコアは現在のスコアと異なる値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('入力内容を確認してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData: V3AppealRequest = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        evaluationPeriod: formData.evaluationPeriod,
        appealCategory: formData.appealCategory,
        appealReason: formData.appealReason,
        originalScore: formData.originalScore,
        requestedScore: formData.requestedScore,
        evidenceDocuments: formData.evidenceDocuments
      };

      const response = await fetch('http://localhost:8080/api/v3/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`V3異議申し立てを受理しました（ID: ${result.appealId}）`);
        onSuccess?.(result.appealId);
      } else {
        throw new Error(result.error?.message || 'V3異議申し立てに失敗しました');
      }

    } catch (error: any) {
      console.error('V3異議申し立てエラー:', error);
      toast.error(error.message || 'V3異議申し立ての送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGradeDisplay = (score: number, grade: string) => (
    <div className="flex items-center space-x-2">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: V3GradeUtils.getGradeColor(grade) }}
      >
        {grade}
      </div>
      <div>
        <div className="font-semibold">{score}点</div>
        <div className="text-sm text-gray-500">{V3GradeUtils.getGradeDescription(grade)}</div>
      </div>
    </div>
  );

  const renderScoreInput = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    error?: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className={`w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <span className="text-gray-500">/ 100点</span>
        {value >= 0 && renderGradeDisplay(value, V3GradeUtils.getGradeFromScore(value))}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          V3評価システム 異議申し立てフォーム
        </h2>
        <p className="text-gray-600 mt-2">
          100点満点・7段階グレードシステム対応
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              職員ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.employeeId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: V3-TEST-E001"
            />
            {errors.employeeId && <p className="text-red-600 text-sm mt-1">{errors.employeeId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              職員名
            </label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) => handleInputChange('employeeName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.employeeName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: V3テスト太郎"
            />
            {errors.employeeName && <p className="text-red-600 text-sm mt-1">{errors.employeeName}</p>}
          </div>
        </div>

        {/* 評価期間選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            評価期間
          </label>
          <select
            value={formData.evaluationPeriod}
            onChange={(e) => handleInputChange('evaluationPeriod', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.evaluationPeriod ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">V3評価期間を選択してください</option>
            {evaluationPeriods.map(period => (
              <option key={period.id} value={period.id}>
                {period.name} (申し立て期限: {new Date(period.appealDeadline).toLocaleDateString()})
              </option>
            ))}
          </select>
          {errors.evaluationPeriod && <p className="text-red-600 text-sm mt-1">{errors.evaluationPeriod}</p>}
        </div>

        {/* V3スコア入力 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            V3評価スコア・グレード情報
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderScoreInput(
              '現在のスコア',
              formData.originalScore,
              (value) => handleInputChange('originalScore', value),
              errors.originalScore
            )}
            
            {renderScoreInput(
              '希望するスコア',
              formData.requestedScore,
              (value) => handleInputChange('requestedScore', value),
              errors.requestedScore
            )}
          </div>

          {/* スコア差とグレード変更の表示 */}
          {formData.previewData && (
            <div className="mt-6 p-4 bg-white rounded-md border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">変更プレビュー</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">スコア差:</span>
                  <span className="ml-2 font-semibold text-blue-600">
                    {formData.previewData.scoreDifference}点
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">グレード変更:</span>
                  <span className="ml-2">
                    {V3GradeUtils.getGradeProgressionMessage(
                      formData.originalGrade || '',
                      formData.requestedGrade || ''
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">推定優先度:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    formData.previewData.estimatedPriority === 'high' ? 'bg-red-100 text-red-800' :
                    formData.previewData.estimatedPriority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formData.previewData.estimatedPriority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 申し立てカテゴリ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            申し立てカテゴリ
          </label>
          <select
            value={formData.appealCategory}
            onChange={(e) => handleInputChange('appealCategory', e.target.value as AppealCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(APPEAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* 申し立て理由 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            申し立て理由（詳細）
            <span className="text-sm text-gray-500 ml-2">
              ({reasonLength}/{V3_APPEAL_VALIDATION_RULES.appealReason.maxLength}文字)
            </span>
          </label>
          <textarea
            value={formData.appealReason}
            onChange={(e) => handleInputChange('appealReason', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.appealReason ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="V3評価システム（100点満点）における具体的な異議申し立て理由を100文字以上で詳細に記載してください..."
          />
          {errors.appealReason && <p className="text-red-600 text-sm mt-1">{errors.appealReason}</p>}
          <p className="text-gray-500 text-sm mt-1">
            最低{V3_APPEAL_VALIDATION_RULES.appealReason.minLength}文字以上入力してください
          </p>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-200"
          >
            {isSubmitting ? 'V3システムに送信中...' : 'V3異議申し立てを送信'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppealFormV3;