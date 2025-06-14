// CrisisManagementPanel - 危機対応メンバー選定UI
// Phase 4: Level 7緊急権限による即時チーム編成・ワンクリック対応

import React, { useState, useEffect } from 'react';
import { 
  EmergencyType, 
  UrgencyLevel, 
  EmergencyContext, 
  EmergencySelectionResult,
  EmergencyTemplate,
  CrisisResponseTeam
} from '../../services/EmergencyMemberSelectionService';
import EmergencyMemberSelectionService from '../../services/EmergencyMemberSelectionService';

interface CrisisManagementPanelProps {
  projectId: string;
  executiveId: string;
  onEmergencyTeamFormed?: (result: EmergencySelectionResult) => void;
  onCancel?: () => void;
}

export const CrisisManagementPanel: React.FC<CrisisManagementPanelProps> = ({
  projectId,
  executiveId,
  onEmergencyTeamFormed,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'active'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('NATURAL_DISASTER');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('CRITICAL');
  const [emergencyContext, setEmergencyContext] = useState<EmergencyContext>({
    incidentId: '',
    description: '',
    affectedAreas: [],
    affectedPersonnel: 0,
    potentialImpact: {
      patient_safety: 'NONE',
      operational_continuity: 'NONE',
      financial_impact: 0,
      regulatory_impact: 'NONE',
      reputation_impact: 'NONE',
      estimated_recovery_time: 0
    },
    externalFactors: [],
    timeWindow: 60,
    resourceConstraints: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeEmergencies, setActiveEmergencies] = useState<EmergencySelectionResult[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<EmergencyTemplate[]>([]);

  const emergencyService = new EmergencyMemberSelectionService();

  useEffect(() => {
    loadEmergencyTemplates();
    loadActiveEmergencies();
  }, []);

  /**
   * 緊急テンプレートの読み込み
   */
  const loadEmergencyTemplates = async () => {
    // デモ用テンプレート
    const templates: EmergencyTemplate[] = [
      {
        id: 'natural_disaster',
        name: '自然災害対応',
        emergency_type: 'NATURAL_DISASTER',
        description: '地震・台風・洪水等の自然災害への即時対応チーム',
        pre_configured_team: {
          command_structure: {
            incidentCommander: 'executive_001',
            operationsChief: 'manager_ops',
            planningChief: 'manager_plan',
            logisticsChief: 'manager_log'
          },
          core_members: [
            { role: 'SAFETY_OFFICER', preferred_users: ['safety_001'], minimum_required: 1 },
            { role: 'MEDICAL_COORDINATOR', preferred_users: ['medical_001'], minimum_required: 1 }
          ],
          support_roles: [
            { role: '施設管理', skills_required: ['設備点検'], count: 3 }
          ],
          external_contacts: ['消防署', '警察', '市役所']
        },
        response_procedures: [],
        resource_requirements: [],
        communication_templates: [],
        decision_tree: [],
        last_updated: new Date(),
        usage_count: 5,
        effectiveness_score: 8.5
      },
      {
        id: 'medical_emergency',
        name: '医療緊急事態',
        emergency_type: 'MEDICAL_EMERGENCY',
        description: '患者安全に関わる緊急医療事態への対応',
        pre_configured_team: {
          command_structure: {
            incidentCommander: 'medical_director',
            operationsChief: 'nurse_manager',
            planningChief: 'admin_manager',
            logisticsChief: 'supply_manager'
          },
          core_members: [
            { role: 'MEDICAL_COORDINATOR', preferred_users: ['doctor_001'], minimum_required: 1 }
          ],
          support_roles: [],
          external_contacts: ['救急医療センター']
        },
        response_procedures: [],
        resource_requirements: [],
        communication_templates: [],
        decision_tree: [],
        last_updated: new Date(),
        usage_count: 3,
        effectiveness_score: 9.0
      },
      {
        id: 'system_failure',
        name: 'システム障害対応',
        emergency_type: 'SYSTEM_FAILURE',
        description: '重要システムの障害・停止への緊急対応',
        pre_configured_team: {
          command_structure: {
            incidentCommander: 'it_director',
            operationsChief: 'system_admin',
            planningChief: 'security_officer',
            logisticsChief: 'support_manager'
          },
          core_members: [
            { role: 'TECHNICAL_SPECIALIST', preferred_users: ['it_001'], minimum_required: 2 }
          ],
          support_roles: [],
          external_contacts: ['システムベンダー', 'セキュリティ会社']
        },
        response_procedures: [],
        resource_requirements: [],
        communication_templates: [],
        decision_tree: [],
        last_updated: new Date(),
        usage_count: 8,
        effectiveness_score: 7.5
      }
    ];

    setAvailableTemplates(templates);
    if (templates.length > 0) {
      setSelectedTemplate(templates[0].id);
    }
  };

  /**
   * アクティブな緊急事態の読み込み
   */
  const loadActiveEmergencies = async () => {
    // デモ用データ
    setActiveEmergencies([]);
  };

  /**
   * テンプレートによる即時チーム編成
   */
  const executeTemplateResponse = async () => {
    if (!selectedTemplate) {
      setError('テンプレートを選択してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const template = availableTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('選択されたテンプレートが見つかりません');
      }

      const context: EmergencyContext = {
        incidentId: `incident_${Date.now()}`,
        description: `${template.name}による緊急対応`,
        affectedAreas: ['施設全体'],
        affectedPersonnel: 50,
        potentialImpact: {
          patient_safety: 'HIGH',
          operational_continuity: 'HIGH',
          financial_impact: 1000000,
          regulatory_impact: 'MEDIUM',
          reputation_impact: 'HIGH',
          estimated_recovery_time: 24
        },
        externalFactors: [],
        timeWindow: 60,
        resourceConstraints: []
      };

      const result = await emergencyService.oneClickTeamAssembly(
        selectedTemplate,
        executiveId,
        context
      );

      if (result.success) {
        onEmergencyTeamFormed?.(result);
        setActiveTab('active');
        loadActiveEmergencies();
      } else {
        setError(result.errors?.join(', ') || '緊急チーム編成に失敗しました');
      }

    } catch (err) {
      setError('緊急対応実行中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * カスタム緊急対応の実行
   */
  const executeCustomResponse = async () => {
    if (!emergencyContext.description) {
      setError('緊急事態の説明を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const context = {
        ...emergencyContext,
        incidentId: `custom_${Date.now()}`
      };

      const result = await emergencyService.executeEmergencySelection(
        projectId,
        executiveId,
        emergencyType,
        urgencyLevel,
        context
      );

      if (result.success) {
        onEmergencyTeamFormed?.(result);
        setActiveTab('active');
        loadActiveEmergencies();
      } else {
        setError(result.errors?.join(', ') || 'カスタム緊急対応に失敗しました');
      }

    } catch (err) {
      setError('カスタム対応実行中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 緊急度レベルの表示
   */
  const getUrgencyDisplay = (level: UrgencyLevel) => {
    const levelMap = {
      CRITICAL: { label: '最重要', color: 'bg-red-600', time: '1時間以内' },
      HIGH: { label: '緊急', color: 'bg-orange-500', time: '6時間以内' },
      MEDIUM: { label: '迅速', color: 'bg-yellow-500', time: '24時間以内' },
      LOW: { label: '計画的', color: 'bg-blue-500', time: '72時間以内' }
    };
    return levelMap[level];
  };

  /**
   * 緊急事態タイプの表示
   */
  const getEmergencyTypeDisplay = (type: EmergencyType) => {
    const typeMap = {
      NATURAL_DISASTER: { label: '自然災害', icon: '🌪️' },
      FACILITY_ACCIDENT: { label: '施設事故', icon: '⚠️' },
      SECURITY_BREACH: { label: 'セキュリティ侵害', icon: '🔒' },
      SYSTEM_FAILURE: { label: 'システム障害', icon: '💻' },
      MEDICAL_EMERGENCY: { label: '医療緊急事態', icon: '🏥' },
      STAFFING_CRISIS: { label: '人員危機', icon: '👥' },
      REGULATORY_VIOLATION: { label: '規制違反', icon: '📋' },
      REPUTATION_CRISIS: { label: '評判危機', icon: '📢' },
      CYBER_ATTACK: { label: 'サイバー攻撃', icon: '🛡️' },
      PANDEMIC_RESPONSE: { label: 'パンデミック対応', icon: '🦠' },
      FINANCIAL_CRISIS: { label: '財務危機', icon: '💰' },
      SUPPLY_CHAIN_DISRUPTION: { label: 'サプライチェーン混乱', icon: '📦' }
    };
    return typeMap[type];
  };

  /**
   * テンプレート選定タブ
   */
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 text-xl">🚨</span>
          <h3 className="font-bold text-red-800">緊急対応モード</h3>
        </div>
        <p className="text-red-700 text-sm">
          Level 7緊急権限による即時チーム編成。通常の承認プロセスを迂回します。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">緊急対応テンプレート選択</h3>
        <div className="grid gap-4">
          {availableTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span>{getEmergencyTypeDisplay(template.emergency_type).icon}</span>
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                <div className="text-right text-sm">
                  <div className="text-green-600">効果度: {template.effectiveness_score}/10</div>
                  <div className="text-gray-500">使用回数: {template.usage_count}</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  指揮官: {template.pre_configured_team.command_structure.incidentCommander}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  コア: {template.pre_configured_team.core_members.length}名
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  外部連携: {template.pre_configured_team.external_contacts.length}機関
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">即時実行確認</h4>
          <p className="text-sm text-gray-600 mb-4">
            選択されたテンプレートで緊急チームを即座に編成します。
            関係者への自動通知と指揮系統の確立が行われます。
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              キャンセル
            </button>
            <button
              onClick={executeTemplateResponse}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 rounded-md font-medium"
            >
              {loading ? '実行中...' : '🚨 緊急チーム編成実行'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * カスタム対応タブ
   */
  const renderCustomTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">緊急事態詳細</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">緊急事態の種類</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Object.entries({
                NATURAL_DISASTER: '自然災害',
                FACILITY_ACCIDENT: '施設事故',
                SECURITY_BREACH: 'セキュリティ侵害',
                SYSTEM_FAILURE: 'システム障害',
                MEDICAL_EMERGENCY: '医療緊急事態',
                STAFFING_CRISIS: '人員危機'
              }).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">緊急度レベル</label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as UrgencyLevel[]).map(level => {
                const display = getUrgencyDisplay(level);
                return (
                  <option key={level} value={level}>
                    {display.label} ({display.time})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">状況説明</label>
          <textarea
            value={emergencyContext.description}
            onChange={(e) => setEmergencyContext({
              ...emergencyContext,
              description: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="緊急事態の詳細な状況を記入してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">影響を受ける人数</label>
            <input
              type="number"
              value={emergencyContext.affectedPersonnel}
              onChange={(e) => setEmergencyContext({
                ...emergencyContext,
                affectedPersonnel: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">対応時間枠（分）</label>
            <input
              type="number"
              value={emergencyContext.timeWindow}
              onChange={(e) => setEmergencyContext({
                ...emergencyContext,
                timeWindow: parseInt(e.target.value) || 60
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">影響度評価</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'patient_safety', label: '患者安全' },
            { key: 'operational_continuity', label: '事業継続' },
            { key: 'regulatory_impact', label: '規制影響' },
            { key: 'reputation_impact', label: '評判影響' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <select
                value={emergencyContext.potentialImpact[key as keyof typeof emergencyContext.potentialImpact]}
                onChange={(e) => setEmergencyContext({
                  ...emergencyContext,
                  potentialImpact: {
                    ...emergencyContext.potentialImpact,
                    [key]: e.target.value
                  }
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="NONE">なし</option>
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
                <option value="CRITICAL">致命的</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setActiveTab('templates')}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          テンプレートに戻る
        </button>
        <button
          onClick={executeCustomResponse}
          disabled={loading || !emergencyContext.description}
          className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 rounded-md font-medium"
        >
          {loading ? '実行中...' : '🚨 カスタム緊急対応実行'}
        </button>
      </div>
    </div>
  );

  /**
   * アクティブ緊急事態タブ
   */
  const renderActiveTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">進行中の緊急事態</h3>
        <button
          onClick={loadActiveEmergencies}
          className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          更新
        </button>
      </div>

      {activeEmergencies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>現在進行中の緊急事態はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeEmergencies.map((emergency, index) => (
            <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-red-800">緊急事態 #{index + 1}</h4>
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                  ACTIVE
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">チーム準備度:</span>
                  <span className="ml-2 font-medium">{emergency.team_readiness.overall_readiness}%</span>
                </div>
                <div>
                  <span className="text-gray-600">対応時間:</span>
                  <span className="ml-2 font-medium">{emergency.response_time.toFixed(1)}秒</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading && activeTab !== 'active') {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-red-700 font-medium">緊急チーム編成中...</p>
        <p className="text-sm text-gray-600 mt-1">メンバーへの緊急召集を実行しています</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-red-200">
      <div className="p-6 border-b border-red-200 bg-red-50">
        <h2 className="text-xl font-semibold text-red-900">🚨 危機対応メンバー選定</h2>
        <p className="text-sm text-red-700 mt-1">Level 7緊急権限による即時チーム編成</p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'templates', label: '緊急テンプレート', icon: '⚡' },
            { id: 'custom', label: 'カスタム対応', icon: '🛠️' },
            { id: 'active', label: '進行中', icon: '🔄' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'custom' && renderCustomTab()}
        {activeTab === 'active' && renderActiveTab()}
      </div>
    </div>
  );
};

export default CrisisManagementPanel;