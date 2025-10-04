import React, { useState, createContext, useContext, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info, X, BarChart3 } from 'lucide-react';
import { DemoUser, demoUsers } from '../../data/demo/users';
import { DemoUserSwitcher } from './DemoUserSwitcher';
import { DemoSystemStats } from './DemoSystemStats';

interface DemoModeContextType {
  isDemoMode: boolean;
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
};

interface DemoModeProviderProps {
  children: React.ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo mode
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[9]); // Level 6: 主任

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, currentUser, setCurrentUser, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const DemoModeController: React.FC = () => {
  const { isDemoMode, currentUser, setCurrentUser, toggleDemoMode } = useDemoMode();
  const [showInfo, setShowInfo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Show info panel on first load
    const hasSeenInfo = localStorage.getItem('voicedrive-demo-info-seen');
    if (!hasSeenInfo && isDemoMode) {
      setShowInfo(true);
      localStorage.setItem('voicedrive-demo-info-seen', 'true');
    }
  }, []);

  if (!isDemoMode) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Demo Mode Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 md:p-3 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium text-sm">Demo Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <DemoUserSwitcher currentUser={currentUser} onUserChange={setCurrentUser} isMobile={true} />
              <div className="flex items-center justify-center px-2 py-1 bg-white/10 rounded text-xs">
                {currentUser.accountType} • Level {currentUser.permissionLevel}
              </div>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">Demo Mode Active</span>
              </div>
              
              <DemoUserSwitcher currentUser={currentUser} onUserChange={setCurrentUser} isMobile={false} />
              
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                <span className="text-xs">
                  {currentUser.accountType} | Level {currentUser.permissionLevel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Stats</span>
              </button>
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">Info</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">VoiceDrive Demo Mode</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Welcome to VoiceDrive Demo!</h3>
                  <p className="text-sm">
                    This is a demonstration environment showcasing VoiceDrive's employee voice platform
                    with the new 25-level permission system integrated with the medical personnel management system.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Demo Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>User Switching:</strong> Switch between 25 different demo users across all permission levels (1-18, 0.5刻み含む)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>25-Level System:</strong> Experience経験年数別レベル（1-4）、役職層（5-13）、法人人事部（14-17）、最高経営層（18）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>0.5刻みレベル:</strong> 看護職のリーダー業務対応レベル（1.5, 2.5, 3.5, 4.5）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>特別権限:</strong> 健診担当(97)、産業医(98)、システム管理者(99)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">25段階権限レベル概要</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-800 mb-1">一般職員層（経験年数別）</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="bg-blue-50 p-2 rounded">Level 1: 新人（1年目）</div>
                        <div className="bg-blue-50 p-2 rounded">Level 1.5: 新人リーダー可</div>
                        <div className="bg-blue-50 p-2 rounded">Level 2: 若手（2-3年）</div>
                        <div className="bg-blue-50 p-2 rounded">Level 2.5: 若手リーダー可</div>
                        <div className="bg-blue-50 p-2 rounded">Level 3: 中堅（4-10年）</div>
                        <div className="bg-blue-50 p-2 rounded">Level 3.5: 中堅リーダー可</div>
                        <div className="bg-blue-50 p-2 rounded">Level 4: ベテラン（11年以上）</div>
                        <div className="bg-blue-50 p-2 rounded">Level 4.5: ベテランリーダー可</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800 mb-1">役職層</div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-green-50 p-2 rounded">Lv5: 副主任（¥50k）</div>
                        <div className="bg-green-50 p-2 rounded">Lv6: 主任（¥100k）</div>
                        <div className="bg-green-50 p-2 rounded">Lv7: 副師長（¥300k）</div>
                        <div className="bg-green-50 p-2 rounded">Lv8: 師長（¥500k）</div>
                        <div className="bg-green-50 p-2 rounded">Lv9: 副部長（¥1M）</div>
                        <div className="bg-green-50 p-2 rounded">Lv10: 部長（¥2M）</div>
                        <div className="bg-green-50 p-2 rounded">Lv11: 事務長（¥3M）</div>
                        <div className="bg-green-50 p-2 rounded">Lv12: 副院長（¥5M）</div>
                        <div className="bg-green-50 p-2 rounded">Lv13: 院長（¥10M）</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800 mb-1">法人人事部・最高経営層</div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-purple-50 p-2 rounded">Lv14: 人事部門員</div>
                        <div className="bg-purple-50 p-2 rounded">Lv15: 人事部門長（¥3M）</div>
                        <div className="bg-purple-50 p-2 rounded">Lv16: 戦略企画員（¥5M）</div>
                        <div className="bg-purple-50 p-2 rounded">Lv17: 戦略企画長（¥10M）</div>
                        <div className="bg-purple-50 p-2 rounded">Lv18: 理事長（無制限）</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Hierarchical Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Parent-Child Relationships:</strong> Each user has a direct supervisor and may have direct reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Budget Approval Limits:</strong> Each level has specific financial approval authority</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Facility Assignment:</strong> Users are assigned to specific medical facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>Organization Path:</strong> Complete hierarchy path from Chairman to each user</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    This is demo data only. All users, posts, and projects are fictional and for
                    demonstration purposes only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {showStats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">System Statistics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <DemoSystemStats />
            </div>
          </div>
        </div>
      )}
    </>
  );
};