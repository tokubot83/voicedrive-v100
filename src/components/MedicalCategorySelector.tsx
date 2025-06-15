import React, { useState } from 'react';
import { MEDICAL_POST_CATEGORIES, MedicalCategoryInfo } from '../types/medicalCategories';
import { AlertTriangle, Shield, FileText, Building2, Clock } from 'lucide-react';

interface MedicalCategorySelectorProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  facilityType?: string;
  showRegulationWarning?: boolean;
}

export const MedicalCategorySelector: React.FC<MedicalCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  facilityType = 'acute_care_hospital',
  showRegulationWarning = true
}) => {
  const [expandedTab, setExpandedTab] = useState<string | null>(null);

  // カテゴリをタブごとにグループ化
  const categoryGroups = {
    strategic: {
      name: '医療・介護戦略',
      icon: <Building2 className="w-5 h-5" />,
      categories: ['new_medical_service', 'clinical_pathway', 'medical_collaboration', 'patient_care_innovation', 
                  'care_service_expansion', 'community_care', 'dementia_care', 'rehabilitation_program'],
      color: 'blue'
    },
    quality: {
      name: '医療安全・品質',
      icon: <Shield className="w-5 h-5" />,
      categories: ['medical_safety', 'infection_control', 'quality_improvement', 'clinical_research'],
      color: 'red'
    },
    compliance: {
      name: '規制・コンプライアンス',
      icon: <FileText className="w-5 h-5" />,
      categories: ['regulatory_compliance', 'medical_ethics', 'insurance_billing', 'facility_standards'],
      color: 'purple'
    }
  };

  const getDeadlineText = (category: MedicalCategoryInfo): string => {
    const deadlineMap: Record<string, string> = {
      new_medical_service: '60日〜14日',
      clinical_pathway: '45日〜7日',
      medical_collaboration: '30日〜7日',
      care_service_expansion: '45日〜10日',
      medical_safety: '14日〜1日',
      infection_control: '7日〜6時間',
      regulatory_compliance: '60日〜14日',
      insurance_billing: '30日〜3日'
    };
    return deadlineMap[category.id] || '30日〜7日';
  };

  const getImpactBadges = (category: MedicalCategoryInfo) => {
    const badges = [];
    
    if (category.regulatoryImpact === 'high') {
      badges.push(
        <span key="reg" className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
          法規制影響：高
        </span>
      );
    }
    
    if (category.patientSafetyImpact === 'direct') {
      badges.push(
        <span key="safety" className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          患者安全：直接影響
        </span>
      );
    }
    
    return badges;
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-blue-800 mb-1">
              医療・介護系カテゴリの特徴
            </div>
            <ul className="text-blue-700 space-y-1">
              <li>• 患者安全と法規制を最優先に期限設定</li>
              <li>• 行政手続きが必要な案件は最低14日以上</li>
              <li>• 感染管理など緊急性の高い案件は6時間〜対応</li>
              <li>• 施設種別により期限が自動調整されます</li>
            </ul>
          </div>
        </div>
      </div>

      {Object.entries(categoryGroups).map(([groupKey, group]) => (
        <div key={groupKey} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedTab(expandedTab === groupKey ? null : groupKey)}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              (group.color === 'red' ? 'bg-red-50' : 
              group.color === 'purple' ? 'bg-purple-50' : 'bg-blue-50')
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${
                (group.color === 'red' ? 'text-red-600' : 
                group.color === 'purple' ? 'text-purple-600' : 'text-blue-600')
              }`}>
                {group?.icon}
              </div>
              <span className="font-medium">{group.name}</span>
              <span className="text-sm text-gray-500">
                ({group.categories.length}カテゴリ)
              </span>
            </div>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedTab === groupKey ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedTab === groupKey && (
            <div className="border-t divide-y">
              {group.categories.map(categoryId => {
                const category = MEDICAL_POST_CATEGORIES[categoryId];
                if (!category) return null;
                
                const isSelected = selectedCategory === categoryId;

                return (
                  <button
                    key={categoryId}
                    onClick={() => onCategorySelect(categoryId)}
                    className={`w-full px-4 py-4 hover:bg-gray-50 transition-colors text-left ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{category?.icon}</span>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {getImpactBadges(category)}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>投票期限: {getDeadlineText(category)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {showRegulationWarning && selectedCategory && MEDICAL_POST_CATEGORIES[selectedCategory]?.regulatoryImpact === 'high' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-purple-800 mb-1">
                法規制への影響が大きいカテゴリです
              </div>
              <div className="text-purple-700">
                このカテゴリの提案は、医療法、介護保険法、その他関連法規への準拠が必要です。
                必要に応じて法務部門や外部専門家への相談を検討してください。
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        <div className="font-medium mb-1">施設種別による期限調整</div>
        <div>現在の施設: {facilityType === 'acute_care_hospital' ? '急性期病院' : '一般病院'}</div>
        <div>期限調整係数: {facilityType === 'acute_care_hospital' ? '0.8倍（迅速化）' : '1.0倍（標準）'}</div>
      </div>
    </div>
  );
};