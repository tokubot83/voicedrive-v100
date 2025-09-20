import React, { useState } from 'react';
import {
  convertToMedicalTeamPriority,
  convertFromMedicalTeamPriority,
  getMedicalPriorityColor,
  getMedicalPriorityIcon,
  getMedicalPriorityLabel,
  VoiceDrivePriority,
  MedicalTeamPriority
} from '../utils/priorityMapping';
import MedicalIntegrationService from '../services/MedicalIntegrationService';

const MedicalIntegrationTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const integrationService = MedicalIntegrationService.getInstance();

  // VoiceDriveの優先度リスト
  const voiceDrivePriorities: VoiceDrivePriority[] = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];

  // 医療チームの優先度リスト
  const medicalTeamPriorities: MedicalTeamPriority[] = ['high', 'medium', 'low'];

  const runMappingTest = () => {
    const results: string[] = [];

    results.push('📊 優先度マッピングテスト開始');
    results.push('=====================================');

    // VoiceDrive → 医療チーム変換テスト
    results.push('\n🔄 VoiceDrive → 医療チーム マッピング:');
    voiceDrivePriorities.forEach(priority => {
      const converted = convertToMedicalTeamPriority(priority);
      const color = getMedicalPriorityColor(converted);
      const icon = getMedicalPriorityIcon(converted);
      const label = getMedicalPriorityLabel(converted);

      results.push(`  ${priority} → ${converted} ${icon} (${label})`);
    });

    // 医療チーム → VoiceDrive逆変換テスト
    results.push('\n🔄 医療チーム → VoiceDrive 逆マッピング:');
    medicalTeamPriorities.forEach(priority => {
      const converted = convertFromMedicalTeamPriority(priority);
      results.push(`  ${priority} → ${converted}`);
    });

    results.push('\n✅ マッピングテスト完了！');
    setTestResults(results);

    // コンソールにも出力
    integrationService.runPriorityMappingTest();
  };

  const sendTestAnnouncement = () => {
    const testAnnouncement = {
      id: `test_${Date.now()}`,
      title: '統合テスト: 健康診断のお知らせ',
      content: '年次健康診断を実施します。必ず受診してください。',
      category: 'HEALTH' as const,
      priority: 'HIGH' as const,
      authorId: 'system',
      authorName: '人事部',
      authorDepartment: '管理部門',
      publishAt: new Date(),
      isActive: true,
      requireResponse: true,
      targetAudience: {
        isGlobal: true,
        departments: ['全部署']
      }
    };

    integrationService.sendAnnouncementToMedicalTeam(testAnnouncement);

    const newResults = [...testResults];
    newResults.push('\n📤 テストお知らせを医療チームに送信しました');
    newResults.push(`  優先度: HIGH → ${convertToMedicalTeamPriority('HIGH')} (医療チーム形式)`);
    setTestResults(newResults);
  };

  const receiveTestNotification = () => {
    const testNotification = {
      id: `med_${Date.now()}`,
      title: '医療チームからの通知',
      message: 'ストレスチェックの結果が出ました。確認をお願いします。',
      priority: 'high' as MedicalTeamPriority,
      category: 'HEALTH',
      timestamp: new Date().toISOString(),
      data: {
        checkType: 'stress',
        resultId: 'result_123'
      }
    };

    integrationService.receiveMedicalTeamNotification(testNotification);

    const newResults = [...testResults];
    newResults.push('\n📥 医療チームからの通知を受信しました');
    newResults.push(`  優先度: high → ${convertFromMedicalTeamPriority('high')} (VoiceDrive形式)`);
    setTestResults(newResults);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🏥 医療チーム統合テスト
          </h1>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              優先度マッピング仕様
            </h2>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• URGENT + HIGH → high（緊急・重要は同じ扱い）</p>
              <p>• NORMAL → medium（通常）</p>
              <p>• LOW → low（低優先度）</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runMappingTest}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🧪 マッピングテスト実行
            </button>

            <button
              onClick={sendTestAnnouncement}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📤 お知らせ送信テスト
            </button>

            <button
              onClick={receiveTestNotification}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              📥 通知受信テスト
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            テスト結果
          </h2>

          {testResults.length === 0 ? (
            <p className="text-gray-500">テストを実行してください</p>
          ) : (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {testResults.join('\n')}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            優先度マッピング表
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VoiceDrive → 医療チーム */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-center bg-blue-100 p-2 rounded">
                VoiceDrive → 医療チーム
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">VoiceDrive</th>
                    <th className="text-center p-2">→</th>
                    <th className="text-right p-2">医療チーム</th>
                  </tr>
                </thead>
                <tbody>
                  {voiceDrivePriorities.map(vp => {
                    const mp = convertToMedicalTeamPriority(vp);
                    const color = getMedicalPriorityColor(mp);
                    const icon = getMedicalPriorityIcon(mp);
                    const label = getMedicalPriorityLabel(mp);
                    return (
                      <tr key={vp} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{vp}</td>
                        <td className="text-center p-2">→</td>
                        <td className="p-2 text-right">
                          <span style={{ color }} className="font-semibold">
                            {icon} {mp} ({label})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 医療チーム → VoiceDrive */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-center bg-green-100 p-2 rounded">
                医療チーム → VoiceDrive
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">医療チーム</th>
                    <th className="text-center p-2">→</th>
                    <th className="text-right p-2">VoiceDrive</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalTeamPriorities.map(mp => {
                    const vp = convertFromMedicalTeamPriority(mp);
                    const color = getMedicalPriorityColor(mp);
                    const icon = getMedicalPriorityIcon(mp);
                    const label = getMedicalPriorityLabel(mp);
                    return (
                      <tr key={mp} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <span style={{ color }} className="font-semibold">
                            {icon} {mp} ({label})
                          </span>
                        </td>
                        <td className="text-center p-2">→</td>
                        <td className="p-2 text-right font-mono">{vp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalIntegrationTestPage;