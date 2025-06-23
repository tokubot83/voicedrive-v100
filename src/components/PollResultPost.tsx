import React from 'react';
import { BarChart3, Users, TrendingUp, Calendar, Award } from 'lucide-react';
import { Post } from '../types';

interface PollResultPostProps {
  post: Post;
}

const PollResultPost: React.FC<PollResultPostProps> = ({ post }) => {
  const { pollResult, originalPollId, originalPostId } = post;

  if (!pollResult) {
    return null;
  }

  const { totalVotes, winnerOption, participationRate, results } = pollResult;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-700">📊 投票結果</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                自動生成
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {post.timestamp.toLocaleDateString('ja-JP')} {post.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">{post.title || post.content}</h3>

      {/* 勝者発表 */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <h4 className="text-lg font-bold text-yellow-800">🏆 最多得票</h4>
        </div>
        <div className="text-xl font-bold text-yellow-900 mb-1">
          {winnerOption?.text || '結果なし'}
        </div>
        <div className="text-sm text-yellow-700">
          {results[0]?.votes || 0}票 ({results[0]?.percentage.toFixed(1) || 0}%)
        </div>
      </div>

      {/* 詳細結果 */}
      <div className="mb-6">
        <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          詳細結果
        </h4>
        <div className="space-y-3">
          {results.map((item, index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
            const bgColor = index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-blue-50';
            const textColor = index === 0 ? 'text-yellow-800' : index === 1 ? 'text-gray-800' : index === 2 ? 'text-orange-800' : 'text-blue-800';
            
            return (
              <div key={index} className={`${bgColor} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className={`font-medium ${textColor}`}>
                      {item.option?.text || `選択肢 ${index + 1}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${textColor}`}>{item.votes}票</div>
                    <div className={`text-sm ${textColor}`}>{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="text-sm text-gray-600">総投票数</span>
          </div>
          <div className="text-xl font-bold text-emerald-800">{totalVotes}票</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <span className="text-sm text-gray-600">参加率</span>
          </div>
          <div className="text-xl font-bold text-blue-800">{participationRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-700" />
            <span className="text-sm text-gray-600">選択肢数</span>
          </div>
          <div className="text-xl font-bold text-purple-800">{results.length}個</div>
        </div>
      </div>

      {/* 投稿内容（分析コメント等） */}
      {post.content && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="prose max-w-none text-gray-700 text-sm">
            {post.content.split('\n').map((line, index) => {
              if (line.startsWith('##')) {
                return <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
              } else if (line.startsWith('###')) {
                return <h4 key={index} className="text-md font-bold text-gray-800 mt-3 mb-2">{line.replace('###', '').trim()}</h4>;
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-bold text-gray-800 mb-1">{line.replace(/\*\*/g, '')}</p>;
              } else if (line.startsWith('- ')) {
                return <p key={index} className="ml-4 mb-1">• {line.substring(2)}</p>;
              } else if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={index} className="text-gray-600 text-xs italic mb-1">{line.replace(/\*/g, '')}</p>;
              } else if (line.trim() === '---') {
                return <hr key={index} className="my-3 border-gray-300" />;
              } else if (line.trim()) {
                return <p key={index} className="mb-2">{line}</p>;
              }
              return <br key={index} />;
            })}
          </div>
        </div>
      )}

      {/* フッター */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>🤖 システム自動生成</span>
            {originalPostId && (
              <span>📎 元投稿ID: {originalPostId}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>💬 フリーボイス</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollResultPost;