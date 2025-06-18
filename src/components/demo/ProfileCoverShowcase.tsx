import React from 'react';
import ProfileCover from '../profile/ProfileCover';
import Avatar from '../common/Avatar';
import { generatePersonalAvatar } from '../../utils/avatarGenerator';

const ProfileCoverShowcase: React.FC = () => {
  // デモ用のユーザーデータ
  const demoUsers = [
    { id: '1', name: '山田太郎', department: '医局', position: '主任医師' },
    { id: '2', name: '佐藤花子', department: '看護部', position: '看護師長' },
    { id: '3', name: '田中一郎', department: 'リハビリテーション科', position: 'PT主任' },
    { id: '4', name: '鈴木美咲', department: '事務部', position: '係長' },
    { id: '5', name: '高橋健', department: '経営企画部', position: '部長' },
    { id: '6', name: '渡辺恵', department: '薬剤部', position: '薬剤師' },
    { id: '7', name: '伊藤誠', department: '総務部', position: '主任' },
    { id: '8', name: '加藤美穂', department: '人事部', position: '課長' }
  ];

  const facilities = ['小原病院', '立神リハ温泉病院', '本部'];
  const heights: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">プロフィールカバー画像 ショーケース</h1>
      
      {/* 個人プロフィール */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">個人プロフィールカバー</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* カバー画像 */}
              <ProfileCover user={user} height="lg" />
              
              {/* プロフィール情報 */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    avatarData={generatePersonalAvatar(user)}
                    size="lg"
                    className="-mt-8 border-4 border-white shadow-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.position}</p>
                    <p className="text-sm text-gray-500">{user.department}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 施設レベルカバー */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">施設レベルカバー</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facilities.map(facility => (
            <div key={facility} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <ProfileCover facility={facility} height="lg" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{facility}</h3>
                <p className="text-sm text-gray-600 mt-2">医療法人社団 高峰会</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* サイズバリエーション */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">サイズバリエーション</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {heights.map(height => (
              <div key={height} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase">{height}</h3>
                <ProfileCover 
                  user={demoUsers[0]} 
                  height={height}
                  className="w-full max-w-2xl"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* パターンタイプ別 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">パターンタイプ別表示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 波パターン */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ProfileCover user={demoUsers[1]} height="md" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">波パターン</h3>
              <p className="text-sm text-gray-600">看護部・人事部</p>
            </div>
          </div>
          
          {/* 幾何学パターン */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ProfileCover user={demoUsers[0]} height="md" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">幾何学パターン</h3>
              <p className="text-sm text-gray-600">医局・事務部</p>
            </div>
          </div>
          
          {/* 抽象パターン */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ProfileCover user={demoUsers[2]} height="md" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">抽象パターン</h3>
              <p className="text-sm text-gray-600">リハビリ・施設管理</p>
            </div>
          </div>
          
          {/* グラデーション */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ProfileCover user={demoUsers[4]} height="md" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">純粋グラデーション</h3>
              <p className="text-sm text-gray-600">経営企画・薬剤部</p>
            </div>
          </div>
        </div>
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibent mb-6 text-gray-700">ホバー効果デモ</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-4">マウスを乗せると光沢効果が表示されます</p>
          <ProfileCover 
            user={demoUsers[0]} 
            height="xl"
            className="w-full max-w-4xl cursor-pointer"
          />
        </div>
      </section>
    </div>
  );
};

export default ProfileCoverShowcase;