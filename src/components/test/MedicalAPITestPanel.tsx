import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Users, Key } from 'lucide-react';
import { medicalSystemAPI, testStaffData } from '../../services/MedicalSystemAPI';
import { authTokenService, setupTestAuth } from '../../services/AuthTokenService';

/**
 * 医療システムAPI統合テストパネル
 * Phase 2統合確認用
 */
export const MedicalAPITestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    staffId: string;
    name: string;
    expectedLevel: number;
    actualLevel?: number;
    status: 'pending' | 'success' | 'error';
    error?: string;
  }>>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api/v1');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed' | null>(null);

  // API接続テスト
  const testConnection = async () => {
    setConnectionStatus('checking');

    try {
      // テスト用トークンを設定
      const token = setupTestAuth();
      if (token) {
        medicalSystemAPI.setAuthToken(token);
      }

      const isConnected = await medicalSystemAPI.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      console.error('接続テストエラー:', error);
      setConnectionStatus('failed');
    }
  };

  // 全スタッフのレベル計算テスト
  const runFullTest = async () => {
    setIsTestRunning(true);

    // テスト結果を初期化
    const initialResults = testStaffData.map((staff, index) => ({
      id: `test-${index}`,
      staffId: staff.staffId,
      name: staff.name,
      expectedLevel: staff.level,
      status: 'pending' as const
    }));
    setTestResults(initialResults);

    // 各スタッフのAPIを呼び出し
    for (let i = 0; i < testStaffData.length; i++) {
      const staff = testStaffData[i];

      try {
        // テスト用トークンを生成（各スタッフ用）
        const token = authTokenService.generateMockToken(staff.staffId, staff.level);
        medicalSystemAPI.setAuthToken(token);

        // API呼び出し
        const result = await medicalSystemAPI.calculatePermissionLevel(staff.staffId);

        // 結果を更新
        setTestResults(prev => prev.map((item, index) =>
          index === i
            ? {
                ...item,
                actualLevel: result.permissionLevel,
                status: 'success'
              }
            : item
        ));
      } catch (error: any) {
        // エラーを記録
        setTestResults(prev => prev.map((item, index) =>
          index === i
            ? {
                ...item,
                status: 'error',
                error: error.message
              }
            : item
        ));
      }

      // 0.5秒の遅延（レート制限対策）
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestRunning(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          医療システムAPI統合テスト
          <span className="text-sm text-gray-500 font-normal ml-auto">
            Phase 2 Integration Test
          </span>
        </h2>

        {/* 接続設定 */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">API接続設定</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APIエンドポイント
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="http://localhost:3000/api/v1"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={testConnection}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                接続テスト
              </button>

              {connectionStatus && (
                <div className={`ml-4 flex items-center gap-2 ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {connectionStatus === 'checking' && (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>接続確認中...</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>接続成功</span>
                    </>
                  )}
                  {connectionStatus === 'failed' && (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>接続失敗</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* テスト実行 */}
        <div className="mb-6">
          <button
            onClick={runFullTest}
            disabled={isTestRunning || connectionStatus !== 'connected'}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              isTestRunning || connectionStatus !== 'connected'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTestRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                テスト実行中...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                権限レベル計算テスト実行
              </>
            )}
          </button>
        </div>

        {/* テスト結果 */}
        {testResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スタッフID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期待レベル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    計算結果
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.staffId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Lv.{result.expectedLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {result.actualLevel !== undefined ? (
                        <span className={result.actualLevel === result.expectedLevel ? 'text-green-600' : 'text-yellow-600'}>
                          Lv.{result.actualLevel}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.status === 'pending' && (
                        <span className="flex items-center gap-2 text-gray-400">
                          <AlertCircle className="w-4 h-4" />
                          待機中
                        </span>
                      )}
                      {result.status === 'success' && (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          成功
                        </span>
                      )}
                      {result.status === 'error' && (
                        <span className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">{result.error}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* サマリー */}
        {testResults.length > 0 && !isTestRunning && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">テストサマリー</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>成功: {testResults.filter(r => r.status === 'success').length}件</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>失敗: {testResults.filter(r => r.status === 'error').length}件</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span>待機: {testResults.filter(r => r.status === 'pending').length}件</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalAPITestPanel;