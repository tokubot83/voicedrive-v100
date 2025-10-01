/**
 * WebhookTestPanel.tsx
 * Webhook通知テストパネル
 *
 * 開発環境で医療システムからのWebhook通知をシミュレート
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import CareerCourseNotificationService from '../../services/CareerCourseNotificationService';

export const WebhookTestPanel: React.FC = () => {
  const [staffId, setStaffId] = useState('OH-NS-2021-001');
  const [approvedCourse, setApprovedCourse] = useState('A');
  const [effectiveDate, setEffectiveDate] = useState('2026-04-01');
  const [rejectionReason, setRejectionReason] = useState('現在の勤務状況から、来年度の変更が望ましいと判断しました。');
  const [reviewComment, setReviewComment] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

  // 開発環境のみ表示
  if (process.env.NODE_ENV === 'production' && !isTestMode) {
    return null;
  }

  const handleApprovalTest = async () => {
    const notificationService = CareerCourseNotificationService.getInstance();
    await notificationService.simulateWebhookNotification('approved', staffId, {
      approvedCourse,
      effectiveDate,
      reviewComment,
    });
    alert('承認通知を送信しました');
  };

  const handleRejectionTest = async () => {
    const notificationService = CareerCourseNotificationService.getInstance();
    await notificationService.simulateWebhookNotification('rejected', staffId, {
      rejectionReason,
      reviewComment,
    });
    alert('却下通知を送信しました');
  };

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
      <CardHeader className="bg-orange-100">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bell className="w-5 h-5" />
          Webhook通知テスト（開発用）
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ このパネルは開発環境専用です。医療システムからのWebhook通知をシミュレートします。
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            職員ID
          </label>
          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="OH-NS-2021-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            審査コメント（オプション）
          </label>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows={3}
            placeholder="人事部からのコメント"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 承認通知 */}
          <div className="border border-green-300 rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              承認通知
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  承認コース
                </label>
                <select
                  value={approvedCourse}
                  onChange={(e) => setApprovedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="A">Aコース（全面協力型）</option>
                  <option value="B">Bコース（施設内協力型）</option>
                  <option value="C">Cコース（専門職型）</option>
                  <option value="D">Dコース（時短型）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  適用日
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleApprovalTest}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                承認通知を送信
              </button>
            </div>
          </div>

          {/* 却下通知 */}
          <div className="border border-red-300 rounded-lg p-4 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              却下通知
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  却下理由
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={4}
                />
              </div>
              <button
                onClick={handleRejectionTest}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                却下通知を送信
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-semibold text-blue-800 mb-2">テスト手順:</h5>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>申請状況確認画面を別タブで開く</li>
            <li>このパネルで「承認通知を送信」または「却下通知を送信」をクリック</li>
            <li>ブラウザ通知とサウンドが再生されることを確認</li>
            <li>申請状況確認画面がリアルタイムで更新されることを確認</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
