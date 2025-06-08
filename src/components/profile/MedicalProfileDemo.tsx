// 医療プロフィールシステムデモページ
import React, { useState } from 'react';
import MedicalProfilePage from './MedicalProfilePage';
import { MedicalProfile } from '../../types/profile';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const MedicalProfileDemo: React.FC = () => {
  // デモ用のサンプルプロフィール
  const [currentProfile, setCurrentProfile] = useState<MedicalProfile>({
    id: 'user-001',
    employeeNumber: 'EMP-2024-001',
    name: '山田 太郎',
    furigana: 'やまだ たろう',
    facility: 'kohara_hospital',
    department: 'rehabilitation_ward',
    profession: 'physical_therapist',
    position: 'supervisor',
    hireDate: '2018-04-01',
    experienceYears: 6,
    previousExperience: 3,
    totalExperience: 9,
    motto: '患者さまの笑顔が私の原動力',
    selfIntroduction: '理学療法士として9年間、患者さまの機能回復をサポートしてきました。特に脳血管疾患後のリハビリテーションを専門としており、チーム医療を大切にしながら日々取り組んでいます。',
    hobbies: ['running', 'reading', 'cooking'],
    skills: ['脳血管リハビリ', 'チーム医療', '患者指導', 'Excel'],
    profileImage: '',
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    votingWeight: 3.0,
    permissionLevel: PermissionLevel.LEVEL_3,
    approvalAuthority: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    lastProfileUpdate: '2024-06-01T00:00:00Z',
    profileCompleteRate: 90
  });

  const [showNewUser, setShowNewUser] = useState(false);

  // 新規ユーザーのプロフィール
  const newUserProfile: MedicalProfile = {
    id: 'user-002',
    employeeNumber: 'EMP-2025-002',
    name: '',
    furigana: '',
    facility: '',
    department: '',
    profession: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    experienceYears: 0,
    previousExperience: 0,
    totalExperience: 0,
    motto: '',
    selfIntroduction: '',
    hobbies: [],
    skills: [],
    votingWeight: 1.0,
    permissionLevel: PermissionLevel.LEVEL_1,
    approvalAuthority: 'basic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastProfileUpdate: new Date().toISOString(),
    profileCompleteRate: 0
  };

  const handleUpdateProfile = async (profile: MedicalProfile) => {
    console.log('プロフィール更新:', profile);
    setCurrentProfile(profile);
    // 実際の実装では、ここでAPIを呼び出してサーバーに保存
  };

  return (
    <div className="min-h-screen bg-black">
      {/* ヘッダー */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">VoiceDrive 医療プロフィールシステム</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowNewUser(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showNewUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              既存職員プロフィール
            </button>
            <button
              onClick={() => setShowNewUser(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showNewUser 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              新規職員登録
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="py-8">
        {showNewUser ? (
          <div>
            <div className="max-w-4xl mx-auto mb-6 px-4">
              <div className="bg-green-950/30 border border-green-800/30 rounded-lg p-4">
                <h2 className="text-lg font-bold text-green-300 mb-2">新規職員プロフィール作成</h2>
                <p className="text-green-200 text-sm">
                  初めてプロフィールを作成する職員の方は、以下のフォームに必要事項を入力してください。
                  入力内容に基づいて、投票重みや権限レベルが自動的に計算されます。
                </p>
              </div>
            </div>
            <MedicalProfilePage
              user={newUserProfile}
              onUpdateProfile={handleUpdateProfile}
              isEditing={true}
            />
          </div>
        ) : (
          <div>
            <div className="max-w-4xl mx-auto mb-6 px-4">
              <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-4">
                <h2 className="text-lg font-bold text-blue-300 mb-2">プロフィール管理</h2>
                <p className="text-blue-200 text-sm">
                  職員プロフィールの閲覧・編集ができます。経験年数や役職に応じて投票重みが自動計算されます。
                </p>
              </div>
            </div>
            <MedicalProfilePage
              user={currentProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}
      </div>

      {/* システム情報 */}
      <div className="bg-gray-900 border-t border-gray-800 p-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">システム機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-bold text-blue-400 mb-2">🏥 組織構造対応</h4>
              <p className="text-gray-300 text-sm">
                8つの医療・介護施設と各部署に対応した包括的な組織管理
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-bold text-green-400 mb-2">⚖️ 投票重み自動計算</h4>
              <p className="text-gray-300 text-sm">
                職種・役職・経験年数に基づく公平な投票重みシステム
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-bold text-purple-400 mb-2">🔐 8段階権限システム</h4>
              <p className="text-gray-300 text-sm">
                一般職員から経営層まで、きめ細かな権限管理
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalProfileDemo;