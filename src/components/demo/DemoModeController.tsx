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
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[7]); // user-8: Level 5 HR_DEPARTMENT_HEAD

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
                    This is a demonstration environment showcasing VoiceDrive's employee voice platform.
                    You can explore different user perspectives and see how the system works across
                    various permission levels.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Demo Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>User Switching:</strong> Switch between 15 different demo users across 8 permission levels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>20 Demo Posts:</strong> Explore various post types with seasonal content distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>5 Active Projects:</strong> See project workflows and ROI tracking in action</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span><strong>ROI Measurement:</strong> View detailed cost-benefit analysis and metrics</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Types & Permission Levels</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 1: STAFF</div>
                      <div className="text-xs text-gray-500">一般職員 • 承認権限なし</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 2: SUPERVISOR</div>
                      <div className="text-xs text-gray-500">スーパーバイザー • ¥100,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 3: DEPARTMENT_HEAD</div>
                      <div className="text-xs text-gray-500">部門長 • ¥500,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 4: FACILITY_HEAD</div>
                      <div className="text-xs text-gray-500">施設長 • ¥1,000,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 5: HR_DEPARTMENT_HEAD</div>
                      <div className="text-xs text-gray-500">人事部門長 • ¥2,000,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 6: HR_DIRECTOR</div>
                      <div className="text-xs text-gray-500">人事部長 • ¥5,000,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 7: EXECUTIVE_SECRETARY</div>
                      <div className="text-xs text-gray-500">役員秘書 • ¥10,000,000まで</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-700">Level 8: CHAIRMAN</div>
                      <div className="text-xs text-gray-500">理事長 • 無制限</div>
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