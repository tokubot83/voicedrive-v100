import React from 'react';
import Avatar from '../common/Avatar';
import { generatePersonalAvatar, generateDepartmentAvatar, generateFacilityAvatar, generateAnonymousAvatar } from '../../utils/avatarGenerator';

const AvatarShowcase: React.FC = () => {
  // デモ用のユーザーデータ
  const demoUsers = [
    { id: '1', name: '山田太郎', department: '医局', position: '主任医師', facility: '小原病院' },
    { id: '2', name: '佐藤花子', department: '看護部', position: '看護師長', facility: '小原病院' },
    { id: '3', name: '田中一郎', department: 'リハビリテーション科', position: 'PT主任', facility: '立神リハ温泉病院' },
    { id: '4', name: '鈴木美咲', department: '事務部', position: '係長', facility: '小原病院' },
    { id: '5', name: '高橋健', department: '経営企画部', position: '部長', facility: '本部' }
  ];

  const sizes: ('xs' | 'sm' | 'md' | 'lg' | 'xl')[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">VoiceDrive アバターシステム ショーケース</h1>
      
      {/* 個人アバター */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">個人アバター（実名表示）</h2>
        <div className="grid grid-cols-5 gap-8">
          {demoUsers.map(user => (
            <div key={user.id} className="text-center">
              <h3 className="text-sm font-medium mb-4">{user.name}</h3>
              <div className="flex flex-col items-center gap-4">
                {sizes.map(size => (
                  <Avatar 
                    key={size}
                    avatarData={generatePersonalAvatar(user)}
                    size={size}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 部署レベルアバター */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">部署レベルアバター</h2>
        <div className="grid grid-cols-5 gap-8">
          {['医局', '看護部', 'リハビリテーション科', '事務部', '経営企画部'].map(dept => (
            <div key={dept} className="text-center">
              <h3 className="text-sm font-medium mb-4">{dept}</h3>
              <div className="flex flex-col items-center gap-4">
                {sizes.map(size => (
                  <Avatar 
                    key={size}
                    avatarData={generateDepartmentAvatar(dept)}
                    size={size}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 施設レベルアバター */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">施設レベルアバター</h2>
        <div className="grid grid-cols-3 gap-8">
          {['小原病院', '立神リハ温泉病院', '本部'].map(facility => (
            <div key={facility} className="text-center">
              <h3 className="text-sm font-medium mb-4">{facility}</h3>
              <div className="flex flex-col items-center gap-4">
                {sizes.map(size => (
                  <Avatar 
                    key={size}
                    avatarData={generateFacilityAvatar(facility)}
                    size={size}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 匿名アバター */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">匿名アバター</h2>
        <div className="grid grid-cols-5 gap-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="text-center">
              <h3 className="text-sm font-medium mb-4">匿名 {i}</h3>
              <div className="flex flex-col items-center gap-4">
                {sizes.map(size => (
                  <Avatar 
                    key={size}
                    avatarData={generateAnonymousAvatar(`post-${i}`)}
                    size={size}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ホバー効果デモ */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">ホバー効果デモ（マウスを乗せてください）</h2>
        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <p className="text-sm mb-2">個人アバター</p>
            <Avatar 
              avatarData={generatePersonalAvatar(demoUsers[0])}
              size="xl"
            />
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">部署アバター</p>
            <Avatar 
              avatarData={generateDepartmentAvatar('看護部')}
              size="xl"
            />
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">施設アバター</p>
            <Avatar 
              avatarData={generateFacilityAvatar('立神リハ温泉病院')}
              size="xl"
            />
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">匿名アバター</p>
            <Avatar 
              avatarData={generateAnonymousAvatar('demo-post')}
              size="xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AvatarShowcase;