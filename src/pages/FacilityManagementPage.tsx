import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { Building, TrendingUp, DollarSign, MapPin } from 'lucide-react';

export const FacilityManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { userPermissionLevel } = usePermissions();
  const [activeTab, setActiveTab] = useState('facility_overview');

  const facilityTabs = [
    { id: 'facility_overview', label: '施設概要', icon: Building },
    { id: 'facility_strategy', label: '施設戦略', icon: TrendingUp },
    { id: 'facility_budget', label: '予算計画', icon: DollarSign },
    ...(userPermissionLevel >= 10 ? [
      { id: 'all_facilities', label: '全施設管理', icon: MapPin }
    ] : [])
  ];

  const renderFacilityOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">管理施設数</h3>
          <div className="text-3xl font-bold text-blue-600">
            {userPermissionLevel >= 10 ? '3' : '1'}
          </div>
          <div className="text-sm text-green-600">施設</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総職員数</h3>
          <div className="text-3xl font-bold text-green-600">
            {userPermissionLevel >= 10 ? '255' : '145'}
          </div>
          <div className="text-sm text-blue-600">名</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">月次予算</h3>
          <div className="text-3xl font-bold text-purple-600">
            {userPermissionLevel >= 10 ? '¥12.5M' : '¥8.2M'}
          </div>
          <div className="text-sm text-orange-600">使用率 78%</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">稼働率</h3>
          <div className="text-3xl font-bold text-orange-600">92%</div>
          <div className="text-sm text-green-600">+3% 前月比</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最新の施設課題</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">設備老朽化対応</p>
              <p className="text-xs text-gray-500">MRI装置の更新が必要 • 高優先度</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">人員配置最適化</p>
              <p className="text-xs text-gray-500">夜勤体制の見直し検討 • 中優先度</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFacilityStrategy = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">施設戦略ロードマップ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">短期戦略（1年）</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 医療機器の計画的更新</li>
              <li>• 職員研修プログラム強化</li>
              <li>• 患者満足度向上施策</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">中期戦略（3年）</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 新棟建設計画推進</li>
              <li>• 地域医療連携強化</li>
              <li>• 専門医療科目拡充</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">長期戦略（5年）</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 地域医療拠点化</li>
              <li>• 予防医療センター設立</li>
              <li>• 持続可能経営確立</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFacilityBudget = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">予算概要</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userPermissionLevel >= 10 ? '¥150M' : '¥98M'}
              </div>
              <div className="text-sm text-gray-500">年間予算</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userPermissionLevel >= 10 ? '¥117M' : '¥76M'}
              </div>
              <div className="text-sm text-gray-500">使用済み</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">予算配分</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">人件費</span>
              <span className="font-medium">
                {userPermissionLevel >= 10 ? '¥90M (60%)' : '¥59M (60%)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">設備・医療機器</span>
              <span className="font-medium">
                {userPermissionLevel >= 10 ? '¥30M (20%)' : '¥19.6M (20%)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">運営費</span>
              <span className="font-medium">
                {userPermissionLevel >= 10 ? '¥22.5M (15%)' : '¥14.7M (15%)'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAllFacilities = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['さつき台病院', '介護老人保健施設 緑風園', '訪問看護ステーション さつき'].map((facility, index) => (
          <Card key={facility} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{facility}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">職員数:</span>
                <span className="font-medium">
                  {index === 0 ? '145名' : index === 1 ? '78名' : '32名'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">月次売上:</span>
                <span className="font-medium">
                  {index === 0 ? '¥8.2M' : index === 1 ? '¥3.1M' : '¥1.2M'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">稼働率:</span>
                <span className="font-medium">
                  {index === 0 ? '94%' : index === 1 ? '89%' : '96%'}
                </span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              詳細管理
            </button>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {userPermissionLevel >= 10 ? '全施設管理' : '施設管理'}
            </h1>
          </div>
          <p className="text-gray-600">施設の運営管理と戦略策定を行います。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {facilityTabs.map(tab => {
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
          {activeTab === 'facility_overview' && renderFacilityOverview()}
          {activeTab === 'facility_strategy' && renderFacilityStrategy()}
          {activeTab === 'facility_budget' && renderFacilityBudget()}
          {activeTab === 'all_facilities' && renderAllFacilities()}
        </div>
      </div>
    </div>
  );
};

export default FacilityManagementPage;