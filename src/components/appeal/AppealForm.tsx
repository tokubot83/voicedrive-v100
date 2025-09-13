import React, { useState, useEffect } from 'react';
import { 
  AppealRequest, 
  AppealCategory,
  APPEAL_CATEGORY_LABELS,
  APPEAL_VALIDATION_RULES
} from '../../types/appeal';
import appealService from '../../services/appealService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

interface AppealFormProps {
  onSuccess?: (appealId: string) => void;
  onCancel?: () => void;
  evaluationData?: {
    period: string;
    score: number;
  };
}

const AppealForm: React.FC<AppealFormProps> = ({ 
  onSuccess, 
  onCancel,
  evaluationData 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<AppealRequest>>({
    employeeId: user?.employeeId || '',
    employeeName: user?.name || '',
    evaluationPeriod: evaluationData?.period || '',
    appealCategory: AppealCategory.OTHER,
    appealReason: '',
    originalScore: evaluationData?.score,
    requestedScore: undefined,
    evidenceDocuments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [evaluationPeriods, setEvaluationPeriods] = useState<string[]>([]);
  const [reasonLength, setReasonLength] = useState(0);

  useEffect(() => {
    loadEvaluationPeriods();
  }, []);

  const loadEvaluationPeriods = async () => {
    try {
      const periods = await appealService.getEvaluationPeriods();
      setEvaluationPeriods(periods);
    } catch (error) {
      console.error('評価期間の読み込みエラー:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.evaluationPeriod) {
      newErrors.evaluationPeriod = '評価期間を選択してください';
    }

    if (!formData.appealCategory) {
      newErrors.appealCategory = 'カテゴリーを選択してください';
    }

    if (!formData.appealReason || formData.appealReason.length < APPEAL_VALIDATION_RULES.appealReason.minLength) {
      newErrors.appealReason = `申し立て理由は${APPEAL_VALIDATION_RULES.appealReason.minLength}文字以上入力してください`;
    }

    if (formData.appealReason && formData.appealReason.length > APPEAL_VALIDATION_RULES.appealReason.maxLength) {
      newErrors.appealReason = `申し立て理由は${APPEAL_VALIDATION_RULES.appealReason.maxLength}文字以内で入力してください`;
    }

    if (formData.requestedScore !== undefined) {
      if (formData.requestedScore < 0 || formData.requestedScore > 100) {
        newErrors.requestedScore = '希望評価点は0〜100の範囲で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // ファイルサイズチェック
      if (file.size > APPEAL_VALIDATION_RULES.evidenceDocuments.maxSizePerFile) {
        newErrors.push(`${file.name}のサイズが10MBを超えています`);
        continue;
      }

      // ファイルタイプチェック
      if (!APPEAL_VALIDATION_RULES.evidenceDocuments.allowedTypes.includes(file.type)) {
        newErrors.push(`${file.name}は許可されていないファイル形式です`);
        continue;
      }

      newFiles.push(file);
    }

    // ファイル数チェック
    if (uploadedFiles.length + newFiles.length > APPEAL_VALIDATION_RULES.evidenceDocuments.maxFiles) {
      toast.error(`ファイルは最大${APPEAL_VALIDATION_RULES.evidenceDocuments.maxFiles}個まで添付できます`);
      return;
    }

    if (newErrors.length > 0) {
      newErrors.forEach(error => toast.error(error));
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('入力内容を確認してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // ファイルアップロード
      const uploadedUrls: string[] = [];
      for (const file of uploadedFiles) {
        try {
          const url = await appealService.uploadEvidence(file);
          uploadedUrls.push(url);
        } catch (error) {
          console.error('ファイルアップロードエラー:', error);
          toast.error(`${file.name}のアップロードに失敗しました`);
        }
      }

      // 異議申し立て送信
      const request: AppealRequest = {
        employeeId: formData.employeeId!,
        employeeName: formData.employeeName!,
        evaluationPeriod: formData.evaluationPeriod!,
        appealCategory: formData.appealCategory!,
        appealReason: formData.appealReason!,
        originalScore: formData.originalScore,
        requestedScore: formData.requestedScore,
        evidenceDocuments: uploadedUrls,
        preferredContactMethod: formData.preferredContactMethod
      };

      const response = await appealService.submitAppeal(request);

      if (response.success) {
        toast.success('異議申し立てを受け付けました');
        if (onSuccess) {
          onSuccess(response.appealId);
        }
      } else {
        toast.error(response.error?.message || '送信に失敗しました');
      }
    } catch (error: any) {
      console.error('送信エラー:', error);
      toast.error(error.message || '送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="appeal-form-container">
      <h2 className="text-2xl font-bold mb-6">評価異議申し立て</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 評価期間 */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">
            評価期間 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.evaluationPeriod}
            onChange={(e) => setFormData({ ...formData, evaluationPeriod: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.evaluationPeriod ? 'border-red-500' : 'border-gray-300'}`}
            disabled={!!evaluationData?.period}
          >
            <option value="">選択してください</option>
            {evaluationPeriods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
          {errors.evaluationPeriod && (
            <p className="text-red-500 text-sm mt-1">{errors.evaluationPeriod}</p>
          )}
        </div>

        {/* 申し立てカテゴリー */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">
            申し立てカテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.appealCategory}
            onChange={(e) => setFormData({ ...formData, appealCategory: e.target.value as AppealCategory })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.appealCategory ? 'border-red-500' : 'border-gray-300'}`}
          >
            {Object.entries(APPEAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.appealCategory && (
            <p className="text-red-500 text-sm mt-1">{errors.appealCategory}</p>
          )}
        </div>

        {/* 現在の評価点・希望評価点 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium mb-2">
              現在の評価点
            </label>
            <input
              type="number"
              value={formData.originalScore || ''}
              onChange={(e) => setFormData({ ...formData, originalScore: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium mb-2">
              希望する評価点
            </label>
            <input
              type="number"
              value={formData.requestedScore || ''}
              onChange={(e) => setFormData({ ...formData, requestedScore: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.requestedScore ? 'border-red-500' : 'border-gray-300'}`}
              min="0"
              max="100"
            />
            {errors.requestedScore && (
              <p className="text-red-500 text-sm mt-1">{errors.requestedScore}</p>
            )}
          </div>
        </div>

        {/* 申し立て理由 */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">
            申し立て理由 <span className="text-red-500">*</span>
            <span className="ml-2 text-gray-500 text-sm">
              ({reasonLength}/{APPEAL_VALIDATION_RULES.appealReason.minLength}文字以上)
            </span>
          </label>
          <textarea
            value={formData.appealReason}
            onChange={(e) => {
              setFormData({ ...formData, appealReason: e.target.value });
              setReasonLength(e.target.value.length);
            }}
            className={`w-full px-3 py-2 border rounded-lg ${errors.appealReason ? 'border-red-500' : 'border-gray-300'}`}
            rows={6}
            placeholder="具体的な理由を入力してください（最低100文字）"
          />
          {errors.appealReason && (
            <p className="text-red-500 text-sm mt-1">{errors.appealReason}</p>
          )}
          <div className="mt-2">
            <div className="text-sm text-gray-600">
              <p>記載例：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>具体的な成果や実績を記載</li>
                <li>評価に反映されていない貢献内容</li>
                <li>評価基準の適用に関する疑問点</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 証拠書類 */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">
            証拠書類（任意）
            <span className="ml-2 text-gray-500 text-sm">
              最大{APPEAL_VALIDATION_RULES.evidenceDocuments.maxFiles}ファイル、各10MBまで
            </span>
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 希望連絡方法 */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">
            希望連絡方法（任意）
          </label>
          <input
            type="text"
            value={formData.preferredContactMethod || ''}
            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="メール、電話、チャット等"
          />
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">注意事項</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>評価開示後14日以内に申し立てを行ってください</li>
            <li>審査には最大3週間かかる場合があります</li>
            <li>追加情報の提出を求められる場合があります</li>
            <li>申し立て内容は秘密厳守で取り扱われます</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '異議申し立てを送信'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppealForm;