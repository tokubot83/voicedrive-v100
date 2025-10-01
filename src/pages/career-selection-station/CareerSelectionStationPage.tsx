/**
 * CareerSelectionStationPage.tsx
 * キャリア選択ステーション - マイキャリア情報画面
 *
 * 職員の現在のキャリアコース情報を表示し、
 * コース変更申請や申請状況確認へのナビゲーションを提供
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CareerCourseCard } from '../../components/career-course/CareerCourseCard';
import { CareerCourseSelection } from '../../types/career-course';
import { FileText, Clock, User, Briefcase, Building2, Calendar, AlertCircle } from 'lucide-react';
import { useDemoMode } from '../../components/demo/DemoModeController';
import { WebhookTestPanel } from '../../components/career-course/WebhookTestPanel';
import { MobileFooter } from '../../components/layout/MobileFooter';

interface StaffInfo {
  id: string;
  name: string;
  facility: string;
  department: string;
  position: string;
  joinDate: string;
  careerCourse?: CareerCourseSelection;
}

export const CareerSelectionStationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isDemoMode } = useDemoMode();
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'info'>('dashboard');

  useEffect(() => {
    fetchStaffInfo();
  }, []);

  const fetchStaffInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: 実際のAPIエンドポイントに置き換える
      // const response = await fetch('/api/my-page', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setStaffInfo(data);

      // モックデータ（開発用）
      setTimeout(() => {
        const mockData: StaffInfo = {
          id: isDemoMode ? currentUser.id : 'OH-NS-2021-001',
          name: isDemoMode ? currentUser.name : '山田 花子',
          facility: isDemoMode ? currentUser.facility : '小原病院',
          department: isDemoMode ? currentUser.department : '3階病棟',
          position: isDemoMode ? currentUser.position : '看護師',
          joinDate: '2021-04-01',
          careerCourse: {
            id: 'cc-001',
            staffId: isDemoMode ? currentUser.id : 'OH-NS-2021-001',
            courseCode: 'B',
            courseName: 'Bコース（施設内協力型）',
            effectiveFrom: '2025-04-01',
            effectiveTo: null,
            nextChangeAvailableDate: '2026-03-01',
            specialChangeReason: null,
            specialChangeNote: null,
            changeRequestedAt: null,
            changeRequestedBy: null,
            approvedAt: '2025-03-20T10:00:00Z',
            approvedBy: 'HR-001',
            approvalStatus: 'approved',
            rejectionReason: null,
            createdAt: '2025-03-15T09:00:00Z',
            updatedAt: '2025-03-20T10:00:00Z'
          }
        };
        setStaffInfo(mockData);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('職員情報の取得に失敗しました');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !staffInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">エラーが発生しました</h3>
              <p className="text-slate-600 mb-4">{error || '職員情報が見つかりません'}</p>
              <button
                onClick={fetchStaffInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                再試行
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        {/* 固定ヘッダーコンテナ */}
        <div className="sticky top-0 z-30">
          {/* ヘッダー */}
          <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3 text-3xl">🎯</span>
                  キャリア選択ステーション
                </h1>
                <p className="text-gray-400 text-sm">あなたのキャリアコース情報と申請管理</p>
              </div>
            </div>
          </header>

          {/* タブナビゲーション */}
          <div className="bg-slate-900 border-b border-gray-700">
            <div className="px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  マイキャリア
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'requests'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  申請管理
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  制度について
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">

        {/* マイキャリアタブ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 職員基本情報カード */}
          <Card className="lg:col-span-1">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800">
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                職員情報
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {staffInfo.name.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{staffInfo.name}</div>
                  <div className="text-sm text-slate-600">ID: {staffInfo.id}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{staffInfo.facility}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{staffInfo.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{staffInfo.position}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">
                    入職日: {new Date(staffInfo.joinDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* キャリアコースカード */}
          <div className="lg:col-span-2">
            {staffInfo.careerCourse ? (
              <CareerCourseCard
                careerCourse={staffInfo.careerCourse}
                onChangeRequest={() => navigate('/career-selection-station/change-request')}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    キャリアコースが未設定です
                  </h3>
                  <p className="text-slate-600 mb-4">
                    人事部にお問い合わせください
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* コース変更申請 */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-400"
            onClick={() => navigate('/career-selection-station/change-request')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">コース変更申請</h3>
                  <p className="text-sm text-slate-600">新しいコースへの変更を申請</p>
                </div>
                <div className="text-slate-400">→</div>
              </div>
            </CardContent>
          </Card>

          {/* 申請状況確認 */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-green-400"
            onClick={() => navigate('/career-selection-station/my-requests')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">申請状況確認</h3>
                  <p className="text-sm text-slate-600">過去の申請履歴と審査結果</p>
                </div>
                <div className="text-slate-400">→</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhook通知テストパネル（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && <WebhookTestPanel />}
          </div>
        )}

        {/* 申請管理タブ */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* クイックアクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* コース変更申請 */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-400"
                onClick={() => navigate('/career-selection-station/change-request')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800">コース変更申請</h3>
                      <p className="text-sm text-slate-600">新しいコースへの変更を申請</p>
                    </div>
                    <div className="text-slate-400">→</div>
                  </div>
                </CardContent>
              </Card>

              {/* 申請状況確認 */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-green-400"
                onClick={() => navigate('/career-selection-station/my-requests')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800">申請状況確認</h3>
                      <p className="text-sm text-slate-600">過去の申請履歴と審査結果</p>
                    </div>
                    <div className="text-slate-400">→</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 制度についてタブ */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-1">ℹ️</div>
                  <div className="space-y-2 text-sm text-blue-800">
                    <h4 className="font-semibold">キャリア選択制度について</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>コースは年1回（毎年3月）の定期変更が可能です</li>
                      <li>妊娠・出産、介護、疾病等の特例事由がある場合は即時変更可能です</li>
                      <li>変更申請は人事部の審査が必要です（通常2週間程度）</li>
                      <li>詳しい制度内容は人事部までお問い合わせください</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

          </div>
        </div>
      </div>
      <MobileFooter />
    </>
  );
};