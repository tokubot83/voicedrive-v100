/**
 * 議題モード通知機能デモコンポーネント
 *
 * 各種通知をテストできるデモページ
 */

import React, { useState } from 'react';
import { Post, User } from '../../types';
import { AgendaLevel } from '../../types/committee';
import { useAgendaVoting } from '../../hooks/useAgendaVoting';
import { useAgendaCommittee } from '../../hooks/useAgendaCommittee';
import { useAgendaDeadline } from '../../hooks/useAgendaDeadline';

// デモ用の投稿データ
const demoPost: Post = {
  id: 'demo-post-001',
  title: '職員休憩室の環境改善提案',
  content: '職員の健康とワークライフバランス向上のため、休憩室の環境を改善したいと考えています。',
  type: 'improvement',
  category: '業務改善',
  author: {
    id: 'user-001',
    name: '山田太郎',
    role: '看護師',
    department: '看護部',
    facility_id: 'facility-001',
    permissionLevel: 3
  },
  authorId: 'user-001',
  createdAt: new Date(),
  priority: 'medium',
  votes: {
    'strongly-support': 5,
    'support': 3,
    'neutral': 1,
    'oppose': 0,
    'strongly-oppose': 0
  },
  agendaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
  agendaDeadlineExtensions: 0,
  proposalType: 'facility_improvement'
};

// デモ用のユーザーデータ
const demoUsers: User[] = [
  {
    id: 'user-001',
    name: '山田太郎',
    role: '看護師',
    department: '看護部',
    facility_id: 'facility-001',
    permissionLevel: 3
  },
  {
    id: 'user-002',
    name: '佐藤花子',
    role: '主任看護師',
    department: '看護部',
    facility_id: 'facility-001',
    permissionLevel: 6
  },
  {
    id: 'user-003',
    name: '鈴木一郎',
    role: '師長',
    department: '看護部',
    facility_id: 'facility-001',
    permissionLevel: 8
  }
];

export const AgendaNotificationDemo: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<AgendaLevel>('DEPT_REVIEW');
  const [notificationLog, setNotificationLog] = useState<string[]>([]);

  const { simulateLevelUp } = useAgendaVoting(demoUsers);
  const { testNotifications } = useAgendaCommittee(demoUsers);
  const { extendDeadline } = useAgendaDeadline(demoUsers);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    setNotificationLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleLevelUpTest = async () => {
    addLog(`レベル昇格通知テスト開始: ${selectedLevel}`);

    // ブラウザ通知の許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      addLog(`ブラウザ通知許可: ${permission}`);
    }

    await simulateLevelUp(demoPost, selectedLevel);
    addLog(`レベル昇格通知送信完了`);
  };

  const handleCommitteeTest = async () => {
    addLog('委員会通知フローテスト開始');

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    await testNotifications(demoPost);
    addLog('委員会通知フローテスト完了');
  };

  const handleDeadlineExtension = async () => {
    addLog('期限延長通知テスト開始');

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    await extendDeadline(demoPost, 7);
    addLog('期限延長通知送信完了');
  };

  const levels: Array<{ value: AgendaLevel; label: string; emoji: string }> = [
    { value: 'DEPT_REVIEW', label: '部署検討', emoji: '📋' },
    { value: 'DEPT_AGENDA', label: '部署議題', emoji: '👥' },
    { value: 'FACILITY_AGENDA', label: '施設議題', emoji: '🏥' },
    { value: 'CORP_REVIEW', label: '法人検討', emoji: '🏢' },
    { value: 'CORP_AGENDA', label: '法人議題', emoji: '🏛️' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">📢</span>
              議題モード通知機能デモ
            </h1>
            <p className="text-gray-400">
              各種通知をテストして、動作を確認できます
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左カラム: テストコントロール */}
            <div className="space-y-6">
              {/* レベル昇格通知テスト */}
              <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  レベル昇格通知
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  議題が特定のレベルに到達した時の通知をテストします
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      昇格先レベル
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value as AgendaLevel)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.emoji} {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleLevelUpTest}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                  >
                    レベル昇格通知をテスト
                  </button>
                </div>
              </div>

              {/* 委員会通知テスト */}
              <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  委員会通知フロー
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  委員会への提出 → 審議開始 → 承認の一連の通知をテストします
                </p>

                <button
                  onClick={handleCommitteeTest}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  委員会通知フローをテスト
                </button>
              </div>

              {/* 期限延長通知テスト */}
              <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  期限延長通知
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  投票期限が延長された時の通知をテストします
                </p>

                <button
                  onClick={handleDeadlineExtension}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  期限延長通知をテスト
                </button>
              </div>
            </div>

            {/* 右カラム: 通知ログ */}
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                通知ログ
              </h2>

              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
                {notificationLog.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    通知をテストすると、ログがここに表示されます
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notificationLog.map((log, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-300 font-mono bg-gray-800 rounded px-3 py-2 border border-gray-700"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setNotificationLog([])}
                className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ログをクリア
              </button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              ブラウザ通知について
            </h3>
            <p className="text-blue-300 text-sm">
              初回テスト時にブラウザ通知の許可を求められます。「許可」を選択すると、実際のブラウザ通知が表示されます。
              コンソール（F12）で詳細なログも確認できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaNotificationDemo;
