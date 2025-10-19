import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { BarChart3, Users, TrendingUp, BookOpen, Building } from 'lucide-react';
import { users } from '../data/demo/users';

export const AnalyticsFunctionsPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('user_analysis');

  // 権限レベルに応じてタブを動的に構成
  const analyticsTabs = [
    // レベル3以上
    ...(userPermissionLevel >= 3 ? [
      { id: 'user_analysis', label: '部門ユーザー分析', icon: Users },
      { id: 'generation_analysis', label: '部門世代間分析', icon: TrendingUp }
    ] : []),
    // レベル5以上
    ...(userPermissionLevel >= 5 ? [
      { id: 'hierarchy_analysis', label: '施設階層間分析', icon: Building },
      { id: 'profession_analysis', label: '施設職種間分析', icon: BookOpen }
    ] : []),
    // レベル10以上
    ...(userPermissionLevel >= 10 ? [
      { id: 'all_facilities_analysis', label: '全施設分析', icon: BarChart3 },
      { id: 'executive_report', label: 'エグゼクティブレポート', icon: BookOpen }
    ] : [])
  ];

  const renderUserAnalysis = () => {
    const analysisScope = userPermissionLevel >= 10 ? '全施設' : '部門';
    const targetUsers = userPermissionLevel >= 10 
      ? users 
      : users.filter(u => u.department === user?.department);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">対象ユーザー数</h3>
            <div className="text-3xl font-bold text-blue-600">{targetUsers.length}</div>
            <div className="text-sm text-green-600">{analysisScope}</div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">アクティブ率</h3>
            <div className="text-3xl font-bold text-green-600">87%</div>
            <div className="text-sm text-blue-600">+5% 前月比</div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">平均評価</h3>
            <div className="text-3xl font-bold text-purple-600">4.2</div>
            <div className="text-sm text-gray-500">/5.0</div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">満足度</h3>
            <div className="text-3xl font-bold text-orange-600">82%</div>
            <div className="text-sm text-green-600">+3% 前年比</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">権限レベル分布</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(level => {
                const count = targetUsers.filter(u => u.permissionLevel === level).length;
                const percentage = count > 0 ? (count / targetUsers.length) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">レベル{level}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}名</span>
                    <span className="text-xs text-gray-500 w-12">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">活動パターン分析</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">朝型活動（6-12時）</span>
                <span className="text-lg font-bold text-blue-600">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">昼型活動（12-18時）</span>
                <span className="text-lg font-bold text-green-600">38%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">夜型活動（18-24時）</span>
                <span className="text-lg font-bold text-purple-600">17%</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>推奨アクション:</strong> 朝の時間帯でのコミュニケーション活性化施策を検討
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">パフォーマンス傾向</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">高パフォーマー (20%)</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 積極的な提案・参加</li>
                <li>• 高い目標達成率</li>
                <li>• チーム貢献度が高い</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">標準パフォーマー (65%)</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 安定した業務遂行</li>
                <li>• 平均的な参加度</li>
                <li>• 改善余地あり</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">要支援 (15%)</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 個別サポートが必要</li>
                <li>• スキル向上支援</li>
                <li>• モチベーション向上</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderGenerationAnalysis = () => {
    const analysisScope = userPermissionLevel >= 10 ? '全施設' : '部門';
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{analysisScope}世代構成</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">22%</div>
              <div className="text-sm text-gray-600">Z世代 (20代)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">35%</div>
              <div className="text-sm text-gray-600">ミレニアル (30代)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">28%</div>
              <div className="text-sm text-gray-600">X世代 (40代)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">15%</div>
              <div className="text-sm text-gray-600">ベビーブーマー (50代+)</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">世代別特徴分析</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">Z世代 (20代)</h4>
                <p className="text-sm text-gray-600">デジタルネイティブ、即応性重視、多様性受容</p>
                <div className="text-xs text-blue-600 mt-1">エンゲージメント: 88%</div>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-900">ミレニアル世代 (30代)</h4>
                <p className="text-sm text-gray-600">ワークライフバランス重視、キャリア志向</p>
                <div className="text-xs text-green-600 mt-1">エンゲージメント: 82%</div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-900">X世代 (40代)</h4>
                <p className="text-sm text-gray-600">実用主義、リーダーシップ、安定志向</p>
                <div className="text-xs text-purple-600 mt-1">エンゲージメント: 79%</div>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-gray-900">ベビーブーマー (50代+)</h4>
                <p className="text-sm text-gray-600">経験重視、指導力、組織への忠誠心</p>
                <div className="text-xs text-orange-600 mt-1">エンゲージメント: 85%</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">世代間協働分析</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Z世代 ↔ ベビーブーマー</span>
                <span className="text-sm font-bold text-green-600">協働度: 高</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">ミレニアル ↔ X世代</span>
                <span className="text-sm font-bold text-blue-600">協働度: 中</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Z世代 ↔ X世代</span>
                <span className="text-sm font-bold text-yellow-600">協働度: 改善要</span>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">推奨施策</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 世代間メンタリングプログラム</li>
                  <li>• 多世代チームプロジェクト</li>
                  <li>• 相互理解ワークショップ</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderAllFacilitiesAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">全施設統合分析</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">255</div>
              <div className="text-sm text-gray-500">総職員数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-gray-500">総合満足度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.3</div>
              <div className="text-sm text-gray-500">平均パフォーマンス</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">施設間比較</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">施設名</th>
                  <th className="text-center py-2">職員数</th>
                  <th className="text-center py-2">満足度</th>
                  <th className="text-center py-2">エンゲージメント</th>
                  <th className="text-center py-2">生産性</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">さつき台病院</td>
                  <td className="text-center py-2">145</td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">92%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">88%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">高</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">緑風園</td>
                  <td className="text-center py-2">78</td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">85%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">82%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">中</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">訪問看護ステーション</td>
                  <td className="text-center py-2">32</td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">94%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">91%</span>
                  </td>
                  <td className="text-center py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">高</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">総合的な改善提案</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">優先改善項目</h4>
            <div className="space-y-2">
              <div className="p-3 border-l-4 border-red-500 bg-red-50">
                <h5 className="font-medium text-red-900">緑風園のエンゲージメント向上</h5>
                <p className="text-sm text-red-800">他施設比較で最も改善余地がある項目</p>
              </div>
              <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                <h5 className="font-medium text-yellow-900">施設間人材交流促進</h5>
                <p className="text-sm text-yellow-800">ベストプラクティス共有の強化</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">成功事例の横展開</h4>
            <div className="space-y-2">
              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <h5 className="font-medium text-green-900">訪問看護ステーションの高満足度</h5>
                <p className="text-sm text-green-800">小規模チーム運営ノウハウの活用</p>
              </div>
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <h5 className="font-medium text-blue-900">病院の生産性向上施策</h5>
                <p className="text-sm text-blue-800">効率化ツールの他施設展開</p>
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
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">分析機能</h1>
          </div>
          <p className="text-gray-600">
            {userPermissionLevel >= 10 
              ? '全施設のデータ分析と洞察を提供します。'
              : userPermissionLevel >= 5
              ? '施設レベルのデータ分析と洞察を提供します。'
              : '部門レベルのデータ分析と洞察を提供します。'
            }
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {analyticsTabs.map(tab => {
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
          {activeTab === 'user_analysis' && renderUserAnalysis()}
          {activeTab === 'generation_analysis' && renderGenerationAnalysis()}
          {activeTab === 'all_facilities_analysis' && renderAllFacilitiesAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFunctionsPage;