import { useDemoMode } from '../components/demo/DemoModeController';

const SettingsPage = () => {
  const { currentUser } = useDemoMode();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Custom Header with Back Button */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">設定</h1>
            <p className="text-gray-400 text-sm">アカウント設定を管理</p>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">プロフィール設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">名前</label>
                  <input 
                    type="text" 
                    value={currentUser.name}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">役職</label>
                  <input 
                    type="text" 
                    value={currentUser.position}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">部門</label>
                  <input 
                    type="text" 
                    value={currentUser.department}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">通知設定</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">新しいコメント</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">提案の承認</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">メンション</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">プライバシー設定</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">プロフィールを公開</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">投稿履歴を公開</span>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;