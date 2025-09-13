import React, { useState } from 'react';
import { StaffFriendlyRecommendation } from '../../services/AssistedBookingService';

interface StaffRecommendationDisplayProps {
  recommendations: StaffFriendlyRecommendation[];
  onSelectRecommendation: (recommendationId: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const StaffRecommendationDisplay: React.FC<StaffRecommendationDisplayProps> = ({
  recommendations,
  onSelectRecommendation,
  onCancel,
  loading = false
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.replace(/:\d{2}$/, ''); // 秒を削除
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-white mb-2">面談候補を準備中...</h3>
        <p className="text-gray-400">最適な担当者を検討しています</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <span className="text-6xl mb-4 block">😅</span>
        <h3 className="text-xl font-semibold text-white mb-2">候補が見つかりませんでした</h3>
        <p className="text-gray-400 mb-6">
          ご希望の条件に合う候補の調整が困難でした。<br/>
          以下の方法をお試しください。
        </p>
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            即時予約で空いている時間から選択
          </button>
          <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
            条件を変更して再申請
          </button>
          <button className="w-full border border-gray-600 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            人事部に直接相談 (内線: 1234)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 max-w-6xl w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          面談候補をご用意しました！
        </h2>
        <p className="text-gray-400 text-sm">
          {recommendations.length}つの候補から最適なものをお選びください
        </p>
      </div>

      {/* 候補表示切り替え */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowComparison(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showComparison
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          📋 候補一覧
        </button>
        {recommendations.length > 1 && (
          <button
            onClick={() => setShowComparison(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showComparison
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            📊 比較表示
          </button>
        )}
      </div>

      {/* 候補一覧表示 */}
      {!showComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className={`
                bg-slate-700 rounded-lg p-6 cursor-pointer transition-all duration-200
                border-2 hover:shadow-lg transform hover:scale-105
                ${selectedId === recommendation.id
                  ? 'border-blue-500 bg-slate-600 shadow-blue-500/20 shadow-lg'
                  : 'border-slate-600 hover:border-slate-500'
                }
              `}
              onClick={() => setSelectedId(recommendation.id)}
            >
              {/* 候補番号 */}
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                  候補 {index + 1}
                </span>
                {selectedId === recommendation.id && (
                  <span className="text-blue-400 text-xl">✅</span>
                )}
              </div>

              {/* 担当者情報 */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {recommendation.candidate.name}
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  {recommendation.candidate.title} • {recommendation.candidate.department}
                </p>
                {recommendation.candidate.experience && (
                  <p className="text-gray-400 text-xs">
                    経験: {recommendation.candidate.experience}
                  </p>
                )}
              </div>

              {/* スケジュール情報 */}
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(recommendation.candidate.schedule.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-2">🕐</span>
                    <span>
                      {formatTime(recommendation.candidate.schedule.time)}
                      ({recommendation.candidate.schedule.duration}分)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-2">📍</span>
                    <span>{recommendation.candidate.schedule.location}</span>
                    {recommendation.candidate.schedule.format && (
                      <span className="ml-2 text-xs bg-slate-600 px-2 py-1 rounded">
                        {recommendation.candidate.schedule.format === 'face_to_face' ? '対面' : 'オンライン'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 推薦理由 */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  おすすめポイント
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  {recommendation.whyRecommended.summary}
                </p>
                <div className="space-y-1">
                  {recommendation.whyRecommended.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-center text-xs text-gray-400">
                      <span className="mr-2 text-green-400">✓</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 代替案 */}
              {recommendation.alternatives && (
                <div className="text-xs text-gray-400 bg-slate-800 rounded p-3">
                  <div className="font-medium mb-1">📌 他の選択肢:</div>
                  {recommendation.alternatives.timeOptions && (
                    <div>時間: {recommendation.alternatives.timeOptions.join(', ')}</div>
                  )}
                  {recommendation.alternatives.notes && (
                    <div>{recommendation.alternatives.notes}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 比較表示 */}
      {showComparison && recommendations.length > 1 && (
        <div className="bg-slate-700 rounded-lg p-6 mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 text-gray-300">項目</th>
                {recommendations.map((rec, index) => (
                  <th key={rec.id} className="text-center py-3 text-white">
                    候補 {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-slate-600">
                <td className="py-3 font-medium">担当者</td>
                {recommendations.map(rec => (
                  <td key={rec.id} className="py-3 text-center">
                    <div>{rec.candidate.name}</div>
                    <div className="text-xs text-gray-400">{rec.candidate.title}</div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-600">
                <td className="py-3 font-medium">日時</td>
                {recommendations.map(rec => (
                  <td key={rec.id} className="py-3 text-center">
                    <div>{formatDate(rec.candidate.schedule.date)}</div>
                    <div className="text-xs">{formatTime(rec.candidate.schedule.time)}</div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-600">
                <td className="py-3 font-medium">場所</td>
                {recommendations.map(rec => (
                  <td key={rec.id} className="py-3 text-center text-xs">
                    {rec.candidate.schedule.location}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 font-medium">主なポイント</td>
                {recommendations.map(rec => (
                  <td key={rec.id} className="py-3 text-center text-xs">
                    {rec.whyRecommended.points.slice(0, 2).join('、')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 選択・確定ボタン */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          戻る
        </button>

        <div className="flex gap-3">
          {selectedId ? (
            <button
              onClick={() => onSelectRecommendation(selectedId)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              この候補で予約確定
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-600 text-gray-400 px-8 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              候補を選択してください
            </button>
          )}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 bg-slate-700 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-yellow-400 mr-3 text-lg">💡</span>
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">確定前のご確認</p>
            <ul className="space-y-1 text-xs">
              <li>• 予約確定後は担当者に連絡が届きます</li>
              <li>• 変更・キャンセルは予約確定後も可能です</li>
              <li>• 不明点があれば人事部（内線:1234）までお気軽に</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRecommendationDisplay;