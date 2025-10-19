import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Target, TrendingUp, Users, UserX, BarChart3 } from 'lucide-react';
import { demoUsers } from '../data/demo/users';

export const StrategicHRPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('strategic_planning');

  const strategicTabs = [
    { id: 'strategic_planning', label: '戦略的人事計画', icon: Target },
    { id: 'org_development', label: '組織開発', icon: Users },
    { id: 'performance_analytics', label: 'パフォーマンス分析', icon: BarChart3 },
    { id: 'retirement_management', label: '退職管理', icon: UserX }
  ];

  const renderStrategicPlanning = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">戦略目標</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-gray-500">職員満足度目標</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5%</div>
              <div className="text-sm text-gray-500">離職率目標</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">120</div>
              <div className="text-sm text-gray-500">年間採用目標</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">戦略的イニシアチブ</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900">タレントマネジメント強化</h4>
              <p className="text-sm text-gray-600">高パフォーマー育成とキャリアパス最適化</p>
              <div className="text-xs text-gray-500 mt-1">進捗: 75% • 期限: 2025年3月</div>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900">働き方改革推進</h4>
              <p className="text-sm text-gray-600">ワークライフバランス向上とリモートワーク導入</p>
              <div className="text-xs text-gray-500 mt-1">進捗: 60% • 期限: 2025年6月</div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900">デジタル人事システム導入</h4>
              <p className="text-sm text-gray-600">HR-Techを活用した効率化と分析強化</p>
              <div className="text-xs text-gray-500 mt-1">進捗: 40% • 期限: 2025年9月</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">人材戦略ロードマップ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">短期目標（1年）</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 新人研修プログラム刷新</li>
              <li>• 評価制度の透明性向上</li>
              <li>• メンタルヘルス支援強化</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">中期目標（3年）</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• リーダーシップ開発プログラム</li>
              <li>• 多様性・包摂性推進</li>
              <li>• デジタルスキル向上支援</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">長期目標（5年）</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 次世代リーダー輩出</li>
              <li>• 組織文化変革</li>
              <li>• 地域医療貢献人材育成</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderOrgDevelopment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">組織健全性指標</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">職員エンゲージメント</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-sm font-medium">82%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">組織コミットメント</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium">78%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">チーム協働性</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">イノベーション指向</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-sm font-medium">70%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">組織開発プログラム</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900">チームビルディング研修</h4>
              <p className="text-sm text-gray-600 mt-1">部門間コラボレーション強化</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">参加予定: 45名</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">準備中</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900">リーダーシップ開発</h4>
              <p className="text-sm text-gray-600 mt-1">次世代リーダー育成プログラム</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">参加中: 12名</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">進行中</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-gray-900">文化変革ワークショップ</h4>
              <p className="text-sm text-gray-600 mt-1">組織文化の共創と浸透</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">完了: 78名</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">完了</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">組織ネットワーク分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">影響力の高い職員</h4>
            <div className="space-y-2">
              {demoUsers.slice(0, 5).map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{(Math.random() * 30 + 70).toFixed(0)}</div>
                    <div className="text-xs text-gray-500">影響度</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">部門間連携度</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">看護部 ↔ 医療技術部</span>
                <span className="text-sm font-bold text-green-600">高</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">事務部 ↔ 各診療科</span>
                <span className="text-sm font-bold text-blue-600">中</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">リハビリ ↔ 栄養科</span>
                <span className="text-sm font-bold text-orange-600">低</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPerformanceAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総合パフォーマンス</h3>
          <div className="text-3xl font-bold text-blue-600">8.7/10</div>
          <div className="text-sm text-green-600">+0.3 前年比</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">生産性指標</h3>
          <div className="text-3xl font-bold text-green-600">112%</div>
          <div className="text-sm text-blue-600">目標比</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">品質スコア</h3>
          <div className="text-3xl font-bold text-purple-600">9.2/10</div>
          <div className="text-sm text-green-600">+0.5 前年比</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">イノベーション度</h3>
          <div className="text-3xl font-bold text-orange-600">7.8/10</div>
          <div className="text-sm text-yellow-600">±0 前年比</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">部門別パフォーマンス</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">看護部</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-sm font-medium">9.2</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">医療技術部</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="text-sm font-medium">8.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">事務部</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">8.5</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">改善提案実績</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">124</div>
              <div className="text-sm text-gray-500">年間提案数</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-600">89</div>
                <div className="text-xs text-gray-500">採用済み</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">¥2.4M</div>
                <div className="text-xs text-gray-500">コスト削減効果</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRetirementManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">退職関連統計</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">6</div>
              <div className="text-sm text-gray-500">今年度退職者</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3.2%</div>
              <div className="text-sm text-gray-500">離職率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-500">定年退職予定</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">退職プロセス管理</h3>
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">山田花子 - 看護師</h4>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">引き継ぎ中</span>
              </div>
              <p className="text-sm text-gray-600">退職予定日: 2025年1月31日</p>
              <div className="mt-2 text-xs text-gray-500">
                進捗: 引き継ぎ書作成完了 → 後任指導中
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">佐藤太郎 - 技師</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">面談実施中</span>
              </div>
              <p className="text-sm text-gray-600">退職予定日: 2025年2月28日</p>
              <div className="mt-2 text-xs text-gray-500">
                進捗: 退職面談実施 → 引き継ぎ計画策定中
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">退職理由分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">退職理由（過去1年）</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">キャリアアップ</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">家庭事情</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">他業界転職</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">定年退職</span>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">改善アクション</h4>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded text-sm">
                <strong>キャリアパス明確化</strong><br />
                昇進・昇格基準の透明化
              </div>
              <div className="p-2 bg-green-50 rounded text-sm">
                <strong>ワークライフバランス向上</strong><br />
                柔軟な勤務制度導入
              </div>
              <div className="p-2 bg-purple-50 rounded text-sm">
                <strong>エンゲージメント強化</strong><br />
                定期面談とフィードバック充実
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">戦略的人事機能</h1>
          </div>
          <p className="text-gray-600">組織の長期的発展を支える戦略的人事管理を行います。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {strategicTabs.map(tab => {
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
          {activeTab === 'strategic_planning' && renderStrategicPlanning()}
          {activeTab === 'org_development' && renderOrgDevelopment()}
          {activeTab === 'performance_analytics' && renderPerformanceAnalytics()}
          {activeTab === 'retirement_management' && renderRetirementManagement()}
        </div>
      </div>
    </div>
  );
};

export default StrategicHRPage;