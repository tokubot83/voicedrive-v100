import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ValueComparisonViewProps {
  beforeValue: any;
  afterValue: any;
  category?: string;
}

/**
 * 変更前後の値を見やすく比較表示するコンポーネント
 *
 * カテゴリーに応じて適切な表示形式を選択
 */
export const ValueComparisonView: React.FC<ValueComparisonViewProps> = ({
  beforeValue,
  afterValue,
  category,
}) => {
  // カテゴリーに応じた専用表示
  if (category === '投票スコープ設定') {
    return <VotingScopeComparison beforeValue={beforeValue} afterValue={afterValue} />;
  }

  if (category === '投票グループ管理') {
    return <VotingGroupComparison beforeValue={beforeValue} afterValue={afterValue} />;
  }

  if (category === '主承認者設定') {
    return <ApproverComparison beforeValue={beforeValue} afterValue={afterValue} />;
  }

  if (category === 'プロジェクト化閾値') {
    return <ThresholdComparison beforeValue={beforeValue} afterValue={afterValue} />;
  }

  // デフォルト: JSON表示
  return <JsonComparison beforeValue={beforeValue} afterValue={afterValue} />;
};

/**
 * 投票スコープ設定の比較表示
 */
const VotingScopeComparison: React.FC<{ beforeValue: any; afterValue: any }> = ({
  beforeValue,
  afterValue,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="text-xs text-slate-500 mb-2">変更前</div>
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-3">
          <div className="text-red-300 font-medium">
            {beforeValue?.pattern || 'パターンA'}
          </div>
        </div>
      </div>

      <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

      <div className="flex-1">
        <div className="text-xs text-slate-500 mb-2">変更後</div>
        <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
          <div className="text-green-300 font-medium">
            {afterValue?.pattern || 'パターンA'}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 投票グループ管理の比較表示
 */
const VotingGroupComparison: React.FC<{ beforeValue: any; afterValue: any }> = ({
  beforeValue,
  afterValue,
}) => {
  const beforeDepts = beforeValue?.departments || [];
  const afterDepts = afterValue?.departments || [];

  return (
    <div className="space-y-3">
      {/* グループ名 */}
      {(beforeValue?.groupName || afterValue?.groupName) && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">変更前</div>
            <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-3">
              <div className="text-red-300">
                {beforeValue?.groupName || '（なし）'}
              </div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">変更後</div>
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <div className="text-green-300">
                {afterValue?.groupName || '（なし）'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 所属部署 */}
      {(beforeDepts.length > 0 || afterDepts.length > 0) && (
        <div>
          <div className="text-xs text-slate-500 mb-2">所属部署</div>
          <div className="flex items-start space-x-4">
            <div className="flex-1 bg-red-900/10 border border-red-700/30 rounded-lg p-3">
              {beforeDepts.length > 0 ? (
                <div className="space-y-1">
                  {beforeDepts.map((dept: string, idx: number) => (
                    <div key={idx} className="text-red-300 text-sm">
                      • {dept}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic">なし</div>
              )}
            </div>

            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-2" />

            <div className="flex-1 bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              {afterDepts.length > 0 ? (
                <div className="space-y-1">
                  {afterDepts.map((dept: string, idx: number) => (
                    <div key={idx} className="text-green-300 text-sm">
                      • {dept}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic">なし</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 主承認者設定の比較表示
 */
const ApproverComparison: React.FC<{ beforeValue: any; afterValue: any }> = ({
  beforeValue,
  afterValue,
}) => {
  const periodLabels: Record<string, string> = {
    monthly: '月次',
    quarterly: '四半期',
    yearly: '年次',
  };

  return (
    <div className="space-y-3">
      {/* ローテーション期間 */}
      {(beforeValue?.period || afterValue?.period) && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">変更前</div>
            <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-3">
              <div className="text-red-300">
                {periodLabels[beforeValue?.period] || beforeValue?.period || '（なし）'}
              </div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">変更後</div>
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <div className="text-green-300">
                {periodLabels[afterValue?.period] || afterValue?.period || '（なし）'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 有効/無効 */}
      {(beforeValue?.enabled !== undefined || afterValue?.enabled !== undefined) && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">ローテーション状態</div>
            <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-3">
              <div className="text-red-300">
                {beforeValue?.enabled ? '有効' : '無効'}
              </div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2">ローテーション状態</div>
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <div className="text-green-300">
                {afterValue?.enabled ? '有効' : '無効'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * プロジェクト化閾値の比較表示
 */
const ThresholdComparison: React.FC<{ beforeValue: any; afterValue: any }> = ({
  beforeValue,
  afterValue,
}) => {
  const thresholdKeys = ['facility', 'department', 'corporate'];
  const labels: Record<string, string> = {
    facility: '施設',
    department: '部署',
    corporate: '法人',
  };

  return (
    <div className="space-y-3">
      {thresholdKeys.map((key) => {
        const beforeVal = beforeValue?.[key];
        const afterVal = afterValue?.[key];

        if (beforeVal === undefined && afterVal === undefined) return null;

        return (
          <div key={key} className="flex items-center space-x-4">
            <div className="w-24 text-sm text-slate-400">{labels[key]}:</div>
            <div className="flex-1">
              <div className="bg-red-900/10 border border-red-700/30 rounded-lg px-3 py-2 text-center">
                <span className="text-red-300 font-medium">
                  {beforeVal !== undefined ? `${beforeVal}点` : '（なし）'}
                </span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />

            <div className="flex-1">
              <div className="bg-green-900/10 border border-green-700/30 rounded-lg px-3 py-2 text-center">
                <span className="text-green-300 font-medium">
                  {afterVal !== undefined ? `${afterVal}点` : '（なし）'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * JSON形式の汎用比較表示
 */
const JsonComparison: React.FC<{ beforeValue: any; afterValue: any }> = ({
  beforeValue,
  afterValue,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-slate-500 mb-2">変更前</div>
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-4">
          {beforeValue ? (
            <pre className="text-xs text-red-300 overflow-x-auto">
              {JSON.stringify(beforeValue, null, 2)}
            </pre>
          ) : (
            <div className="text-xs text-slate-500 italic">設定なし</div>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 mb-2">変更後</div>
        <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-4">
          {afterValue ? (
            <pre className="text-xs text-green-300 overflow-x-auto">
              {JSON.stringify(afterValue, null, 2)}
            </pre>
          ) : (
            <div className="text-xs text-slate-500 italic">設定なし</div>
          )}
        </div>
      </div>
    </div>
  );
};
