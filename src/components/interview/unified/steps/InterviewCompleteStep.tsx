import React from 'react';
import { CheckCircle, Mail, Clock, Phone, Calendar, ArrowLeft } from 'lucide-react';

interface InterviewCompleteStepProps {
  requestId?: string;
}

const InterviewCompleteStep: React.FC<InterviewCompleteStepProps> = ({
  requestId
}) => {
  const handleViewHistory = () => {
    // 予約履歴画面へ遷移（仮実装）
    console.log('予約履歴画面へ遷移');
  };

  const handleBackToTop = () => {
    // トップ画面へ戻る（仮実装）
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 成功アイコン */}
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>

        {/* メインメッセージ */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          仮予約を受け付けました
        </h1>

        {/* 受付番号 */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="text-sm text-gray-600 mb-1">受付番号</h2>
          <div className="text-xl font-mono font-bold text-indigo-600">
            {requestId || 'REQ-2025-0914-001'}
          </div>
        </div>

        {/* メール送信通知 */}
        <div className="flex items-center justify-center text-green-600 mb-6">
          <Mail className="w-5 h-5 mr-2" />
          <span className="text-sm">確認メールを送信しました</span>
        </div>

        {/* 次のステップ */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            次のステップ
          </h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="font-medium text-gray-800">人事部にて内容確認</div>
                <div className="text-sm text-gray-600">（当日中）</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="font-medium text-gray-800">担当者・日時の調整</div>
                <div className="text-sm text-gray-600">（1営業日）</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <div className="font-medium text-gray-800">本予約確定のご連絡</div>
                <div className="text-sm text-gray-600">（1-2営業日以内）</div>
              </div>
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            ご不明な点がございましたら
          </p>
          <p className="font-semibold text-gray-800">人事部までお問い合わせください</p>
          <div className="flex items-center justify-center mt-2 text-blue-600">
            <Phone className="w-4 h-4 mr-1" />
            <span className="text-sm">内線: 1234</span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={handleViewHistory}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            予約履歴を見る
          </button>

          <button
            onClick={handleBackToTop}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            トップに戻る
          </button>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 text-xs text-gray-500 text-left">
          <p className="mb-1">• 変更・キャンセルは人事部へご連絡ください</p>
          <p className="mb-1">• 緊急の場合は直接お電話ください</p>
          <p>• 受付番号は予約完了まで保管してください</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompleteStep;