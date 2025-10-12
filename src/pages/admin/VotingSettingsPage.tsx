import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const VotingSettingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 現在のタブを判定
  const activeTab = location.pathname.includes('project')
    ? 'project'
    : location.pathname.includes('history')
    ? 'history'
    : 'agenda';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                投票設定
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                議題モードとプロジェクトモードの投票設定を管理します
              </p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Level 99
              </span>
              <span className="text-blue-400">専用</span>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-slate-700/50">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => navigate('/admin/voting-settings/agenda')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                ${activeTab === 'agenda'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <span className="text-lg">🗳️</span>
              <span>議題モード</span>
            </button>
            <button
              onClick={() => navigate('/admin/voting-settings/project')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                ${activeTab === 'project'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <span className="text-lg">📋</span>
              <span>プロジェクトモード</span>
            </button>
            <button
              onClick={() => navigate('/admin/voting-settings/history')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                ${activeTab === 'history'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <span className="text-lg">📜</span>
              <span>変更履歴</span>
            </button>
          </nav>
        </div>
      </div>

      {/* モード別設定画面 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default VotingSettingsPage;
