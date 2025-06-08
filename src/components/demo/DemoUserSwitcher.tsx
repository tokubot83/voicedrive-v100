import React, { useState } from 'react';
import { ChevronDown, User, Shield, Briefcase, UserCheck } from 'lucide-react';
import { demoUsers, DemoUser } from '../../data/demo/users';

interface DemoUserSwitcherProps {
  currentUser: DemoUser;
  onUserChange: (user: DemoUser) => void;
}

const permissionLevelInfo = {
  1: { label: 'Entry-level', color: 'bg-gray-100 text-gray-700', icon: User },
  2: { label: 'Senior', color: 'bg-blue-100 text-blue-700', icon: UserCheck },
  3: { label: 'Team Lead', color: 'bg-green-100 text-green-700', icon: Briefcase },
  4: { label: 'Supervisor', color: 'bg-yellow-100 text-yellow-700', icon: Briefcase },
  5: { label: 'Manager', color: 'bg-orange-100 text-orange-700', icon: Shield },
  6: { label: 'Sr. Manager', color: 'bg-red-100 text-red-700', icon: Shield },
  7: { label: 'Director', color: 'bg-purple-100 text-purple-700', icon: Shield },
  8: { label: 'Executive', color: 'bg-indigo-100 text-indigo-700', icon: Shield },
};

export const DemoUserSwitcher: React.FC<DemoUserSwitcherProps> = ({ currentUser, onUserChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const groupedUsers = demoUsers.reduce((acc, user) => {
    if (!acc[user.permissionLevel]) {
      acc[user.permissionLevel] = [];
    }
    acc[user.permissionLevel].push(user);
    return acc;
  }, {} as Record<number, DemoUser[]>);

  const levelInfo = permissionLevelInfo[currentUser.permissionLevel as keyof typeof permissionLevelInfo];
  const Icon = levelInfo.icon;

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
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
          <Icon className="w-3 h-3" />
          <span>Lv.{currentUser.permissionLevel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[320px]">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
              Demo User Selector
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
              {Object.entries(groupedUsers)
                .filter(([level]) => selectedLevel === null || parseInt(level) === selectedLevel)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([level, users]) => {
                  const levelNum = parseInt(level);
                  const info = permissionLevelInfo[levelNum as keyof typeof permissionLevelInfo];
                  const LevelIcon = info.icon;
                  
                  return (
                    <div key={level} className="mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                          <LevelIcon className="w-3 h-3" />
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
                          </div>
                          {user.directReports && (
                            <span className="text-xs text-gray-400">
                              {user.directReports} reports
                            </span>
                          )}
                          {currentUser.id === user.id && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};