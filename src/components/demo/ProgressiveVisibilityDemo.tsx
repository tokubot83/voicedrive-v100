import React, { useState } from 'react';
import { Users, Building, Building2, Eye, Vote, MessageCircle, AlertTriangle, Info } from 'lucide-react';
import { facilityDemoUsers } from '../../data/demo/facilityDemoUsers';
import { votingPermissionExamples, accessLevelDescriptions } from '../../data/demo/progressiveVisibilityPosts';

interface VisibilityDemoProps {
  currentUserId?: string;
}

const ProgressiveVisibilityDemo: React.FC<VisibilityDemoProps> = ({ 
  currentUserId = 'user-rehab-001' 
}) => {
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  
  const currentUser = facilityDemoUsers.find(u => u.id === selectedUser);
  const userPermissions = votingPermissionExamples[selectedUser as keyof typeof votingPermissionExamples];
  
  if (!currentUser || !userPermissions) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
        <p className="text-red-700">選択されたユーザーのデモデータが見つかりません。</p>
      </div>
    );
  }

  const getFacilityIcon = (facilityId: string) => {
    switch (facilityId) {
      case 'tategami-rehab-hospital':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'kohara-hospital':
        return <Building className="w-4 h-4 text-purple-500" />;
      case 'headquarters':
        return <Building className="w-4 h-4 text-orange-500" />;
      default:
        return <Building className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'full':
        return <Vote className="w-4 h-4 text-green-500" />;
      case 'limited':
        return <MessageCircle className="w-4 h-4 text-yellow-500" />;
      case 'view_only':
        return <Eye className="w-4 h-4 text-gray-500" />;
      case 'hidden':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'full':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'view_only':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'hidden':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // サンプル投稿
  const samplePosts = [
    {
      id: 'progressive-dept-001',
      title: '立神リハ温泉病院のリハビリ科：音声認識システム導入',
      level: '部署プロジェクト',
      facility: '立神リハ温泉病院',
      department: 'リハビリテーション科'
    },
    {
      id: 'progressive-dept-002',
      title: '小原病院の看護部：IoTセンサー見守りシステム',
      level: '部署プロジェクト',
      facility: '小原病院',
      department: '看護部'
    },
    {
      id: 'progressive-facility-001',
      title: '小原病院全体：DX推進プロジェクト',
      level: '施設プロジェクト',
      facility: '小原病院',
      department: '全部署'
    },
    {
      id: 'progressive-corporate-001',
      title: '法人全体：働き方改革プロジェクト',
      level: '法人プロジェクト',
      facility: '全施設',
      department: '全部署'
    },
    {
      id: 'progressive-pending-001',
      title: '立神リハ温泉病院の温泉療法科：成分分析デジタル化',
      level: 'PENDING状態',
      facility: '立神リハ温泉病院',
      department: '温泉療法科'
    },
    {
      id: 'progressive-emergency-001',
      title: '緊急エスカレーション：感染症対策強化',
      level: '緊急対応',
      facility: '全施設',
      department: '全部署'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ユーザー選択 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          デモユーザー選択
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilityDemoUsers.slice(0, 12).map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedUser === user.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getFacilityIcon(user.facility_id!)}
                <span className="font-medium text-sm">{user.name}</span>
              </div>
              <div className="text-xs text-gray-600">
                {user.department} · Level {user.hierarchyLevel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 現在のユーザー情報 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          選択中ユーザー: {currentUser.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">所属施設:</span>
            <div className="flex items-center gap-1 mt-1">
              {getFacilityIcon(currentUser.facility_id!)}
              <span>{currentUser.facility_id === 'tategami-rehab-hospital' ? '立神リハ温泉病院' : 
                     currentUser.facility_id === 'kohara-hospital' ? '小原病院' : '本部'}</span>
            </div>
          </div>
          <div>
            <span className="font-medium text-blue-700">所属部署:</span>
            <p className="mt-1">{currentUser.department}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">役職:</span>
            <p className="mt-1">{currentUser.role}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">権限レベル:</span>
            <p className="mt-1">Level {currentUser.hierarchyLevel}</p>
          </div>
        </div>
      </div>

      {/* 投稿別アクセス権限表 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          段階的投稿公開システム - アクセス権限一覧
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">投稿</th>
                <th className="border border-gray-300 px-4 py-2 text-left">レベル</th>
                <th className="border border-gray-300 px-4 py-2 text-left">対象施設・部署</th>
                <th className="border border-gray-300 px-4 py-2 text-left">アクセス権限</th>
                <th className="border border-gray-300 px-4 py-2 text-left">理由</th>
              </tr>
            </thead>
            <tbody>
              {samplePosts.map((post) => {
                const permission = userPermissions[post.id as keyof typeof userPermissions];
                
                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="font-medium text-sm">{post.title}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {post.level}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <div>{post.facility}</div>
                      <div className="text-gray-600">{post.department}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {permission ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${getAccessLevelColor(permission.accessLevel)}`}>
                          {getAccessLevelIcon(permission.accessLevel)}
                          <span className="text-xs font-medium">
                            {accessLevelDescriptions[permission.accessLevel as keyof typeof accessLevelDescriptions]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">データなし</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">
                      {permission?.reason || 'データなし'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 権限説明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">アクセスレベルの説明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(accessLevelDescriptions).map(([level, description]) => (
            <div key={level} className="flex items-center gap-2">
              {getAccessLevelIcon(level)}
              <span className="font-medium">{description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* システム説明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold mb-3 text-yellow-800">段階的投稿公開システムのポイント</h4>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>• <strong>PENDING状態</strong>: 同じ部署内でのみ投票可能</li>
          <li>• <strong>部署プロジェクト</strong>: 同じ施設内の他部署が投票可能、他施設は閲覧のみ</li>
          <li>• <strong>施設プロジェクト</strong>: 同じ施設内全体が投票可能、他施設は閲覧のみ</li>
          <li>• <strong>法人プロジェクト</strong>: 全施設・全職員が投票可能</li>
          <li>• <strong>緊急エスカレーション</strong>: Level 7-8の権限で段階をスキップして昇格</li>
          <li>• 投稿した部署の職員は、プロジェクト化後は投票権限を失う（二重投票防止）</li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressiveVisibilityDemo;