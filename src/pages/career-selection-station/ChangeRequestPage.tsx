/**
 * ChangeRequestPage.tsx
 * コース変更申請フォーム
 *
 * A/B/C/Dコースから希望コースへの変更を申請
 * 年1回定期変更 or 特例変更（妊娠・介護・疾病）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  CareerCourseCode,
  CourseChangeReason,
  CareerCourseChangeRequestForm
} from '../../types/career-course';
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';

const COURSE_INFO: Record<CareerCourseCode, { name: string; emoji: string; gradient: string }> = {
  A: { name: 'Aコース（全面協力型）', emoji: '🚀', gradient: 'from-blue-500 to-purple-600' },
  B: { name: 'Bコース（施設内協力型）', emoji: '🏢', gradient: 'from-green-500 to-teal-600' },
  C: { name: 'Cコース（専門職型）', emoji: '⭐', gradient: 'from-amber-500 to-orange-600' },
  D: { name: 'Dコース（時短・制約あり型）', emoji: '🌸', gradient: 'from-pink-500 to-rose-600' }
};

const CHANGE_REASONS: { value: CourseChangeReason; label: string; isSpecial: boolean }[] = [
  { value: 'annual', label: '年1回定期変更', isSpecial: false },
  { value: 'special_pregnancy', label: '妊娠・出産', isSpecial: true },
  { value: 'special_caregiving', label: '介護', isSpecial: true },
  { value: 'special_illness', label: '疾病', isSpecial: true }
];

export const ChangeRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentCourse, setCurrentCourse] = useState<CareerCourseCode>('B');
  const [selectedCourse, setSelectedCourse] = useState<CareerCourseCode | null>(null);
  const [changeReason, setChangeReason] = useState<CourseChangeReason | null>(null);
  const [reasonDetail, setReasonDetail] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 今日の日付をデフォルトに設定
    const today = new Date().toISOString().split('T')[0];
    setRequestedDate(today);

    // TODO: 実際のAPIから現在のコースを取得
    // fetchCurrentCourse();
  }, []);

  const isSpecialChange = changeReason && changeReason.startsWith('special_');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCourse) {
      newErrors.course = '希望するコースを選択してください';
    }

    if (!changeReason) {
      newErrors.reason = '変更理由を選択してください';
    }

    if (!reasonDetail.trim()) {
      newErrors.reasonDetail = '理由詳細を入力してください';
    } else if (reasonDetail.length > 1000) {
      newErrors.reasonDetail = '理由詳細は1000文字以内で入力してください';
    }

    if (!requestedDate) {
      newErrors.requestedDate = '希望適用日を選択してください';
    } else {
      const selectedDate = new Date(requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.requestedDate = '希望適用日は今日以降の日付を選択してください';
      }
    }

    if (isSpecialChange && attachments.length === 0) {
      newErrors.attachments = '特例変更の場合は証明書類の添付が必要です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 実際のAPIエンドポイントに置き換える
      // const formData = new FormData();
      // formData.append('currentCourseCode', currentCourse);
      // formData.append('requestedCourseCode', selectedCourse!);
      // formData.append('changeReason', changeReason!);
      // formData.append('reasonDetail', reasonDetail);
      // formData.append('requestedEffectiveDate', requestedDate);
      // attachments.forEach(file => {
      //   formData.append('attachments', file);
      // });
      //
      // const response = await fetch('/api/career-course/change-request', {
      //   method: 'POST',
      //   body: formData
      // });

      // モック: 成功レスポンス
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 成功メッセージを表示して一覧ページへ
      alert('コース変更申請を受け付けました。人事部の審査をお待ちください。');
      navigate('/career-selection-station/my-requests');
    } catch (error) {
      alert('申請の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/career-selection-station')}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">コース変更申請</h1>
            <p className="text-slate-400 mt-1">希望するコースへの変更を申請します</p>
          </div>
        </div>

        {/* 現在のコース */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white">現在のコース</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className={`p-4 rounded-lg bg-gradient-to-r ${COURSE_INFO[currentCourse].gradient}`}>
              <div className="flex items-center gap-3 text-white">
                <span className="text-3xl">{COURSE_INFO[currentCourse].emoji}</span>
                <div>
                  <div className="text-xl font-bold">{currentCourse}コース</div>
                  <div className="text-sm opacity-90">{COURSE_INFO[currentCourse].name}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 希望コース選択 */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white">希望するコース</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['A', 'B', 'C', 'D'] as CareerCourseCode[]).map(course => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  disabled={course === currentCourse}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${course === currentCourse
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-300'
                      : selectedCourse === course
                        ? `bg-gradient-to-r ${COURSE_INFO[course].gradient} text-white border-transparent shadow-lg`
                        : 'bg-white border-slate-300 hover:border-blue-400 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{COURSE_INFO[course].emoji}</span>
                    <div className="text-left">
                      <div className="text-lg font-bold">{course}コース</div>
                      <div className={`text-sm ${selectedCourse === course ? 'text-white/90' : 'text-slate-600'}`}>
                        {COURSE_INFO[course].name}
                      </div>
                    </div>
                    {selectedCourse === course && (
                      <CheckCircle2 className="w-6 h-6 ml-auto text-white" />
                    )}
                  </div>
                  {course === currentCourse && (
                    <Badge variant="secondary" className="mt-2">現在のコース</Badge>
                  )}
                </button>
              ))}
            </div>
            {errors.course && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.course}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 変更理由 */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white">変更理由</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              {CHANGE_REASONS.map(reason => (
                <label
                  key={reason.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="changeReason"
                    value={reason.value}
                    checked={changeReason === reason.value}
                    onChange={() => setChangeReason(reason.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-slate-700">{reason.label}</span>
                  {reason.isSpecial && (
                    <Badge variant="secondary" className="ml-auto">特例変更</Badge>
                  )}
                </label>
              ))}
            </div>
            {errors.reason && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reason}
              </p>
            )}

            {isSpecialChange && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 特例変更の場合は、証明書類（診断書、介護認定書類等）の添付が必須です
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 理由詳細 */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white">理由詳細</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="コース変更を希望する理由を具体的に記入してください（最大1000文字）"
              rows={6}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{reasonDetail.length} / 1000 文字</span>
              {errors.reasonDetail && (
                <p className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.reasonDetail}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 希望適用日 */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white">希望適用日</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.requestedDate && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.requestedDate}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 添付ファイル */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white flex items-center gap-2">
              添付ファイル
              {isSpecialChange && <Badge variant="destructive">必須</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">クリックしてファイルを選択</span>
              <span className="text-xs text-slate-500">（複数ファイル可）</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attachments && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.attachments}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/career-selection-station')}
            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            確認画面へ
          </button>
        </div>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>申請内容の確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 mb-1">現在のコース</div>
                <div className="font-semibold">{COURSE_INFO[currentCourse].name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">希望コース</div>
                <div className="font-semibold">{selectedCourse && COURSE_INFO[selectedCourse].name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">変更理由</div>
                <div className="font-semibold">
                  {CHANGE_REASONS.find(r => r.value === changeReason)?.label}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">希望適用日</div>
                <div className="font-semibold">{requestedDate}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">添付ファイル</div>
                <div className="font-semibold">{attachments.length}件</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  この内容で申請します。よろしいですか？
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : '申請する'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};