import React from 'react';

interface BookingMode {
  id: 'instant' | 'assisted';
  name: string;
  description: string;
  icon: string;
  color: string;
  recommended?: boolean;
}

interface BookingModeSelectorProps {
  onModeSelect: (mode: BookingMode['id']) => void;
  onCancel: () => void;
}

const BookingModeSelector: React.FC<BookingModeSelectorProps> = ({
  onModeSelect,
  onCancel
}) => {
  const bookingModes: BookingMode[] = [
    {
      id: 'instant',
      name: '即時予約',
      description: '空いている時間からすぐに予約確定',
      icon: '⚡',
      color: 'green'
    },
    {
      id: 'assisted',
      name: 'おまかせ予約',
      description: 'あなたの希望をお聞きして人事部が最適な候補を提案',
      icon: '🎯',
      color: 'purple',
      recommended: true
    }
  ];

  const getColorClasses = (color: string, selected: boolean = false) => {
    switch (color) {
      case 'green':
        return selected
          ? 'bg-green-600 hover:bg-green-500 border-green-400'
          : 'bg-slate-700 hover:bg-slate-600 border-slate-600';
      case 'purple':
        return selected
          ? 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-purple-400'
          : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-purple-500';
      default:
        return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">面談予約方式を選択</h2>
        <p className="text-gray-400 text-sm">
          あなたに合った予約方式をお選びください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {bookingModes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`
              ${getColorClasses(mode.color)}
              rounded-lg p-6 cursor-pointer transition-all duration-200
              border-2 relative overflow-hidden
              transform hover:scale-105 hover:shadow-xl
            `}
          >
            {/* 推薦バッジ */}
            {mode.recommended && (
              <div className="absolute top-3 right-3">
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                  おすすめ
                </span>
              </div>
            )}

            <div className="text-center">
              <div className="text-5xl mb-4">
                {mode.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {mode.name}
              </h3>
              <p className="text-gray-100 text-sm mb-4 leading-relaxed">
                {mode.description}
              </p>

              {/* 特徴説明 */}
              <div className="mt-4 space-y-2">
                {mode.id === 'instant' && (
                  <>
                    <div className="flex items-center justify-center text-green-300 text-sm">
                      <span className="mr-1">✓</span>
                      すぐに完了
                    </div>
                    <div className="flex items-center justify-center text-green-300 text-sm">
                      <span className="mr-1">✓</span>
                      シンプルな手続き
                    </div>
                  </>
                )}

                {mode.id === 'assisted' && (
                  <>
                    <div className="flex items-center justify-center text-purple-200 text-sm">
                      <span className="mr-1">⭐</span>
                      より良いマッチング
                    </div>
                    <div className="flex items-center justify-center text-purple-200 text-sm">
                      <span className="mr-1">⭐</span>
                      詳細な希望を考慮
                    </div>
                    <div className="flex items-center justify-center text-purple-200 text-sm">
                      <span className="mr-1">⏱️</span>
                      調整時間：数分〜1時間
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 説明テキスト */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <span className="text-blue-400 mr-3 text-xl">💡</span>
          <div>
            <h4 className="text-white font-medium mb-2">どちらを選べばいい？</h4>
            <div className="text-gray-300 text-sm space-y-1">
              <p><strong>即時予約</strong>：今すぐ予約を確定したい場合</p>
              <p><strong>おまかせ予約</strong>：より良い候補を検討してほしい場合</p>
            </div>
          </div>
        </div>
      </div>

      {/* キャンセルボタン */}
      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default BookingModeSelector;