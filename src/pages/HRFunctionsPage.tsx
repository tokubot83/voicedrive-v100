import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { UserCheck, Calendar, Users, FileText, BarChart3 } from 'lucide-react';
import { demoUsers } from '../data/demo/users';

export const HRFunctionsPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('interview_management');

  const hrTabs = [
    { id: 'interview_management', label: '面談管理', icon: Calendar },
    { id: 'policy_management', label: 'ポリシー管理', icon: FileText },
    { id: 'talent_analytics', label: 'タレント分析', icon: BarChart3 },
    ...(userPermissionLevel >= 9 ? [{ id: 'hr_dashboard', label: '人事ダッシュボード', icon: Users }] : [])
  ];

  const renderInterviewManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">今月の面談統計</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-500">実施済み面談</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-500">予定面談</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-500">緊急面談要請</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">今週の面談予定</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">定期面談 - 田中花子</p>
                  <p className="text-xs text-gray-500">12/25 14:00 • 1時間</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded">詳細</button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">評価面談 - 佐藤太郎</p>
                  <p className="text-xs text-gray-500">12/26 10:00 • 1.5時間</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded">詳細</button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">緊急面談 - 山田一郎</p>
                  <p className="text-xs text-gray-500">12/27 13:00 • 30分</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded">詳細</button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">面談記録</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            新規面談記録
          </button>
        </div>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">定期面談 - 田中花子</h4>
                <p className="text-sm text-gray-600">2024年12月20日 14:00-15:00</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">完了</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">業務内容と今後のキャリア希望について相談。スキルアップ研修の参加を希望。</p>
            <div className="text-xs text-gray-500">面談者: {user?.name}</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPolicyManagement = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">人事ポリシー管理</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            新規ポリシー作成
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">勤務時間・休暇に関する規定</h4>
                <p className="text-sm text-gray-600">職員の勤務時間、休暇取得に関する詳細規定</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">有効</span>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  編集
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              最終更新: 2024年4月1日 • 更新者: 人事部長
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">研修・教育制度規程</h4>
                <p className="text-sm text-gray-600">職員の継続教育と研修参加に関する規定</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">有効</span>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  編集
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              最終更新: 2024年3月15日 • 更新者: 教育担当者
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">評価制度ガイドライン</h4>
                <p className="text-sm text-gray-600">職員評価の基準と手順に関するガイドライン</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">改訂中</span>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  編集
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              最終更新: 2024年2月20日 • 更新者: 人事担当者
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTalentAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">スキル分布</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">看護技術</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">コミュニケーション</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium">78%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">リーダーシップ</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">パフォーマンス指標</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4.2/5.0</div>
              <div className="text-sm text-gray-500">平均評価スコア</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">92%</div>
                <div className="text-xs text-gray-500">目標達成率</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">15</div>
                <div className="text-xs text-gray-500">研修完了数</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">高パフォーマー分析</h3>
        <div className="space-y-3">
          {demoUsers.slice(0, 5).map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.position} • {member.department}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {(Math.random() * 1 + 4).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">評価スコア</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderHRDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総職員数</h3>
          <div className="text-3xl font-bold text-blue-600">{demoUsers.length}</div>
          <div className="text-sm text-green-600">+5% 前月比</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">新入職員</h3>
          <div className="text-3xl font-bold text-green-600">8</div>
          <div className="text-sm text-blue-600">今月</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">退職者</h3>
          <div className="text-3xl font-bold text-red-600">2</div>
          <div className="text-sm text-orange-600">今月</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">離職率</h3>
          <div className="text-3xl font-bold text-purple-600">3.2%</div>
          <div className="text-sm text-green-600">-0.5% 前年比</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">採用活動状況</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">応募者数</span>
              <span className="text-lg font-bold text-blue-600">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">面接実施</span>
              <span className="text-lg font-bold text-green-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">内定者</span>
              <span className="text-lg font-bold text-purple-600">6</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">研修実施状況</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">実施済み研修</span>
              <span className="text-lg font-bold text-blue-600">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">参加者総数</span>
              <span className="text-lg font-bold text-green-600">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">満足度</span>
              <span className="text-lg font-bold text-purple-600">4.5/5</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">人事機能</h1>
          </div>
          <p className="text-gray-600">人事管理と職員サポートを行います。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {hrTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        <div>
          {activeTab === 'interview_management' && renderInterviewManagement()}
          {activeTab === 'policy_management' && renderPolicyManagement()}
          {activeTab === 'talent_analytics' && renderTalentAnalytics()}
          {activeTab === 'hr_dashboard' && renderHRDashboard()}
        </div>
      </div>
    </div>
  );
};

export default HRFunctionsPage;