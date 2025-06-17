import React from 'react';
import { BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

interface ConsensusDetailsProps {
  data: any;
}

const ConsensusDetails: React.FC<ConsensusDetailsProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* 投票内訳 */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <h4 className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          投票内訳
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">😍 強く賛成</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-300 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
              <span className="text-sm text-emerald-800">30%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">😊 賛成</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-300 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
              <span className="text-sm text-emerald-800">25%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">😐 中立</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-300 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
              <span className="text-sm text-emerald-800">20%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">😕 反対</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-300 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }} />
              </div>
              <span className="text-sm text-emerald-800">15%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">😠 強く反対</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-300 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
              <span className="text-sm text-emerald-800">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 部門別分析 */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <h4 className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          部門別参加状況
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">85%</div>
            <div className="text-xs text-gray-600">看護部</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">72%</div>
            <div className="text-xs text-gray-600">リハビリ科</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">68%</div>
            <div className="text-xs text-gray-600">事務部</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-800">91%</div>
            <div className="text-xs text-gray-600">経営企画</div>
          </div>
        </div>
      </div>

      {/* 時系列トレンド */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <h4 className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          合意形成の推移
        </h4>
        <div className="flex items-end justify-between h-20">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 bg-emerald-500/30 rounded-t" style={{ height: '40px' }} />
            <span className="text-xs text-gray-600">1日目</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 bg-emerald-500/50 rounded-t" style={{ height: '55px' }} />
            <span className="text-xs text-gray-600">2日目</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 bg-emerald-500/70 rounded-t" style={{ height: '65px' }} />
            <span className="text-xs text-gray-600">3日目</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 bg-emerald-500 rounded-t" style={{ height: '75px' }} />
            <span className="text-xs text-gray-600">今日</span>
          </div>
        </div>
      </div>

      {/* 投票期限 */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">投票期限まであと2日</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          2024年6月15日 23:59まで
        </p>
      </div>
    </div>
  );
};

export default ConsensusDetails;