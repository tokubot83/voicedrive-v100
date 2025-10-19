import React, { useState, useEffect } from 'react';
import { Bell, Settings, HelpCircle, TrendingUp } from 'lucide-react';
import EvaluationNotificationList from '../components/evaluation/EvaluationNotificationList';
import { NotificationStats } from '../types/evaluation-notification';
import { evaluationNotificationService } from '../services/evaluationNotificationService';
import { useAuth } from '../hooks/useAuth';

const EvaluationNotificationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'help'>('notifications');

  const renderNotificationSettings = () => {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">通知設定</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">メール通知</h4>
              <p className="text-sm text-gray-600">評価結果開示時にメールで通知を受け取る</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">プッシュ通知</h4>
              <p className="text-sm text-gray-600">アプリ内で即座に通知を受け取る</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">締切リマインダー</h4>
              <p className="text-sm text-gray-600">異議申立締切の3日前にリマインダーを送信</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            設定を保存
          </button>
        </div>
      </div>
    );
  };

  const renderHelpContent = () => {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">評価通知システムについて</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">評価結果通知とは？</h4>
            <p className="text-gray-700 leading-relaxed">
              医療職員管理システムで評価が開示されると、VoiceDriveアプリに自動的に通知が送信されます。
              評価結果の詳細確認や異議申立は、すべてVoiceDriveアプリから行います。
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2">異議申立について</h4>
            <p className="text-gray-700 leading-relaxed mb-2">
              評価結果に疑問がある場合、開示から14日以内に異議申立を行うことができます。
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>計算誤りがある場合</li>
              <li>成果や実績の見落としがある場合</li>
              <li>評価基準の適用に疑問がある場合</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2">V3評価システムの特徴</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>100点満点制</strong>：より細かい評価が可能</li>
                <li>• <strong>7段階グレード</strong>：S, A+, A, B+, B, C, D</li>
                <li>• <strong>透明性向上</strong>：評価根拠が明確</li>
                <li>• <strong>異議申立重視</strong>：職員の声を重視</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2">よくある質問</h4>
            <div className="space-y-3">
              <details className="bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">評価結果がVoiceDriveに表示されません</summary>
                <p className="mt-2 text-sm text-gray-700">
                  医療システムでの開示処理が完了してから最大1時間程度かかる場合があります。
                  時間が経っても表示されない場合は、管理者にお問い合わせください。
                </p>
              </details>
              
              <details className="bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">異議申立の結果はどこで確認できますか？</summary>
                <p className="mt-2 text-sm text-gray-700">
                  申立状況は同じくVoiceDriveアプリの「異議申立」セクションで確認できます。
                  回答が完了すると通知でお知らせします。
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">評価通知</h1>
          </div>
          <p className="text-gray-600 max-w-2xl">
            医療職員管理システムからの評価結果通知を確認し、必要に応じて異議申立を行うことができます。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-colors
                ${activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Bell className="w-5 h-5" />
              通知一覧
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-colors
                ${activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              設定
            </button>
            
            <button
              onClick={() => setActiveTab('help')}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-colors
                ${activeTab === 'help'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <HelpCircle className="w-5 h-5" />
              ヘルプ
            </button>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div>
          {activeTab === 'notifications' && <EvaluationNotificationList />}
          {activeTab === 'settings' && renderNotificationSettings()}
          {activeTab === 'help' && renderHelpContent()}
        </div>

        {/* フッター */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>© 2025 VoiceDrive - 医療職員管理システム連携</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>V3評価システム対応済み</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationNotificationPage;