import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SimpleInterviewFlowState {
  currentStep: number;
  classification?: string;
  type?: string;
  category?: string;
  timing?: string;
  timeSlot?: string;
  weekdays?: string[];
  interviewer?: string;
  location?: string;
  notes?: string;
}

interface SimpleInterviewFlowProps {
  onComplete?: (state: SimpleInterviewFlowState) => void;
  employeeId?: string;
}

const SimpleInterviewFlow: React.FC<SimpleInterviewFlowProps> = ({
  onComplete,
  employeeId
}) => {
  const [flowState, setFlowState] = useState<SimpleInterviewFlowState>({
    currentStep: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ステップタイトルを取得
  const getStepTitle = () => {
    switch (flowState.currentStep) {
      case 1: return '面談種類';
      case 2:
        if (flowState.classification === 'regular') return '定期面談';
        if (flowState.classification === 'support') return 'サポート面談';
        if (flowState.classification === 'special') return '特別面談';
        return '面談種別';
      case 3: return 'カテゴリ';
      case 4: return '希望時期';
      case 5: return '時間帯';
      case 6: return '希望曜日';
      case 7: return '担当者';
      case 8: return '場所';
      case 9: return 'その他';
      case 10: return '確認';
      default: return '';
    }
  };

  const updateState = (updates: Partial<SimpleInterviewFlowState>) => {
    setFlowState(prevState => ({ ...prevState, ...updates }));
  };

  const handleNext = () => {
    setFlowState(prevState => {
      if (prevState.currentStep < 10) {
        return { ...prevState, currentStep: prevState.currentStep + 1 };
      }
      return prevState;
    });
  };

  const handleBack = () => {
    setFlowState(prevState => {
      if (prevState.currentStep > 1) {
        return { ...prevState, currentStep: prevState.currentStep - 1 };
      }
      return prevState;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 仮実装
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onComplete) {
        onComplete(flowState);
      }
    } catch (error) {
      console.error('申込エラー:', error);
      alert('申込処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ステップ1: 面談分類選択
  const Step1Classification = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">どの面談をご希望ですか？</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        <button
          onClick={() => {
            updateState({ classification: 'regular' });
            handleNext();
          }}
          className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">📅</div>
          <div className="text-lg font-semibold text-gray-800">定期面談</div>
          <div className="text-gray-600 text-xs mt-1">年次・月次の定期面談</div>
        </button>

        <button
          onClick={() => {
            updateState({ classification: 'support' });
            handleNext();
          }}
          className="w-full p-5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🤝</div>
          <div className="text-lg font-semibold text-gray-800">サポート面談</div>
          <div className="text-gray-600 text-xs mt-1">相談・支援が必要な面談</div>
        </button>

        <button
          onClick={() => {
            updateState({ classification: 'special' });
            handleNext();
          }}
          className="w-full p-5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">⚡</div>
          <div className="text-lg font-semibold text-gray-800">特別面談</div>
          <div className="text-gray-600 text-xs mt-1">復職・退職・インシデント後</div>
        </button>
      </div>
    </div>
  );

  // ステップ2: 面談種別選択
  const Step2Type = () => {
    if (flowState.classification === 'regular') {
      return (
        <div className="flex flex-col h-full">
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm">どのタイプの面談ですか？</p>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <button
              onClick={() => {
                updateState({ type: 'newcomer' });
                handleNext();
              }}
              className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">👤</div>
              <div className="text-lg font-semibold text-gray-800">新人職員面談</div>
              <div className="text-gray-600 text-xs mt-1">入職1年目まで</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'general' });
                handleNext();
              }}
              className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">👥</div>
              <div className="text-lg font-semibold text-gray-800">一般職員面談</div>
              <div className="text-gray-600 text-xs mt-1">2年目以降</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'manager' });
                handleNext();
              }}
              className="w-full p-5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">👔</div>
              <div className="text-lg font-semibold text-gray-800">管理職面談</div>
              <div className="text-gray-600 text-xs mt-1">主任以上</div>
            </button>
          </div>
        </div>
      );
    }

    if (flowState.classification === 'support') {
      return (
        <div className="flex flex-col h-full">
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm">何について相談しますか？</p>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <button
              onClick={() => {
                updateState({ type: 'career' });
                handleNext();
              }}
              className="w-full p-5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">🎯</div>
              <div className="text-lg font-semibold text-gray-800">キャリア系面談</div>
              <div className="text-gray-600 text-xs mt-1">キャリアパス・スキル開発・昇進昇格</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'workplace' });
                handleNext();
              }}
              className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">🏢</div>
              <div className="text-lg font-semibold text-gray-800">職場環境系面談</div>
              <div className="text-gray-600 text-xs mt-1">職場環境・人間関係・業務負荷など</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'consultation' });
                handleNext();
              }}
              className="w-full p-5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">💼</div>
              <div className="text-lg font-semibold text-gray-800">個別相談面談</div>
              <div className="text-gray-600 text-xs mt-1">パフォーマンス・研修・コンプライアンス</div>
            </button>
          </div>
        </div>
      );
    }

    if (flowState.classification === 'special') {
      return (
        <div className="flex flex-col h-full">
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm">どの理由で面談を希望しますか？</p>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <button
              onClick={() => {
                updateState({ type: 'return' });
                handleNext();
              }}
              className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">🔄</div>
              <div className="text-lg font-semibold text-gray-800">復職面談</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'resignation' });
                handleNext();
              }}
              className="w-full p-5 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">🚪</div>
              <div className="text-lg font-semibold text-gray-800">退職面談</div>
            </button>

            <button
              onClick={() => {
                updateState({ type: 'incident' });
                handleNext();
              }}
              className="w-full p-5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl transition-all"
            >
              <div className="text-3xl mb-1">⚠️</div>
              <div className="text-lg font-semibold text-gray-800">インシデント後面談</div>
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ステップ3: カテゴリ選択（サポート面談のみ）
  const Step3Category = () => {
    // サポート面談以外はステップ4にスキップ（useEffectで処理）
    React.useEffect(() => {
      if (flowState.classification !== 'support' && flowState.currentStep === 3) {
        updateState({ currentStep: 4 });
      }
    }, [flowState.classification, flowState.currentStep]);

    if (flowState.classification !== 'support') {
      return null;
    }

    let categories: Array<{id: string, label: string, description: string, icon: string}> = [];

    if (flowState.type === 'career') {
      categories = [
        { id: 'career_path', label: 'キャリアパス', description: '将来の目標設定', icon: '🎯' },
        { id: 'skill_development', label: 'スキル開発', description: '研修・資格取得', icon: '📚' },
        { id: 'promotion', label: '昇進・昇格', description: '昇進に関する相談', icon: '⬆️' }
      ];
    } else if (flowState.type === 'workplace') {
      categories = [
        { id: 'workplace_environment', label: '職場環境', description: '設備・制度について', icon: '🏢' },
        { id: 'interpersonal', label: '人間関係', description: 'チームワークの問題', icon: '👥' },
        { id: 'workload', label: '業務負荷・ワークライフバランス', description: '働き方の調整', icon: '⚖️' },
        { id: 'health_safety', label: '健康・安全', description: '職場の安全性', icon: '🛡️' },
        { id: 'compensation', label: '給与・待遇', description: '処遇に関する相談', icon: '💰' },
        { id: 'transfer', label: '異動・転勤', description: '勤務地の変更', icon: '🚛' }
      ];
    } else if (flowState.type === 'consultation') {
      categories = [
        { id: 'performance', label: 'パフォーマンス', description: '業務改善について', icon: '📈' },
        { id: 'training', label: '研修・教育', description: '教育プログラム', icon: '🎓' },
        { id: 'compliance', label: 'コンプライアンス', description: '規則・法令遵守', icon: '📋' },
        { id: 'other', label: 'その他の相談', description: '上記以外の相談', icon: '💭' }
      ];
    }

    return (
      <div className="flex flex-col h-full">
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">具体的な相談内容を選択してください</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  updateState({ category: category.id });
                  handleNext();
                }}
                className="w-full p-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-400 rounded-xl transition-all text-left"
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-4">{category.icon}</div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{category.label}</div>
                    <div className="text-gray-600 text-sm">{category.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ステップ4: 希望時期選択
  const Step4Timing = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">いつ頃を希望しますか？</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        <button
          onClick={() => {
            updateState({ timing: 'urgent' });
            handleNext();
          }}
          className="w-full p-5 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🚨</div>
          <div className="text-lg font-semibold text-gray-800">緊急</div>
          <div className="text-gray-600 text-xs mt-1">1-2日以内</div>
        </button>

        <button
          onClick={() => {
            updateState({ timing: 'this_week' });
            handleNext();
          }}
          className="w-full p-5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">📅</div>
          <div className="text-lg font-semibold text-gray-800">今週中</div>
        </button>

        <button
          onClick={() => {
            updateState({ timing: 'next_week' });
            handleNext();
          }}
          className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
        >
          <div className="text-4xl mb-2">📆</div>
          <div className="text-xl font-semibold text-gray-800">来週</div>
        </button>

        <button
          onClick={() => {
            updateState({ timing: 'this_month' });
            handleNext();
          }}
          className="w-full p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
        >
          <div className="text-4xl mb-2">🗓️</div>
          <div className="text-xl font-semibold text-gray-800">今月中</div>
        </button>
      </div>
    </div>
  );

  // ステップ5: 時間帯選択
  const Step5TimeSlot = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">ご希望の時間帯を選択してください</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        <button
          onClick={() => {
            updateState({ timeSlot: 'morning' });
            handleNext();
          }}
          className="w-full p-5 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🌅</div>
          <div className="text-lg font-semibold text-gray-800">午前</div>
          <div className="text-gray-600 text-xs mt-1">9:00-12:00</div>
        </button>

        <button
          onClick={() => {
            updateState({ timeSlot: 'afternoon' });
            handleNext();
          }}
          className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">☀️</div>
          <div className="text-lg font-semibold text-gray-800">午後</div>
          <div className="text-gray-600 text-xs mt-1">13:00-17:00</div>
        </button>

        <button
          onClick={() => {
            updateState({ timeSlot: 'evening' });
            handleNext();
          }}
          className="w-full p-5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🌆</div>
          <div className="text-lg font-semibold text-gray-800">夕方</div>
          <div className="text-gray-600 text-xs mt-1">17:30-19:00</div>
        </button>

        <button
          onClick={() => {
            updateState({ timeSlot: 'anytime' });
            handleNext();
          }}
          className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🕐</div>
          <div className="text-lg font-semibold text-gray-800">いつでも可</div>
        </button>
      </div>
    </div>
  );

  // ステップ6: 曜日選択
  const Step6Weekdays = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">ご都合の良い曜日を選択してください</p>
        <p className="text-xs text-gray-500 mt-1">複数選択可能・選択なしで全曜日OK</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        {[
          { id: 'mon', label: '月曜日', icon: '1️⃣' },
          { id: 'tue', label: '火曜日', icon: '2️⃣' },
          { id: 'wed', label: '水曜日', icon: '3️⃣' },
          { id: 'thu', label: '木曜日', icon: '4️⃣' },
          { id: 'fri', label: '金曜日', icon: '5️⃣' }
        ].map((day) => {
          const isSelected = flowState.weekdays?.includes(day.id) || false;
          return (
            <button
              key={day.id}
              onClick={() => {
                const currentWeekdays = flowState.weekdays || [];
                const newWeekdays = isSelected
                  ? currentWeekdays.filter(d => d !== day.id)
                  : [...currentWeekdays, day.id];
                updateState({ weekdays: newWeekdays });
              }}
              className={`w-full p-4 border-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-indigo-100 border-indigo-400 text-indigo-800'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">{day.icon}</div>
                  <div className="text-lg font-semibold">{day.label}</div>
                </div>
                {isSelected && <div className="text-indigo-600">✓</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <button
          onClick={handleNext}
          className="w-full p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
        >
          <span className="text-lg font-semibold">次へ進む</span>
        </button>
      </div>
    </div>
  );

  // ステップ7: 担当者希望
  const Step7Interviewer = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">面談担当者のご希望はありますか？</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        <button
          onClick={() => {
            updateState({ interviewer: 'anyone' });
            handleNext();
          }}
          className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">👥</div>
          <div className="text-lg font-semibold text-gray-800">誰でも良い</div>
          <div className="text-gray-600 text-xs mt-1">人事部にお任せ</div>
        </button>

        <button
          onClick={() => {
            updateState({ interviewer: 'previous' });
            handleNext();
          }}
          className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🔄</div>
          <div className="text-lg font-semibold text-gray-800">前回と同じ担当者</div>
          <div className="text-gray-600 text-xs mt-1">継続性を重視</div>
        </button>

        <button
          onClick={() => {
            updateState({ interviewer: 'specific' });
            handleNext();
          }}
          className="w-full p-5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🎯</div>
          <div className="text-lg font-semibold text-gray-800">特定の担当者</div>
          <div className="text-gray-600 text-xs mt-1">指名したい担当者がいる</div>
        </button>
      </div>
    </div>
  );

  // ステップ8: 面談場所
  const Step8Location = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">どちらで面談を行いますか？</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 justify-center">
        <button
          onClick={() => {
            updateState({ location: 'inside' });
            handleNext();
          }}
          className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🏥</div>
          <div className="text-lg font-semibold text-gray-800">所属施設内</div>
          <div className="text-gray-600 text-xs mt-1">勤務先の施設内で実施</div>
        </button>

        <button
          onClick={() => {
            updateState({ location: 'outside' });
            handleNext();
          }}
          className="w-full p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
        >
          <div className="text-3xl mb-1">🏢</div>
          <div className="text-lg font-semibold text-gray-800">所属施設外</div>
          <div className="text-gray-600 text-xs mt-1">人事部オフィス等で実施</div>
        </button>
      </div>
    </div>
  );

  // ステップ9: その他要望入力
  const Step9Notes = () => {
    const [notes, setNotes] = useState(flowState.notes || '');

    return (
      <div className="flex flex-col h-full">
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">面談に関する特別な要望があれば入力してください</p>
          <p className="text-xs text-gray-500 mt-1">入力は任意です</p>
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例：夜勤明けの日は避けてほしい、休憩時間中は避けたい、プライバシーが保てる場所で..."
            className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none text-gray-800"
            style={{ fontSize: '16px' }} // iOS zoom prevention
          />

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                updateState({ notes });
                handleNext();
              }}
              className="w-full p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
            >
              <span className="text-lg font-semibold">次へ進む</span>
            </button>

            <button
              onClick={() => {
                updateState({ notes: '' });
                handleNext();
              }}
              className="w-full p-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              <span>特に要望なし</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ステップ10: 確認画面
  const Step10Confirm = () => {
    const getClassificationLabel = () => {
      switch (flowState.classification) {
        case 'regular': return '定期面談';
        case 'support': return 'サポート面談';
        case 'special': return '特別面談';
        default: return '';
      }
    };

    const getTypeLabel = () => {
      const typeMap: Record<string, string> = {
        newcomer: '新人職員面談',
        general: '一般職員面談',
        manager: '管理職面談',
        career: 'キャリア系面談',
        workplace: '職場環境系面談',
        consultation: '個別相談面談',
        return: '復職面談',
        resignation: '退職面談',
        incident: 'インシデント後面談'
      };
      return typeMap[flowState.type || ''] || '';
    };

    const getCategoryLabel = () => {
      const categoryMap: Record<string, string> = {
        career_path: 'キャリアパス',
        skill_development: 'スキル開発',
        promotion: '昇進・昇格',
        workplace_environment: '職場環境',
        interpersonal: '人間関係',
        workload: '業務負荷・ワークライフバランス',
        health_safety: '健康・安全',
        compensation: '給与・待遇',
        transfer: '異動・転勤',
        performance: 'パフォーマンス',
        training: '研修・教育',
        compliance: 'コンプライアンス',
        other: 'その他の相談'
      };
      return categoryMap[flowState.category || ''] || '';
    };

    const getTimingLabel = () => {
      const timingMap: Record<string, string> = {
        urgent: '緊急（1-2日以内）',
        this_week: '今週中',
        next_week: '来週',
        this_month: '今月中'
      };
      return timingMap[flowState.timing || ''] || '';
    };

    const getTimeSlotLabel = () => {
      const timeSlotMap: Record<string, string> = {
        morning: '午前（9:00-12:00）',
        afternoon: '午後（13:00-17:00）',
        evening: '夕方（17:30-19:00）',
        anytime: 'いつでも可'
      };
      return timeSlotMap[flowState.timeSlot || ''] || '';
    };

    const getWeekdaysLabel = () => {
      if (!flowState.weekdays || flowState.weekdays.length === 0) {
        return '全曜日OK';
      }
      const dayMap: Record<string, string> = {
        mon: '月', tue: '火', wed: '水', thu: '木', fri: '金'
      };
      return flowState.weekdays.map(day => dayMap[day]).join('、') + '曜日';
    };

    const getInterviewerLabel = () => {
      const interviewerMap: Record<string, string> = {
        anyone: '誰でも良い',
        previous: '前回と同じ担当者',
        specific: '特定の担当者'
      };
      return interviewerMap[flowState.interviewer || ''] || '';
    };

    const getLocationLabel = () => {
      const locationMap: Record<string, string> = {
        inside: '所属施設内',
        outside: '所属施設外'
      };
      return locationMap[flowState.location || ''] || '';
    };

    return (
      <div className="flex flex-col h-full">
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">以下の内容で面談を申し込みます</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">面談種別</div>
              <div className="text-lg font-semibold text-gray-800">
                {getClassificationLabel()} - {getTypeLabel()}
              </div>
              {flowState.category && (
                <div className="text-gray-600 mt-1">{getCategoryLabel()}</div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">希望条件</div>
              <div className="space-y-2 text-gray-800">
                <div>📅 時期: {getTimingLabel()}</div>
                <div>🕐 時間帯: {getTimeSlotLabel()}</div>
                <div>📆 曜日: {getWeekdaysLabel()}</div>
                <div>👤 担当者: {getInterviewerLabel()}</div>
                <div>📍 場所: {getLocationLabel()}</div>
              </div>
            </div>

            {flowState.notes && (
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-500 mb-2">その他の要望</div>
                <div className="text-gray-800">{flowState.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (flowState.currentStep) {
      case 1:
        return <Step1Classification />;
      case 2:
        return <Step2Type />;
      case 3:
        return <Step3Category />;
      case 4:
        return <Step4Timing />;
      case 5:
        return <Step5TimeSlot />;
      case 6:
        return <Step6Weekdays />;
      case 7:
        return <Step7Interviewer />;
      case 8:
        return <Step8Location />;
      case 9:
        return <Step9Notes />;
      case 10:
        return <Step10Confirm />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 統合ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* ナビゲーションバー */}
        <div className="flex items-center justify-between p-3">
          {/* 戻るボタン */}
          {flowState.currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="戻る"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* タイトル */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-semibold text-gray-800">
              {getStepTitle()}
            </h1>
            <p className="text-xs text-gray-500">ステップ {flowState.currentStep} / 10</p>
          </div>

          {/* 確定ボタン（ステップ10のみ） */}
          {flowState.currentStep === 10 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '送信中' : '確定'}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* プログレスバー */}
        <div className="px-3 pb-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(flowState.currentStep / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default SimpleInterviewFlow;