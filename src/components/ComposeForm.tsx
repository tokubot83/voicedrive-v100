import { useState, useEffect } from 'react';
import { PostType, AnonymityLevel, Priority, ProposalType } from '../types';
import { StakeholderGroup } from '../types/visibility';
import { useSeasonalCapacity } from '../hooks/useSeasonalCapacity';
import SeasonalCapacityIndicator from './SeasonalCapacityIndicator';
import ProposalEchoCard from './ProposalEchoCard';
import { proposalTypes } from '../config/proposalTypes';
import FreespaceOptions, { FreespaceCategory } from './FreespaceOptions';

interface ComposeFormProps {
  selectedType: PostType;
  onCancel: () => void;
}

const ComposeForm = ({ selectedType, onCancel }: ComposeFormProps) => {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState('');
  const [proposalType, setProposalType] = useState<ProposalType>('operational'); // ①業務改善を初期値
  const [priority, setPriority] = useState<Priority>('medium');
  const [anonymity, setAnonymity] = useState<AnonymityLevel>('real_name');
  const [currentProposalCount] = useState(7); // TODO: Get from actual data
  
  // フリースペース用の状態
  const [freespaceCategory, setFreespaceCategory] = useState<FreespaceCategory>(FreespaceCategory.CASUAL_DISCUSSION);
  const [freespaceScope, setFreespaceScope] = useState<StakeholderGroup>(StakeholderGroup.SAME_DEPARTMENT);
  
  const { 
    currentSeason, 
    capacityInfo, 
    capacityStatus, 
    checkCanSubmit, 
    getSeasonalAdvice 
  } = useSeasonalCapacity(currentProposalCount);
  
  const [seasonalAdvice, setSeasonalAdvice] = useState(getSeasonalAdvice(selectedType));
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);

  useEffect(() => {
    setSeasonalAdvice(getSeasonalAdvice(selectedType));
    
    // Set default anonymity level based on post type
    if (selectedType === 'improvement') {
      setAnonymity('real_name');
    } else if (selectedType === 'community') {
      setAnonymity('department_only');
    } else if (selectedType === 'report') {
      setAnonymity('anonymous');
    }
  }, [selectedType, getSeasonalAdvice]);

  const handleCapacityWarning = (status: any) => {
    if (status.status === 'warning' || status.status === 'full') {
      setShowCapacityWarning(true);
    }
  };

  const typeConfigs = {
    improvement: {
      title: '💡 改善提案を入力してください',
      description: '具体的で実現可能な改善案を分かりやすく記述してください',
      placeholder: '例: 夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。',
    },
    community: {
      title: '💬 フリースペース投稿を入力してください',
      description: '情報共有・質問・相談など、自由に投稿してください',
      placeholder: '例: 新しい医療機器の使用方法について、皆さんの経験を教えてください。',
    },
    report: {
      title: '🚨 公益通報を入力してください',
      description: '安全・法令・倫理に関わる問題を報告してください',
      placeholder: '例: 医療安全に関わる問題を発見しました。適切な対応をお願いします。',
    },
  };

  const config = typeConfigs[selectedType];

  const handleSubmit = () => {
    if (!checkCanSubmit(currentProposalCount + 1)) {
      alert(`${capacityInfo.label}期の提案受付上限に達しています。次の季節をお待ちください。`);
      return;
    }
    
    console.log('Submitting:', { 
      content, 
      priority, 
      anonymity, 
      type: selectedType, 
      proposalType: selectedType === 'improvement' ? proposalType : undefined,
      season: currentSeason 
    });
    alert('投稿が完了しました！');
    onCancel();
  };

  const handleReviveProposal = (revivedProposal: any) => {
    setContent(revivedProposal.content);
    console.log('Revived proposal:', revivedProposal);
  };

  return (
    <div>
      <SeasonalCapacityIndicator 
        currentProposalCount={currentProposalCount}
        onCapacityWarning={handleCapacityWarning}
      />
      
      {selectedType !== 'report' && selectedType !== 'community' && (
        <ProposalEchoCard 
          season={currentSeason}
          proposalType={selectedType}
          onReviveProposal={handleReviveProposal}
        />
      )}
      
      <div className="bg-gradient-to-br from-white/6 to-white/2 border border-gray-800/30 rounded-3xl p-8 mt-5">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-8">
            {selectedType === 'improvement' ? (
              // 4 steps for improvement posts
              [1, 2, 3, 4].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300
                    ${step >= num 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(29,155,240,0.4)]' 
                      : 'bg-gray-700/30 text-gray-500'
                    }
                  `}>
                    {num}
                  </div>
                  <span className={`text-xs font-medium ${step >= num ? 'text-blue-400' : 'text-gray-500'}`}>
                    {num === 1 ? '提案タイプ' : num === 2 ? '内容入力' : num === 3 ? '詳細設定' : '確認'}
                  </span>
                </div>
              ))
            ) : (
              // 3 steps for other post types
              [1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300
                    ${step >= num 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(29,155,240,0.4)]' 
                      : 'bg-gray-700/30 text-gray-500'
                    }
                  `}>
                    {num}
                  </div>
                  <span className={`text-xs font-medium ${step >= num ? 'text-blue-400' : 'text-gray-500'}`}>
                    {num === 1 ? '内容入力' : num === 2 ? '詳細設定' : '確認'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      {step === 1 && selectedType === 'improvement' && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">💡 提案タイプを選択してください</h3>
            <p className="text-gray-400">あなたの改善提案に最も適したカテゴリを選んでください</p>
          </div>
          
          <div className="space-y-4">
            {proposalTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setProposalType(type.type)}
                className={`
                  w-full p-4 rounded-2xl border-2 transition-all duration-300
                  ${proposalType === type.type 
                    ? `${type.borderColor} bg-gradient-to-r from-white/10 to-white/5 transform scale-105` 
                    : 'border-gray-800/50 hover:border-gray-600 hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{type?.icon}</span>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-bold text-gray-100 mb-1">{type.label}</h4>
                    <p className="text-sm text-gray-400 mb-3">{type.description}</p>
                    
                    <div className="bg-black/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-2">重視される意見:</p>
                      <div className="flex flex-wrap gap-2">
                        {type.weights.slice(0, 2).map((weight) => (
                          <span key={weight.category} className="inline-flex items-center gap-1">
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs text-blue-400">
                              {weight.label} {Math.round(weight.weight * 100)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {proposalType === type.type && (
                    <span className="text-blue-500 text-2xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 border border-gray-800/50 text-gray-400 rounded-3xl hover:bg-white/15 hover:text-gray-200 transition-all duration-300"
            >
              キャンセル
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 max-w-xs px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(29,155,240,0.4)]"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {((step === 1 && selectedType !== 'improvement') || (step === 2 && selectedType === 'improvement')) && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">{config.title}</h3>
            <p className="text-gray-400">{config.description}</p>
          </div>
          
          {seasonalAdvice && seasonalAdvice.seasonal.length > 0 && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">
                🌟 {capacityInfo.label}期の推奨テーマ:
              </p>
              <div className="flex flex-wrap gap-2">
                {seasonalAdvice.seasonal.map((theme, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(29,155,240,0.4)]">
              田
            </div>
            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={config.placeholder}
                className="w-full h-32 bg-white/5 border-2 border-gray-800/50 rounded-2xl p-5 text-gray-100 text-lg resize-none outline-none transition-all duration-300 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(29,155,240,0.3)] focus:bg-white/8"
              />
              <span className="absolute bottom-4 right-5 text-sm text-gray-500">
                {content.length}/500
              </span>
            </div>
          </div>
          
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 border border-gray-800/50 text-gray-400 rounded-3xl hover:bg-white/15 hover:text-gray-200 transition-all duration-300"
            >
              キャンセル
            </button>
            <button
              onClick={() => setStep(selectedType === 'improvement' ? 3 : 2)}
              disabled={content.length < 10}
              className="flex-1 max-w-xs px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(29,155,240,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {((step === 2 && selectedType !== 'improvement') || (step === 3 && selectedType === 'improvement')) && (
        <div>
          {selectedType !== 'community' && (
            <div className="mb-8">
              <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-100 mb-2">重要度を選択</h4>
                <p className="text-gray-400 text-sm">提案の緊急性と影響度を考慮して選択してください</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'low', label: '低', icon: '🟢', color: 'border-green-500' },
                  { value: 'medium', label: '中', icon: '🟡', color: 'border-yellow-500' },
                  { value: 'high', label: '高', icon: '🟠', color: 'border-orange-500' },
                  { value: 'urgent', label: '緊急', icon: '🔴', color: 'border-red-500' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriority(option.value as Priority)}
                    className={`
                      flex flex-col items-center p-4 border-2 rounded-xl transition-all duration-300
                      ${priority === option.value 
                        ? `${option.color || 'border-gray-500'} bg-white/10 transform -translate-y-0.5` 
                        : 'border-gray-800/50 hover:border-gray-600'
                      }
                    `}
                  >
                    <span className="text-2xl mb-2">{option?.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-100 mb-2">匿名性レベル</h4>
              <p className="text-gray-400 text-sm">投稿時の表示名を選択してください</p>
            </div>
            <div className="space-y-3">
              {[
                { 
                  value: 'real_name', 
                  icon: '👤', 
                  label: '実名表示', 
                  desc: selectedType === 'improvement' ? '責任を持った提案' : '通常の情報共有',
                  disabled: selectedType === 'report' 
                },
                { 
                  value: 'facility_department', 
                  icon: '🏥', 
                  label: '施設名＋部署名', 
                  desc: '施設間での情報共有' 
                },
                { 
                  value: 'facility_anonymous', 
                  icon: '🏥', 
                  label: '施設名＋匿名', 
                  desc: '施設での匿名提案' 
                },
                { 
                  value: 'department_only', 
                  icon: '📍', 
                  label: '部署名のみ', 
                  desc: selectedType === 'improvement' ? 'センシティブな内容' : '部署間の調整' 
                },
                { 
                  value: 'anonymous', 
                  icon: '🔒', 
                  label: '完全匿名', 
                  desc: selectedType === 'report' ? '安全を最優先' : '率直な意見交換' 
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => !option.disabled && setAnonymity(option.value as AnonymityLevel)}
                  disabled={option.disabled}
                  className={`
                    w-full flex items-center p-4 border-2 rounded-xl transition-all duration-300
                    ${option.disabled 
                      ? 'opacity-50 cursor-not-allowed bg-red-900/10 border-red-800/50' 
                      : anonymity === option.value 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-800/50 hover:border-blue-500/50 hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-2xl mr-4">{option?.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-400">
                      {option.disabled ? '安全上利用不可' : option.desc}
                    </div>
                  </div>
                  {anonymity === option.value && !option.disabled && (
                    <span className="text-blue-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={() => setStep(selectedType === 'improvement' ? 2 : 1)}
              className="px-6 py-3 bg-white/10 border border-gray-800/50 text-gray-400 rounded-3xl hover:bg-white/15 hover:text-gray-200 transition-all duration-300"
            >
              戻る
            </button>
            <button
              onClick={() => setStep(selectedType === 'improvement' ? 4 : 3)}
              className="flex-1 max-w-xs px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(29,155,240,0.4)]"
            >
              確認へ
            </button>
          </div>
        </div>
      )}

      {((step === 3 && selectedType !== 'improvement') || (step === 4 && selectedType === 'improvement')) && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">投稿内容の確認</h3>
            <p className="text-gray-400">以下の内容で投稿します</p>
          </div>

          <div className="bg-white/5 border border-gray-800/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                {selectedType === 'improvement' ? '💡 改善提案' : selectedType === 'community' ? '💬 フリースペース' : '🚨 公益通報'}
              </span>
              {selectedType === 'improvement' && (
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${proposalTypes.find(t => t.type === proposalType)?.borderColor.replace('border-', 'bg-').replace('500', '500/20')} ${proposalTypes.find(t => t.type === proposalType)?.borderColor.replace('border-', 'text-')}`}>
                  {proposalTypes.find(t => t.type === proposalType)?.icon || '📝'} {proposalTypes.find(t => t.type === proposalType)?.label}
                </span>
              )}
              {selectedType !== 'community' && (
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                  priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {priority === 'urgent' ? '緊急' : priority === 'high' ? '高優先度' : priority === 'medium' ? '中優先度' : '低優先度'}
                </span>
              )}
            </div>
            
            <div className="flex gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                田
              </div>
              <div>
                <div className="font-bold text-gray-100">
                  {anonymity === 'real_name' ? '田中職員' : anonymity === 'department_only' ? '看護部職員' : '匿名職員'}
                </div>
                <div className="text-sm text-gray-400">看護師</div>
              </div>
            </div>
            
            <div className="text-gray-100 leading-relaxed">{content}</div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep(selectedType === 'improvement' ? 3 : 2)}
              className="px-6 py-3 bg-white/10 border border-gray-800/50 text-gray-400 rounded-3xl hover:bg-white/15 hover:text-gray-200 transition-all duration-300"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(29,155,240,0.5)]"
            >
              <span>投稿する</span>
              <span className="text-xl">📤</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ComposeForm;