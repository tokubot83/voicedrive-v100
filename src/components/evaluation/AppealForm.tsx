import React, { useState } from 'react';
import { AlertTriangle, FileText, Upload, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface AppealFormProps {
  evaluationData: {
    id: string;
    period: string;
    score: number;
    grade: string;
    disclosureDate: string;
    appealDeadline: string;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const AppealForm: React.FC<AppealFormProps> = ({
  evaluationData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    appealReason: '',
    specificPoints: [] as string[],
    evidenceDescription: '',
    desiredOutcome: '',
    supportingDocuments: [] as File[],
    acknowledgement: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const appealReasons = [
    { value: 'calculation_error', label: '評価点数の計算に誤りがある' },
    { value: 'missing_achievement', label: '評価されていない成果・貢献がある' },
    { value: 'unfair_comparison', label: '他の職員との評価基準が不公平' },
    { value: 'process_violation', label: '評価プロセスに規定違反がある' },
    { value: 'new_evidence', label: '評価時に考慮されなかった新事実がある' },
    { value: 'discrimination', label: '差別的・恣意的な評価の疑いがある' },
    { value: 'feedback_discrepancy', label: '日頃のフィードバックと評価が矛盾' },
    { value: 'other', label: 'その他の理由' }
  ];

  const specificPointsOptions = [
    { value: 'attendance', label: '勤怠評価' },
    { value: 'performance', label: '業績評価' },
    { value: 'teamwork', label: 'チームワーク評価' },
    { value: 'leadership', label: 'リーダーシップ評価' },
    { value: 'innovation', label: '改善・革新への貢献' },
    { value: 'customer_service', label: '患者対応・サービス' },
    { value: 'professional_skill', label: '専門スキル評価' },
    { value: 'compliance', label: 'コンプライアンス評価' }
  ];

  const handlePointToggle = (point: string) => {
    setFormData(prev => ({
      ...prev,
      specificPoints: prev.specificPoints.includes(point)
        ? prev.specificPoints.filter(p => p !== point)
        : [...prev.specificPoints, point]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...files]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acknowledgement) {
      alert('注意事項への同意が必要です');
      return;
    }

    const submissionData = {
      ...formData,
      evaluationId: evaluationData.id,
      evaluationPeriod: evaluationData.period,
      evaluationScore: evaluationData.score,
      evaluationGrade: evaluationData.grade,
      submittedAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(submissionData);
    }

    setIsSubmitted(true);
  };

  // 期限チェック
  const isDeadlinePassed = new Date(evaluationData.appealDeadline) < new Date();

  if (isSubmitted) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">異議申立を受理しました</h3>
        <p className="text-gray-400 mb-4">
          異議申立を正式に受理いたしました。<br />
          審査結果は2週間以内に書面にて通知いたします。
        </p>
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
          <h4 className="text-sm font-medium text-gray-300 mb-2">受理番号</h4>
          <p className="text-lg font-mono text-white">APL-2025-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          <p className="text-xs text-gray-400 mt-2">この番号は今後の問い合わせ時に必要となります</p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          閉じる
        </button>
      </div>
    );
  }

  if (isDeadlinePassed) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">異議申立期限を過ぎています</h3>
        </div>
        <p className="text-gray-300 mb-2">
          申立期限: {evaluationData.appealDeadline}
        </p>
        <p className="text-gray-400 text-sm">
          異議申立期限を過ぎたため、新規の申立はできません。<br />
          特別な事情がある場合は、人事部までご相談ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h4 className="text-sm font-medium text-orange-400">異議申立について</h4>
        </div>
        <div className="text-sm text-gray-300 space-y-1">
          <p>申立期限: {evaluationData.appealDeadline}</p>
          <p>対象評価: {evaluationData.period} （{evaluationData.score}点 / {evaluationData.grade}）</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          異議申立の主な理由
        </label>
        <select
          value={formData.appealReason}
          onChange={(e) => setFormData({...formData, appealReason: e.target.value})}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="">理由を選択してください</option>
          {appealReasons.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          異議がある評価項目（複数選択可）
        </label>
        <div className="grid grid-cols-2 gap-2">
          {specificPointsOptions.map((point) => (
            <label
              key={point.value}
              className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={formData.specificPoints.includes(point.value)}
                onChange={() => handlePointToggle(point.value)}
                className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <span className="ml-3 text-sm text-gray-300">{point.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          具体的な理由と根拠
        </label>
        <textarea
          value={formData.evidenceDescription}
          onChange={(e) => setFormData({...formData, evidenceDescription: e.target.value})}
          rows={5}
          required
          placeholder="なぜ評価に異議があるのか、具体的な事実や根拠を詳しく記述してください。"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          希望する対応
        </label>
        <textarea
          value={formData.desiredOutcome}
          onChange={(e) => setFormData({...formData, desiredOutcome: e.target.value})}
          rows={3}
          required
          placeholder="再評価、特定項目の見直し、追加査定など、希望する対応を記述してください。"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Upload className="w-4 h-4 inline mr-2" />
          証拠書類の添付（任意）
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
        />
        {formData.supportingDocuments.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.supportingDocuments.map((file, index) => (
              <div key={index} className="text-sm text-gray-400">
                📎 {file.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acknowledgement}
            onChange={(e) => setFormData({...formData, acknowledgement: e.target.checked})}
            className="w-5 h-5 mt-0.5 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
          />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-2">以下の注意事項を理解し、同意します：</p>
            <ul className="space-y-1 text-gray-400">
              <li>• 異議申立は公正かつ厳正に審査されます</li>
              <li>• 虚偽の申立は懲戒処分の対象となる場合があります</li>
              <li>• 審査結果に対する再申立は原則として認められません</li>
              <li>• 申立内容は記録として保管されます</li>
            </ul>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!formData.appealReason || !formData.evidenceDescription || !formData.desiredOutcome || !formData.acknowledgement}
          className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          異議申立を提出
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};

export default AppealForm;