import React from 'react';
import InterviewBookingCalendar from '../components/interview/InterviewBookingCalendar';

const InterviewBookingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダーセクション */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              💬 面談予約システム
            </h1>
            <p className="text-gray-300 text-lg">
              人財統括本部との面談を24時間いつでも予約できます
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <InterviewBookingCalendar />
          </div>

          {/* 利用案内 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              📋 利用案内
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h3 className="font-semibold mb-2">⏰ 面談時間</h3>
                <ul className="space-y-1">
                  <li>• 平日 13:40〜16:50</li>
                  <li>• 1回30分間</li>
                  <li>• 5枠/日（最大）</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📅 予約制限</h3>
                <ul className="space-y-1">
                  <li>• 最大30日先まで予約可能</li>
                  <li>• 月2回まで</li>
                  <li>• 前回面談から30日以上空ける</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💡 面談内容例</h3>
                <ul className="space-y-1">
                  <li>• キャリア相談</li>
                  <li>• 職場の悩み</li>
                  <li>• スキル開発</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📞 お問い合わせ</h3>
                <ul className="space-y-1">
                  <li>• 人財統括本部</li>
                  <li>• 内線: 2200</li>
                  <li>• 受付: 9:00-17:00</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewBookingPage;