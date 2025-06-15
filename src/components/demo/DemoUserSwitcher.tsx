import React, { useState } from 'react';
import { ChevronDown, User, Shield, Briefcase, UserCheck, Building2, Users } from 'lucide-react';
import { demoUsers, DemoUser, ACCOUNT_TYPE_MAPPING } from '../../data/demo/users';
import { AccountHierarchyService } from '../../services/AccountHierarchyService';
import { FACILITIES } from '../../data/medical/facilities';

interface DemoUserSwitcherProps {
  currentUser: DemoUser;
  onUserChange: (user: DemoUser) => void;
}

const permissionLevelInfo = {
  1: { label: 'スタッフ', color: 'bg-gray-100 text-gray-700', icon: User },
  2: { label: 'スーパーバイザー', color: 'bg-blue-100 text-blue-700', icon: UserCheck },
  3: { label: '部門長', color: 'bg-green-100 text-green-700', icon: Briefcase },
  4: { label: '施設長', color: 'bg-yellow-100 text-yellow-700', icon: Building2 },
  5: { label: '人事部門長', color: 'bg-orange-100 text-orange-700', icon: Users },
  6: { label: '人事部長', color: 'bg-red-100 text-red-700', icon: Shield },
  7: { label: '役員秘書', color: 'bg-purple-100 text-purple-700', icon: Shield },
  8: { label: '理事長', color: 'bg-indigo-100 text-indigo-700', icon: Shield },
};

export const DemoUserSwitcher: React.FC<DemoUserSwitcherProps> = ({ currentUser, onUserChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'level' | 'hierarchy'>('level');

  const groupedUsers = demoUsers.reduce((acc, user) => {
    if (!acc[user.permissionLevel]) {
      acc[user.permissionLevel] = [];
    }
    acc[user.permissionLevel].push(user);
    return acc;
  }, {} as Record<number, DemoUser[]>);

  const levelInfo = permissionLevelInfo[currentUser.permissionLevel as keyof typeof permissionLevelInfo];
  const Icon = levelInfo?.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left">
          <div className="font-medium text-gray-900">{currentUser.name}</div>
          <div className="text-xs text-gray-500">{currentUser.position}</div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color || 'bg-gray-100 text-gray-700'}`}>
          <Icon className="w-3 h-3" />
          <span>Lv.{currentUser.permissionLevel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[400px]">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demo User Selector
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('level')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    viewMode === 'level'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  レベル別
                </button>
                <button
                  onClick={() => setViewMode('hierarchy')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    viewMode === 'hierarchy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  組織階層
                </button>
              </div>
            </div>
            
            {/* Permission Level Filter */}
            <div className="flex flex-wrap gap-1 px-3 py-2 mb-2">
              <button
                onClick={() => setSelectedLevel(null)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedLevel === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Levels
              </button>
              {Object.keys(groupedUsers).map((level) => {
                const levelNum = parseInt(level);
                const info = permissionLevelInfo[levelNum as keyof typeof permissionLevelInfo];
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(levelNum)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedLevel === levelNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Lv.{level}
                  </button>
                );
              })}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {viewMode === 'level' ? (
                // Level-based view
                Object.entries(groupedUsers)
                  .filter(([level]) => selectedLevel === null || parseInt(level) === selectedLevel)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([level, users]) => {
                  const levelNum = parseInt(level);
                  const info = permissionLevelInfo[levelNum as keyof typeof permissionLevelInfo];
                  const LevelIcon = info?.icon;
                  
                  return (
                    <div key={level} className="mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color || 'bg-gray-100 text-gray-700'}`}>
                          {LevelIcon && <LevelIcon className="w-3 h-3" />}
                          {info.label}
                        </span>
                        <span className="text-xs text-gray-500">Level {level}</span>
                      </div>
                      
                      {users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            onUserChange(user);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                            currentUser.id === user.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.position} • {user.department}
                            </div>
                            {user.facility_id && (
                              <div className="text-xs text-gray-400">
                                {FACILITIES[user.facility_id as keyof typeof FACILITIES]?.name || user.facility_id}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {user.budgetApprovalLimit !== undefined && (
                              <div className="text-xs text-gray-500">
                                {AccountHierarchyService.formatBudgetLimit(user.budgetApprovalLimit)}
                              </div>
                            )}
                            {user.directReports && (
                              <div className="text-xs text-gray-400">
                                {user.directReports} 名
                              </div>
                            )}
                          </div>
                          {currentUser.id === user.id && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })
              ) : (
                // Hierarchical view
                <HierarchicalUserList 
                  users={demoUsers} 
                  currentUser={currentUser}
                  onUserChange={(user) => {
                    onUserChange(user);
                    setIsOpen(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hierarchical user list component
interface HierarchicalUserListProps {
  users: DemoUser[];
  currentUser: DemoUser;
  onUserChange: (user: DemoUser) => void;
}

const HierarchicalUserList: React.FC<HierarchicalUserListProps> = ({ users, currentUser, onUserChange }) => {
  const renderUserNode = (user: DemoUser, level: number = 0) => {
    const directReports = users.filter(u => u.parent_id === user.id);
    const levelInfo = permissionLevelInfo[user.permissionLevel as keyof typeof permissionLevelInfo];
    const Icon = levelInfo?.icon;
    
    return (
      <div key={user.id} style={{ marginLeft: `${level * 20}px` }}>
        <button
          onClick={() => onUserChange(user)}
          className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
            currentUser.id === user.id ? 'bg-blue-50' : ''
          }`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{user.name}</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${levelInfo.color || 'bg-gray-100 text-gray-700'}`}>
                {Icon && <Icon className="w-3 h-3" />}
                {levelInfo.label}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {user.position} • {user.department}
            </div>
            {user.facility_id && (
              <div className="text-xs text-gray-400">
                {FACILITIES[user.facility_id as keyof typeof FACILITIES]?.name || user.facility_id}
              </div>
            )}
          </div>
          <div className="text-right">
            {user.budgetApprovalLimit !== undefined && (
              <div className="text-xs text-gray-500">
                {AccountHierarchyService.formatBudgetLimit(user.budgetApprovalLimit)}
              </div>
            )}
            {directReports.length > 0 && (
              <div className="text-xs text-gray-400">
                {directReports.length} 名の部下
              </div>
            )}
          </div>
          {currentUser.id === user.id && (
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </button>
        
        {/* Render direct reports */}
        {directReports.map(report => renderUserNode(report, level + 1))}
      </div>
    );
  };
  
  // Start with top-level users (those without parents)
  const topLevelUsers = users.filter(u => !u.parent_id);
  
  return (
    <div className="py-2">
      {topLevelUsers.map(user => renderUserNode(user))}
    </div>
  );
};