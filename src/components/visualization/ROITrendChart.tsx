import React from 'react';

interface ROITrendChartProps {
  data?: any;
  timeframe?: string;
}

const ROITrendChart: React.FC<ROITrendChartProps> = ({ data, timeframe }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">ROIトレンド</h3>
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>ROIトレンドチャート</p>
          <p className="text-sm mt-2">期間: {timeframe || '四半期'}</p>
        </div>
      </div>
    </div>
  );
};

export default ROITrendChart;